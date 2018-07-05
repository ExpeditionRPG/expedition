import Redux from 'redux';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {ParserNode, TemplateContext} from '../components/views/quest/cardtemplates/TemplateTypes';
import {MIN_FEEDBACK_LENGTH} from '../Constants';
import {AUTH_SETTINGS} from '../Constants';
import {getAppVersion, getDevicePlatform, getPlatformDump} from '../Globals';
import {logEvent} from '../Logging';
import {getLogBuffer} from '../Logging';
import {MultiplayerCounters} from '../Multiplayer';
import {QuestDetails} from '../reducers/QuestTypes';
import {AppState, FeedbackType, QuestState, SettingsType, UserQuestsType, UserState} from '../reducers/StateTypes';
import {remoteify, UserQuestsAction} from './ActionTypes';
import {toCard} from './Card';
import {initQuest} from './Quest';
import {openSnackbar} from './Snackbar';
import {ensureLogin, userQuestsDelta} from './User';

declare var require: any;
const cheerio = require('cheerio') as CheerioAPI;

// fetch can be used for anything except local files, so anything that might download from file://
// (aka quests) should use this instead
export function fetchLocal(url: string) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      resolve(request.response);
    };
    request.onerror = () => {
      reject(new Error('network error'));
    };
    request.open('GET', url);
    request.send();
  });
}

export function fetchUserQuests() {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(AUTH_SETTINGS.URL_BASE + '/user/quests', {
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
      method: 'GET',
    })
    .then(handleFetchErrors)
    .then((response: Response) => response.json())
    .then((quests: UserQuestsType) => {
      dispatch({type: 'USER_QUESTS', quests} as UserQuestsAction);
    })
    .catch((error: Error) => {
      console.error('Request for quest plays failed', error);
    });
  };
}

export const fetchQuestXML = remoteify(function fetchQuestXML(details: QuestDetails, dispatch: Redux.Dispatch<any>) {
  const promise = fetchLocal(details.publishedurl).then((result: string) => {
    const questNode = cheerio.load(result)('quest');
    return dispatch(loadQuestXML({details, questNode, ctx: defaultContext()}));
  })
  .catch((e: Error) => {
    return dispatch(openSnackbar(Error('Network error: Please check your connection.')));
  });

  return {...details, promise};
});

// for loading quests in the app - Quest Creator injects directly into initQuest
function loadQuestXML(a: {details: QuestDetails, questNode: Cheerio, ctx: TemplateContext}) {
  return (dispatch: Redux.Dispatch<any>) => {
    dispatch(initQuest(a.details, a.questNode, a.ctx));

    // Quest start logging is here instead of initQuest because initQuest is also used by the QC / would over-report.
    // Logging done after quest initialized so that the new quest info is in the state (logQuestPlay pulls from state).
    logEvent('quest_start', { ...a.details, action: a.details.title, label: a.details.id });
    logQuestPlay({phase: 'start'});

    const firstNode = a.questNode.children().eq(0);
    const node = new ParserNode(firstNode, a.ctx);

    if (node.elem[0].attribs.skipsetup) {
      dispatch(toCard({name: 'QUEST_CARD'}));
    } else {
      dispatch(toCard({name: 'QUEST_SETUP'}));
    }
  };
}

export function logQuestPlay(a: {phase: 'start'|'end'}) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppState) => {
    try {
      const state = getState();
      const quest = state.quest.details;
      const data = {
        difficulty: state.settings.difficulty,
        email: state.user.email,
        name: state.user.name,
        platform: getDevicePlatform(),
        players: state.settings.numPlayers,
        questid: quest.id,
        questversion: quest.questversion,
        userid: state.user.id,
        version: getAppVersion(),
      };
      fetch(AUTH_SETTINGS.URL_BASE + '/analytics/quest/' + a.phase, {
        body: JSON.stringify(data),
        method: 'POST',
      })
      .then(handleFetchErrors)
      .catch((error: Error) => {
        logEvent('analytics_quest_err', { label: error });
      });

      if (a.phase === 'end') {
        dispatch(userQuestsDelta({
          [quest.id]: {
            lastPlayed: new Date(),
          },
        }));
      }
    } catch (err) {
      // Fail silently
    }
  };
}

export function subscribe(a: {email: string}) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(AUTH_SETTINGS.URL_BASE + '/user/subscribe', {
      body: JSON.stringify({email: a.email}),
      method: 'POST',
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      return response.text();
    })
    .then((data: string) => {
      logEvent('user_subscribe', {});
      dispatch(openSnackbar('Thank you for subscribing!'));
    }).catch((error: Error) => {
      dispatch(openSnackbar(Error('Error subscribing: ' + error.toString())));
    });
  };
}

export function submitUserFeedback(a: {quest: QuestState, settings: SettingsType, user: UserState, type: FeedbackType, anonymous: boolean, text: string, rating: number|null}) {
  return (dispatch: Redux.Dispatch<any>) => {
    if (a.rating && a.rating < 3 && (!a.text || a.text.length < MIN_FEEDBACK_LENGTH)) {
      return alert('Sounds like the quest needs work! Please provide feedback of at least ' + MIN_FEEDBACK_LENGTH + ' characters to help the author improve.');
    } else if (a.text.length > 0 && a.text.length < MIN_FEEDBACK_LENGTH) {
      return alert('Reviews must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value to authors.');
    }

    let data: any = {
      anonymous: a.anonymous,
      difficulty: a.settings.difficulty,
      email: a.user.email,
      name: a.user.name,
      partition: a.quest.details.partition,
      platform: getDevicePlatform(),
      platformDump: getPlatformDump(),
      players: a.settings.numPlayers,
      questid: a.quest.details.id,
      rating: a.rating,
      text: a.text,
      userid: a.user.id,
      version: getAppVersion(),
    };

    // If we're not rating, we're providing other feedback.
    // Provide a snapshot of the console to facilitate bug-hunting
    if (!a.rating) {
      data.console = getLogBuffer();
    }

    dispatch(ensureLogin())
    .then((user: UserState) => {
      data = {...data,
        email: user.email,
        name: user.name,
        userid: user.id,
      };
      return dispatch(postUserFeedback(a.type, data));
    });
  };
}

export function handleFetchErrors(response: any) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

function postUserFeedback(type: string, data: any) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(AUTH_SETTINGS.URL_BASE + '/quest/feedback/' + type, {
      body: JSON.stringify(data),
      method: 'POST',
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      return response.text();
    })
    .then((response: string) => {
      logEvent('user_feedback_' + type, { label: data.questid, value: data.rating });
      dispatch(openSnackbar('Submission successful. Thank you!'));
    })
    .catch((error: Error) => {
      logEvent('user_feedback_' + type + '_err', { label: error });
      dispatch(openSnackbar(Error('Error submitting review: ' + error.toString())));
    });
  };
}

export function logMultiplayerStats(user: UserState, quest: QuestDetails, stats: MultiplayerCounters): Promise<Response> {
  try {
    const data = {
      console: getLogBuffer(),
      data: stats,
      email: user.email,
      name: user.name,
      platform: getDevicePlatform(),
      questid: quest.id,
      questversion: quest.questversion,
      userid: user.id,
      version: getAppVersion(),
    };

    return fetch(AUTH_SETTINGS.URL_BASE + '/analytics/multiplayer/stats', {
      body: JSON.stringify(data),
      method: 'POST',
    })
    .then(handleFetchErrors)
    .catch((error: Error) => {
      logEvent('analytics_quest_err', { label: error });
    });
  } catch (e) {
    console.error('Failed to log multiplayer stats');
    return Promise.resolve(new Response(''));
  }
}

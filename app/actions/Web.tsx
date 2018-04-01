import Redux from 'redux'
import {authSettings} from '../Constants'
import {toCard} from './Card'
import {searchAndPlay} from './Search'
import {initQuest} from './Quest'
import {login} from './User'
import {setAnnouncement} from './Announcement'
import {openSnackbar} from './Snackbar'
import {userFeedbackClear} from './UserFeedback'
import {SettingsType, QuestState, UserState, UserFeedbackState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {getDevicePlatform, getPlatformDump, getAppVersion} from '../Globals'
import {logEvent} from '../Main'
import {getStore} from '../Store'
import {TemplateContext, ParserNode} from '../cardtemplates/TemplateTypes'
import {defaultContext} from '../cardtemplates/Template'
import {remoteify} from './ActionTypes'
import {MIN_FEEDBACK_LENGTH} from '../Constants'
import {RemotePlayCounters} from '../RemotePlay'
import {getLogBuffer} from '../Console'

declare var window:any;
declare var require:any;
const cheerio = require('cheerio') as CheerioAPI;

// fetch can be used for anything except local files, so anything that might download from file://
// (aka quests) should use this instead
export function fetchLocal(url: string) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = function() {
      resolve(request.response);
    }
    request.onerror = () => {
      reject(new Error('network error'));
    }
    request.open('GET', url);
    request.send();
  });
}

export const fetchQuestXML = remoteify(function fetchQuestXML(details: QuestDetails, dispatch: Redux.Dispatch<any>) {
  const promise = fetchLocal(details.publishedurl).then((result: string) => {
    const questNode = cheerio.load(result)('quest');
    return dispatch(loadQuestXML({details, questNode, ctx: defaultContext()}));
  })
  .catch((e: Error) => {
    return dispatch(openSnackbar('Network error: Please check your connection.'));
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
  }
}

export function logQuestPlay(a: {phase: 'start'|'end'}) {
  try {
    const state = getStore().getState();
    const data = {
      questid: state.quest.details.id,
      questversion: state.quest.details.questversion,
      userid: state.user.id,
      players: state.settings.numPlayers,
      difficulty: state.settings.difficulty,
      platform: getDevicePlatform(),
      version: getAppVersion(),
      email: state.user.email,
      name: state.user.name,
    };

    fetch(authSettings.urlBase + '/analytics/quest/' + a.phase, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      .then(handleFetchErrors)
      .catch((error: Error) => {
        logEvent('analytics_quest_err', { label: error });
      });
  } catch (err) {
    // Fail silently
  }
}

export function subscribe(a: {email: string}) {
  return (dispatch: Redux.Dispatch<any>) => {
    fetch(authSettings.urlBase + '/user/subscribe', {
      method: 'POST',
      body: JSON.stringify({email: a.email}),
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      return response.text();
    })
    .then((data: string) => {
      logEvent('user_subscribe', {});
      dispatch(openSnackbar('Thank you for subscribing!'));
    }).catch((error: Error) => {
      dispatch(openSnackbar('Error subscribing: ' + error));
    });
  };
}

export function submitUserFeedback(a: {quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState}) {
  return (dispatch: Redux.Dispatch<any>) => {
    if (a.userFeedback.rating && a.userFeedback.rating < 3 && (!a.userFeedback.text || a.userFeedback.text.length < MIN_FEEDBACK_LENGTH)) {
      return alert('Sounds like the quest needs work! Please provide feedback of at least ' + MIN_FEEDBACK_LENGTH + ' characters to help the author improve.');
    } else if (a.userFeedback.text.length > 0 && a.userFeedback.text.length < MIN_FEEDBACK_LENGTH) {
      return alert('Reviews must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value to authors.');
    }

    let data: any = {
      partition: a.quest.details.partition,
      questid: a.quest.details.id,
      userid: a.user.id,
      players: a.settings.numPlayers,
      difficulty: a.settings.difficulty,
      platform: getDevicePlatform(),
      platformDump: getPlatformDump(),
      version: getAppVersion(),
      email: a.user.email,
      name: a.user.name,
      rating: a.userFeedback.rating,
      text: a.userFeedback.text,
      anonymous: a.userFeedback.anonymous,
    };

    // If we're not rating, we're providing other feedback.
    // Provide a snapshot of the console to facilitate bug-hunting
    if (!a.userFeedback.rating) {
      data.console = getLogBuffer();
    }

    if (!a.user || !a.user.loggedIn) {
      dispatch(login({callback: (user: UserState) => {
        data = {...data,
          userid: user.id,
          email: user.email,
          name: user.name,
        };
        dispatch(postUserFeedback(a.userFeedback.type, data));
      }}));
    } else {
      dispatch(postUserFeedback(a.userFeedback.type, data));
    }
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
    fetch(authSettings.urlBase + '/quest/feedback/' + type, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      .then(handleFetchErrors)
      .then((response: Response) => {
        return response.text();
      })
      .then((response: string) => {
        logEvent('user_feedback_' + type, { label: data.questid, value: data.rating });
        dispatch(userFeedbackClear());
        dispatch(openSnackbar('Submission successful. Thank you!'));
      }).catch((error: Error) => {
        logEvent('user_feedback_' + type + '_err', { label: error });
        dispatch(openSnackbar('Error submitting review: ' + error));
      });
  };
}

export function logRemotePlayStats(user: UserState, quest: QuestDetails, stats: RemotePlayCounters): Promise<Response> {
  try {
    const state = getStore().getState();
    const data = {
      questid: quest.id,
      questversion: quest.questversion,
      userid: user.id,
      platform: getDevicePlatform(),
      version: getAppVersion(),
      email: user.email,
      name: user.name,
      data: stats,
      console: getLogBuffer(),
    };

    return fetch(authSettings.urlBase + '/analytics/remoteplay/stats', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      .then(handleFetchErrors)
      .catch((error: Error) => {
        logEvent('analytics_quest_err', { label: error });
      });
  } catch(e) {
    console.error('Failed to log remote play stats');
    return Promise.resolve(new Response(''));
  }
}

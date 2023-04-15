import Redux from 'redux';
import {fetchLocal, handleFetchErrors} from 'shared/requests';
import {VERSION} from 'shared/schema/Constants';
import {Quest} from 'shared/schema/Quests';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {ParserNode, TemplateContext} from '../components/views/quest/cardtemplates/TemplateTypes';
import {AUTH_SETTINGS} from '../Constants';
import {MIN_FEEDBACK_LENGTH} from '../Constants';
import {getDevicePlatform, getPlatformDump} from '../Globals';
import {getLogBuffer} from '../Logging';
import {logEvent} from '../Logging';
import {getCounters} from '../multiplayer/Counters';
import {remoteify} from '../multiplayer/Remoteify';
import {AppState, FeedbackType, QuestState, SettingsType, UserQuestsType, UserState} from '../reducers/StateTypes';
import {UserQuestsAction} from './ActionTypes';
import {toCard} from './Card';
import {initQuest} from './Quest';
import {userQuestsDelta} from './QuestHistory';
import {numPlayers} from './Settings';
import {openSnackbar} from './Snackbar';

declare var require: any;
const cheerio = require('cheerio') as CheerioAPI;

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

export interface FetchQuestXMLArgs {
  details: Quest;
  seed?: string;
}
export const fetchQuestXML = remoteify(function fetchQuestXML(a: FetchQuestXMLArgs, dispatch: Redux.Dispatch<any>) {
  const ctx = defaultContext();
  const promise = fetchLocal(a.details.publishedurl).then((result: string) => {
    const questNode = cheerio.load(result)('quest');
    if (a.seed) {
      ctx.seed = a.seed;
    }
    return dispatch(loadQuestXML({details: a.details, questNode, ctx}));
  })
  .catch((e: Error) => {
    return dispatch(openSnackbar(Error('Network error fetching quest: Please check your connection.'), true));
  });

  return {...a, seed: ctx.seed, promise};
});

// for loading quests in the app - Quest Creator injects directly into initQuest.
export function loadQuestXML(a: {details: Quest, questNode: Cheerio, ctx: TemplateContext}) {
  return (dispatch: Redux.Dispatch<any>) => {
    dispatch(initQuest(a.details, a.questNode, a.ctx));

    // Quest start logging is here instead of initQuest because initQuest is also used by the QC / would over-report.
    // Logging done after quest initialized so that the new quest info is in the state (logQuestPlay pulls from state).
    logEvent('quest', 'quest_start', { ...a.details, action: a.details.title, label: a.details.id });
    dispatch(logQuestPlay({phase: 'start'}));

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
      if (!state.quest) {
        return;
      }
      const quest = state.quest.details;
      const data = {
        difficulty: state.settings.difficulty,
        email: state.user.email,
        name: state.user.name,
        platform: getDevicePlatform(),
        players: numPlayers(state.settings, state.multiplayer),
        questid: quest.id,
        questversion: quest.questversion,
        userid: state.user.id,
        version: VERSION,
      };
      fetch(AUTH_SETTINGS.URL_BASE + '/analytics/quest/' + a.phase, {
        body: JSON.stringify(data),
        method: 'POST',
      })
      .then(handleFetchErrors)
      .catch((error: Error) => {
        console.error(error);
        logEvent('error', 'analytics_quest_err', { label: error });
      });

      if (a.phase === 'end') {
        dispatch(userQuestsDelta({
          [quest.id]: {
            details: quest,
            lastPlayed: new Date(),
          },
        }));
      }
    } catch (err) {
      // Fail silently
      console.error(err);
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
      logEvent('valuable', 'user_subscribe', {});
      dispatch(openSnackbar('Thank you for subscribing!'));
    }).catch((error: Error) => {
      dispatch(openSnackbar(Error('Error subscribing: ' + error.toString())));
    });
  };
}

export function submitUserFeedback(a: {quest: QuestState, settings: SettingsType, user: UserState, type: FeedbackType, anonymous: boolean, text: string, rating: number|null}) {
  return (dispatch: Redux.Dispatch<any>, getState: () => AppState) => {
    if (a.rating && a.rating < 3 && (!a.text || a.text.length < MIN_FEEDBACK_LENGTH)) {
      return alert('Sounds like the quest needs work! Please provide feedback of at least ' + MIN_FEEDBACK_LENGTH + ' characters to help the author improve.');
    } else if (a.rating && a.text.length > 0 && a.text.length < MIN_FEEDBACK_LENGTH) {
      return alert('Reviews must be at least ' + MIN_FEEDBACK_LENGTH + ' characters to provide value to authors.');
    }

    const data: any = {
      anonymous: a.anonymous,
      difficulty: a.settings.difficulty,
      email: a.user.email,
      name: a.user.name,
      partition: a.quest.details.partition,
      platform: getDevicePlatform(),
      platformDump: getPlatformDump(),
      players: a.settings.numLocalPlayers,
      questid: a.quest.details.id,
      rating: a.rating,
      text: a.text,
      userid: a.user.id,
      version: VERSION,
      stats: JSON.stringify(getCounters()),
    };

    // If we're not rating, we're providing other feedback.
    // Provide a line number and snapshot of the console to facilitate bug-hunting
    if (!a.rating) {
      data.console = getLogBuffer();
    }
    if (a.quest && a.quest.node && a.quest.node.elem) {
      data.questline = a.quest.node.elem.data('line');
    }

    return dispatch(postUserFeedback(a.type, data));
  };
}

function postUserFeedback(type: string, data: any) {
  return (dispatch: Redux.Dispatch<any>) => {
    return fetch(AUTH_SETTINGS.URL_BASE + '/quest/feedback/' + type, {
      body: JSON.stringify(data),
      method: 'POST',
    })
    .then(handleFetchErrors)
    .then((response: Response) => {
      return response.text();
    })
    .then((response: string) => {
      logEvent('feedback', 'user_feedback_' + type, { label: data.questid, value: data.rating });
      dispatch(openSnackbar('Submission successful. Thank you!'));
    })
    .catch((error: Error) => {
      logEvent('error', 'user_feedback_' + type + '_err', { label: error });
      dispatch(openSnackbar(Error('Error submitting review: ' + error.toString())));
    });
  };
}

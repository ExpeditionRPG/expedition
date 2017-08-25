import Redux from 'redux'
import {authSettings} from '../Constants'
import {toCard} from './Card'
import {initQuest} from './Quest'

import {setAnnouncement} from '../actions/Announcement'
import {openSnackbar} from '../actions/Snackbar'
import {userFeedbackClear} from '../actions/UserFeedback'
import {SearchSettings, SettingsType, QuestState, UserState, UserFeedbackState} from '../reducers/StateTypes'
import {QuestContext, QuestDetails} from '../reducers/QuestTypes'
import {defaultQuestContext} from '../reducers/Quest'
import {getDevicePlatform, getAppVersion} from '../Globals'
import {logEvent} from '../Main'

declare var window:any;
declare var require:any;
const cheerio = require('cheerio') as CheerioAPI;

// fetch can be used for anything except local files, so anything that might download from file://
// (aka quests) should use this instead
export function fetchLocal(url: string, callback: Function) {
  const xhr = new XMLHttpRequest;
  xhr.onload = function() {
    return callback(null, xhr.responseText);
  }
  xhr.onerror = () => {
    return callback(new Error('Network error'));
  }
  xhr.open('GET', url);
  xhr.send(null);
}

export function fetchQuestXML(details: QuestDetails) {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetchLocal(details.publishedurl, (err: Error, result: string) => {
      if (err) {
        return dispatch(openSnackbar('Network error: Please check your connection.'));
      }
      const questNode = cheerio.load(result)('quest');
      dispatch(loadQuestXML(details, questNode, defaultQuestContext()));
    });
  };
}

// for loading quests in the app - Quest Creator injects directly into initQuest
export function loadQuestXML(details: QuestDetails, questNode: Cheerio, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Quest start is here instead of initQuest because initQuest is also used by the editor
    // and would over-report.
    logEvent('quest_start', details);

    dispatch(initQuest(details, questNode, ctx));
    dispatch(toCard('QUEST_START'));
  };
}

export function search(numPlayers: number, user: UserState, search: SearchSettings) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (!user.loggedIn) {
      throw new Error('Not logged in, cannot search');
    }

    const params: any = { players: numPlayers, ...search };
    Object.keys(params).forEach((key: string) => { if (params[key] === null) { delete params[key]; }});

    const xhr = new XMLHttpRequest();
    // TODO: Pagination / infinite scrolling
    xhr.open('POST', authSettings.urlBase + '/quests', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = () => {
      const response: any = JSON.parse(xhr.responseText);
      if (response.error) {
        return dispatch(openSnackbar('Network error when searching: ' + response.error));
      }

      dispatch({
        type: 'SEARCH_RESPONSE',
        quests: response.quests,
        nextToken: response.nextToken,
        receivedAt: response.receivedAt,
        search: search,
      });
      dispatch(toCard('SEARCH_CARD', 'SEARCH'));
    };
    xhr.onerror = () => {
      return dispatch(openSnackbar('Network error: Please check your connection.'));
    }
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  };
}

export function subscribe(email: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetch(authSettings.urlBase + '/user/subscribe', {
      method: 'POST',
      body: JSON.stringify({email}),
    })
    .then((response: Response) => {
      return response.text();
    })
    .then((data: string) => {
      logEvent('user_subscribe', email);
      dispatch(openSnackbar('Thank you for subscribing!'));
    }).catch((error: Error) => {
      dispatch(openSnackbar('Error subscribing: ' + error));
    });
  };
}

export function submitUserFeedback(quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const data = Object.assign({}, {
      questid: quest.details.id,
      userid: user.id,
      players: settings.numPlayers,
      difficulty: settings.difficulty,
      platform: getDevicePlatform(),
      version: getAppVersion(),
      email: user.email,
      name: user.name,
      rating: userFeedback.rating,
      text: userFeedback.text,
    });

    fetch(authSettings.urlBase + '/quest/feedback/' + userFeedback.type, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    .then((response: Response) => {
      return response.text();
    })
    .then((data: string) => {
      logEvent('user_feedback_' + userFeedback.type, data);
      dispatch(userFeedbackClear());
      dispatch(openSnackbar('Submission successful. Thank you!'));
    }).catch((error: Error) => {
      logEvent('user_feedback_' + userFeedback.type + '_err', data);
      dispatch(openSnackbar('Error submitting feedback: ' + error));
    });
  };
}

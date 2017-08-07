import Redux from 'redux'
import {authSettings} from '../Constants'
import {toCard} from './Card'
import {initQuest} from './Quest'

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

export function fetchQuestXML(details: QuestDetails) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.ajax({url: details.publishedurl,
      dataType: 'text',
      success: (data: string) => {
        const questNode = cheerio.load(data)('quest');
        dispatch(loadQuestXML(details, questNode, defaultQuestContext()));
      },
      error: (xhr: any, error: string) => {
        dispatch(openSnackbar('Network error: Please check your connection.'));
      },
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
    $.post({
      url: authSettings.urlBase + '/user/subscribe',
      data: JSON.stringify({email}),
      dataType: 'json',
    })
    .done((msg: string) => {
      logEvent('user_subscribe', email);
    })
    .fail((xhr: any, err: string) => {
      if (xhr.status === 200) {
        logEvent('user_subscribe', email);
      } else {
        dispatch(openSnackbar('Error subscribing: ' + err));
      }
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
    $.post({
      url: authSettings.urlBase + '/quest/feedback/' + userFeedback.type,
      data: JSON.stringify(data),
      dataType: 'json',
    })
    .done((msg: string) => {
      logEvent('user_feedback_' + userFeedback.type, data);
      dispatch(userFeedbackClear());
      dispatch(openSnackbar('Submission successful. Thank you!'));
    })
    .fail((xhr: any, err: string) => {
      if (xhr.status === 200) {
        logEvent('user_feedback_' + userFeedback.type, data);
        dispatch(userFeedbackClear());
        return dispatch(openSnackbar('Submission successful. Thank you!'));
      }
      logEvent('user_feedback_' + userFeedback.type + '_err', data);
      return dispatch(openSnackbar('Error submitting feedback: ' + err));
    });
  };
}

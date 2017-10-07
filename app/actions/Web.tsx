import Redux from 'redux'
import {authSettings} from '../Constants'
import {toCard} from './Card'
import {initQuest} from './Quest'

import {setAnnouncement} from '../actions/Announcement'
import {openSnackbar} from '../actions/Snackbar'
import {userFeedbackClear} from '../actions/UserFeedback'
import {SearchSettings, SettingsType, QuestState, UserState, UserFeedbackState} from '../reducers/StateTypes'
import {QuestDetails} from '../reducers/QuestTypes'
import {getDevicePlatform, getAppVersion} from '../Globals'
import {logEvent} from '../Main'
import {TemplateContext} from '../cardtemplates/TemplateTypes'
import {defaultContext, ParserNode} from '../cardtemplates/Template'

declare var window:any;
declare var require:any;
const cheerio = require('cheerio') as CheerioAPI;

// fetch can be used for anything except local files, so anything that might download from file://
// (aka quests) should use this instead
export function fetchLocal(url: string, callback: Function) {
  const request = new XMLHttpRequest();
  request.onload = function() {
    return callback(null, request.response);
  }
  request.onerror = () => {
    return callback(new Error('Network error'));
  }
  request.open('GET', url);
  request.send();
}

export function fetchQuestXML(details: QuestDetails) {
  return (dispatch: Redux.Dispatch<any>): any => {
    fetchLocal(details.publishedurl, (err: Error, result: string) => {
      if (err) {
        return dispatch(openSnackbar('Network error: Please check your connection.'));
      }
      const questNode = cheerio.load(result)('quest');
      dispatch(loadQuestXML(details, questNode, defaultContext()));
    });
  };
}

// for loading quests in the app - Quest Creator injects directly into initQuest
export function loadQuestXML(details: QuestDetails, questNode: Cheerio, ctx: TemplateContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    // Quest start is here instead of initQuest because initQuest is also used by the editor
    // and would over-report.
    logEvent('quest_start', details);

    dispatch(initQuest(details, questNode, ctx));

    const firstNode = questNode.children().eq(0);
    const node = new ParserNode(firstNode, ctx);

    if (node.elem[0].attribs.skipsetup) {
      dispatch(toCard({name: 'QUEST_CARD'}));
    } else {
      dispatch(toCard({name: 'QUEST_START'}));
    }
  };
}

export function search(search: SearchSettings) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const params = {...search};
    Object.keys(params).forEach((key: string) => {
      if ((params as any)[key] === null) {
        delete (params as any)[key];
      }
    });

    // Send search request action; clears previous results.
    dispatch({type: 'SEARCH_REQUEST'});

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
      if (search.partition === 'expedition-private') {
        dispatch(toCard({name: 'SEARCH_CARD', phase: 'PRIVATE'}));
      } else {
        dispatch(toCard({name: 'SEARCH_CARD', phase: 'SEARCH'}));
      }
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

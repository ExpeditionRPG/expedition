import Redux from 'redux'
import {authSettings} from '../constants'
import {toCard} from './card'
import {initQuest} from './quest'

import {userFeedbackClear} from '../actions/UserFeedback'
import {SearchSettings, SettingsType, QuestState, UserState, UserFeedbackState, XMLElement} from '../reducers/StateTypes'
import {QuestContext, defaultQuestContext} from '../reducers/QuestTypes'

declare var window:any;


export function fetchQuestXML(id: string, url: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.get(url, function(data: XMLElement | string) {
      dispatch(loadQuestXML(id, data, defaultQuestContext()));
    });
  };
}

// for loading quests in the app - Quest Creator injects directly into initQuest
export function loadQuestXML(id: string, data: XMLElement | string, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var xml = $(data) as any as XMLElement;
    var questNode = xml;
    if (questNode.get(0).tagName == null) { // for web + android, have to enter the document
      questNode = questNode.children().eq(0);
    }
    if (questNode.get(0).tagName.toLowerCase() !== 'quest') {
      throw 'Invalid Quest - missing <quest> node';
    }

    const init = initQuest(id, questNode, ctx);
    window.FirebasePlugin.logEvent('quest_start', init.details); // here instead of initQuest b/c initQuest is also used by the editor
    dispatch(init);
    dispatch(toCard('QUEST_START'));
  };
}

export function search(numPlayers: number, user: UserState, search: SearchSettings) {
  return (dispatch: Redux.Dispatch<any>): any => {
    if (!user.loggedIn) {
      throw new Error('Not logged in, cannot search');
    }

    var params: any = {};
    if (search.owner === 'self') {
      params.owner = user.id;
    }
    params.players = numPlayers;
    if (search.text) {
      params.search = search.text;
    }
    if (search.age && search.age !== 'inf') {
      params.published_after = parseInt(search.age);
    }
    if (search.order) {
      params.order = search.order;
    }

    var xhr = new XMLHttpRequest();
    // TODO: Pagination
    xhr.open('POST', authSettings.urlBase + '/quests', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onload = function() {
      var response: any = JSON.parse(xhr.responseText);
      if (response.error) {
        throw new Error(response.error);
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
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  };
}

export function submitUserFeedback(quest: QuestState, settings: SettingsType, user: UserState, userFeedback: UserFeedbackState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const data = Object.assign({}, {
      questid: quest.details.id,
      userid: user.id,
      players: settings.numPlayers,
      difficulty: settings.difficulty,
      platform: window.platform,
      version: window.APP_VERSION,
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
      // TODO replace alerts with something nicer / more in-style
      window.FirebasePlugin.logEvent('user_feedback_' + userFeedback.type, data);
      dispatch(userFeedbackClear());
      alert('Submission successful. Thank you!');
    })
    .fail((xhr: any, err: string) => {
      if (xhr.status === 200) {
        window.FirebasePlugin.logEvent('user_feedback_' + userFeedback.type, data);
        dispatch(userFeedbackClear());
        return alert('Submission successful. Thank you!');
      }
      window.FirebasePlugin.logEvent('user_feedback_' + userFeedback.type + '_err', data);
      alert('Error encountered when submitting: ' + err);
    });
  };
}

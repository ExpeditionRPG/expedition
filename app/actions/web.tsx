import Redux from 'redux'
import {authSettings} from '../constants'
import {toCard} from './card'
import {initQuest, updateFeedback} from './quest'

import {SearchSettings, SettingsType, QuestState, UserState, XMLElement} from '../reducers/StateTypes'
import {QuestContext, defaultQuestContext} from '../reducers/QuestTypes'

declare var window:any;


export function fetchQuestXML(url: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.get(url, function(data: XMLElement | string) {
      dispatch(loadQuestXML(data, defaultQuestContext()));
    });
  };
}

export function loadQuestXML(data: XMLElement | string, ctx: QuestContext) {
  return (dispatch: Redux.Dispatch<any>): any => {
    var xml = $(data) as any as XMLElement;
    var questNode = xml;
    if (questNode.get(0).tagName == null) { // for web + android, have to enter the document
      questNode = questNode.children().eq(0);
    }
    if (questNode.get(0).tagName.toLowerCase() !== 'quest') {
      throw 'Invalid Quest - missing <quest> node';
    }

    const init = initQuest(questNode, ctx);
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

export function sendFeedback(quest: QuestState, settings: SettingsType, user: UserState) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const data = Object.assign({}, {
      title: quest.details.title,
      author: quest.details.author,
      email: quest.details.email,
      feedback: quest.feedback.text,
      players: settings.numPlayers,
      difficulty: settings.difficulty,
      platform: window.platform,
      userEmail: user.email,
      shareUserEmail: quest.feedback.shareUserEmail,
    });
    $.post({
      url: authSettings.urlBase + '/feedback',
      data: JSON.stringify(data),
      dataType: 'json',
    })
    .done(function(msg: string){
      // TODO replace alerts with something nicer / more in-style
      dispatch(updateFeedback({text: ''}));
      alert('Feedback submitted. Thank you!');
    })
    .fail(function(xhr: any, err: string) {
      if (xhr.status === 200) {
        dispatch(updateFeedback({text: ''}));
        return alert('Feedback submitted. Thank you!');
      }
      alert('Error encountered when submitting feedback: ' + err);
    });
  };
}

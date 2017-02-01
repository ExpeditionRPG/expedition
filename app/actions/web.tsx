import {authSettings} from '../constants'
import {toCard} from './card'
import {initQuest, updateFeedback} from './quest'

import {SearchSettings, SettingsType, QuestState, UserState, XMLElement} from '../reducers/StateTypes'
import {QuestContext, defaultQuestContext} from '../reducers/QuestTypes'

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
    if (questNode.get(0).tagName.toLowerCase() !== "quest") {
      throw 'Invalid Quest - missing <quest> node';
    }

    dispatch(initQuest(questNode, ctx));
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
    if (search.age && search.age !== "inf") {
      params.published_after = parseInt(search.age);
    }
    if (search.order) {
      params.order = search.order;
    }

    var xhr = new XMLHttpRequest();
    // TODO: Pagination
    xhr.open('POST', authSettings.urlBase + "/quests", true);
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
      });
      dispatch(toCard('SEARCH_CARD', 'SEARCH'));
    };
    xhr.withCredentials = true;
    xhr.send(JSON.stringify(params));
  };
}

export function sendFeedback(quest: QuestState, settings: SettingsType) {
  return (dispatch: Redux.Dispatch<any>): any => {
    const meta = quest.details;
    $.post({
      url: authSettings.urlBase + '/feedback',
      data: JSON.stringify({title: meta.title, author: meta.author, email: meta.email, feedback: quest.feedback, players: settings.numPlayers, difficulty: settings.difficulty}),
      dataType: 'json',
    })
    .done(function(msg: string){
      // TODO replace alerts with something nicer / more in-style
      dispatch(updateFeedback(''));
      alert('Feedback submitted. Thank you!');
    })
    .fail(function(xhr: any, err: string) {
      if (xhr.status === 200) {
        dispatch(updateFeedback(''));
        return alert('Feedback submitted. Thank you!');
      }
      alert('Error encountered when submitting feedback: ' + err);
    });
  };
}

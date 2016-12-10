import {XMLElement} from '../reducers/StateTypes'
import {initQuest} from './quest'
import {SearchSettings, UserState} from '../reducers/StateTypes'
import {QuestContext, defaultQuestContext} from '../reducers/QuestTypes'
import {toCard} from './card'
import {authSettings} from '../constants'

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
    var firstNode = questNode.children().eq(0);
    dispatch(initQuest(firstNode, ctx));
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

import {XMLElement} from '../reducers/StateTypes'
import {initQuest} from './quest'
import {SearchSettings, UserState} from '../reducers/StateTypes'
import {toCard} from './card'
import {authSettings} from '../constants'

export function loadQuestXML(url: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.get(url, function(data: XMLElement | string) {
      if (typeof data === 'string') {
        data = (new DOMParser().parseFromString(data as string, 'text/xml')) as any as XMLElement;
      }
      dispatch(initQuest((data as XMLElement).children[0].children[0]));
      dispatch(toCard('QUEST_START'));
    });
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
      params.published_after = Math.floor(Date.now() / 1000) - parseInt(search.age);
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
      console.log(response);
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
import {XMLElement} from '../reducers/StateTypes'
import {initQuest} from './quest'
import {SearchSettings} from '../reducers/StateTypes'
import {toCard} from './card'

export function loadQuestXML(url: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.get(url, function(data: XMLElement) {
      dispatch(initQuest(data.children[0]));
      dispatch(toCard('QUEST_START'));
    });
  };
}


export function search(search: SearchSettings) {
  return (dispatch: Redux.Dispatch<any>): any => {
    console.log("TODO LOGIN");
    dispatch({
      type: 'SEARCH_RESPONSE',
      quests: [],
      nextToken: "0",
      receivedAt: 0,
    });
    dispatch(toCard('SEARCH_CARD', 'SEARCH'));
  };
}

/*
var xhr = new XMLHttpRequest();
// TODO: Pagination
xhr.open('POST', this.URL_BASE + "/quests", true);

xhr.setRequestHeader('Content-Type', 'text/plain');
xhr.onload = function() {
  cb(JSON.parse(xhr.responseText));
};
xhr.withCredentials = true;
xhr.send(JSON.stringify(params));
*/
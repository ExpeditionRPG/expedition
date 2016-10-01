import {XMLElement} from '../reducers/StateTypes'
import {initQuest} from './quest'
import {toCard} from './card'

export function loadQuestXML(url: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.get(url, function(data: XMLElement) {
      dispatch(initQuest(data.children[0]));
      dispatch(toCard('QUEST_START'));
    });
  };
}
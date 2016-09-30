import {CardActionType, ListCardType, CardNameType, TransitionType} from '../reducers/StateTypes'
import {NavigateAction, ReturnAction} from './ActionTypes'
import {toQuestStart} from './card'
import {XMLElement} from '../scripts/QuestParser'

export function loadQuestXML(url: string) {
  return (dispatch: Redux.Dispatch<any>): any => {
    $.get(url, function(data: XMLElement) {
      dispatch(toQuestStart(data.children[0]));
    });
  };
}

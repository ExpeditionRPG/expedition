import {QuestType} from './StateTypes'
import {ReceiveQuestXMLAction} from '../actions/ActionTypes'

const initial_state: QuestType = {};

export function quest(state: QuestType = initial_state, action: Redux.Action): QuestType {
  /*
  switch (action.type) {
    case 'RECEIVE_QUEST_XML':
      return Object.assign({}, state, {xml: (action as ReceiveQuestXMLAction).xml.children[0]})
    default:
      return state;
  }
  */
  return state;
}


/*
_onQuestFetch: function(evt) {
  var quest;
  if (evt.detail.response && typeof evt.detail.response !== "string") {
    quest = evt.detail.response.children[0];
  } else {
    quest = new DOMParser().parseFromString(evt.detail.xhr.responseText, 'text/xml').children[0];
  }
  Polymer.dom(this).appendChild(quest);

  // Let any upstream expedition-card-set know that we now have properly set data.
  this.fire("newdata");
},
*/
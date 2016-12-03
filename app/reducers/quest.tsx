import {QuestState, AppState} from './StateTypes'
import {QuestNodeAction, InitCombatAction} from '../actions/ActionTypes'

export function quest(state: QuestState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'QUEST_NODE':
      return Object.assign({}, state, {
        node: (action as QuestNodeAction).node,
        ctx: (action as QuestNodeAction).result.ctx,
        result: (action as QuestNodeAction).result,
      });
    case 'INIT_COMBAT':
      return Object.assign({}, state, {
        node: (action as InitCombatAction).node,
        result: (action as InitCombatAction).result,
      });
    default:
      return state;
  }
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
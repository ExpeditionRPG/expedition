import {AppState, QuestState} from './StateTypes'
import {InitQuestAction, ChoiceAction, EventAction} from '../actions/ActionTypes'
import {handleChoice, handleEvent, getNodeCardType, loadCombatNode} from '../scripts/QuestParser'
import {initCombat} from './combat'

export function quest(state: AppState, action: Redux.Action): QuestState {
  switch (action.type) {
    case 'INIT_QUEST':
      return Object.assign({}, state.quest, {node: (action as InitQuestAction).node.children[0]});
    case 'CHOICE':
      let newState = Object.assign({}, state.quest, {node: handleChoice(state.quest.node, (action as ChoiceAction).choice)});

      // Start with new combat phase if we're entering combat
      if (getNodeCardType(newState.node) === 'COMBAT') {
        newState.combat = initCombat(loadCombatNode(newState.node).enemies, state.settings.numPlayers, state.settings.difficulty);
      }
      return newState;
    case 'EVENT':
      return Object.assign({}, state.quest, {node: handleEvent(state.quest.node, (action as EventAction).event)});
    case 'COMBAT_TIMER_STOP':
      // TODO: Calculate round results
      //return (action as InitCombatAction);
      /*
          let phase: CombatPhase = (state.card as QuestAction).phase;
          if (!phase) {
            throw new Error('Combat card had no phase');
          }
          let combat: CombatResult = loadCombatNode((state.card as CombatAction).node);

          let combatState: CombatState = (state.card as CombatAction).state;
          if (!combatState) {
            let tierSum: number = 0;

            combatState = {
              difficulty: state.settings.difficulty,
              roundCount: 0,
              numAliveAdventurers: state.settings.numPlayers,
              tier: tierSum,
            };
          }
      */
      return state.quest;
    case 'COMBAT_DEFEAT':
    case 'COMBAT_VICTORY':
      return state.quest;
      /*
        return {
        name: 'VICTORY',
        loot: _generateLoot(maxTier),
        levelUp: (maxTier >= numAdventurers),
      };
      */
    default:
      return state.quest;
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
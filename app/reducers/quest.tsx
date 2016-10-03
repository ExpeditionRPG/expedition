import {QuestState, AppState} from './StateTypes'
import {AppStateWithHistory} from './CombinedReducers'
import {MidCombatPhase, isCombatPhase} from './QuestTypes'
import {InitQuestAction, ChoiceAction, EventAction, CombatTimerStopAction, TierSumDeltaAction, AdventurerDeltaAction, NavigateAction} from '../actions/ActionTypes'
import {handleChoice, handleEvent, getNodeCardType, loadCombatNode} from '../QuestParser'
import {initCombat, generateCombatAttack, generateLoot} from './combat'

function computeMaxTier(history: AppState[]) {
  let histIdx: number = history.length-1;
  let maxTier = 0;
  while(history[histIdx].quest.combat !== undefined && histIdx > 0) {
    var tier = (history[histIdx].quest.combat.details as MidCombatPhase).tier;
    if (!tier) {
      histIdx--;
      continue;
    }
    maxTier = Math.max(maxTier, tier);
    histIdx--;
  }
  return maxTier;
}

export function quest(state: AppStateWithHistory, action: Redux.Action): QuestState {
  var newState: QuestState;
  switch (action.type) {
    case 'INIT_QUEST':
      return Object.assign({}, state.quest, {node: (action as InitQuestAction).node.children[0]});
    case 'CHOICE':
      newState = Object.assign({}, state.quest, {node: handleChoice(state.quest.node, (action as ChoiceAction).choice)});

      // Start with new combat phase if we're entering combat
      if (getNodeCardType(newState.node) === 'COMBAT') {
        newState.combat = initCombat(loadCombatNode(newState.node).enemies, state.settings.numPlayers, state.settings.difficulty);
      }
      return newState;
    case 'EVENT':
      return Object.assign({}, state.quest, {node: handleEvent(state.quest.node, (action as EventAction).event)});
    case 'NAVIGATE':
      let phase = (action as NavigateAction).phase;
      if (isCombatPhase(phase)) {
        newState = Object.assign({}, state.quest);
        newState.combat = Object.assign({}, newState.combat, {phase});
        return newState;
      }
      return state.quest;
    case 'COMBAT_TIMER_STOP':
      // TODO: Calculate round results
      newState = Object.assign({}, state.quest);
      let elapsedMillis: number = (action as CombatTimerStopAction).elapsedMillis;
      (newState.combat.details as MidCombatPhase).mostRecentAttack = generateCombatAttack(state.quest.combat, elapsedMillis);
      (newState.combat.details as MidCombatPhase).roundCount++;
      return newState;
    case 'COMBAT_DEFEAT':
      newState = Object.assign({}, state.quest);
      newState.combat = Object.assign({}, newState.combat);
      newState.combat.details = {
        loot: [],
        levelUp: false,
      };
      return newState;
    case 'COMBAT_VICTORY':
      newState = Object.assign({}, state.quest);
      newState.combat = Object.assign({}, newState.combat);
      var maxTier = computeMaxTier(state._history);
      newState.combat.details = {
        loot: generateLoot(maxTier),
        levelUp: (state.settings.numPlayers <= maxTier)
      }
      return newState;
    case 'TIER_SUM_DELTA':
      newState = Object.assign({}, state.quest);
      newState.combat = Object.assign([], newState.combat);
      (newState.combat.details as MidCombatPhase).tier += (action as TierSumDeltaAction).delta;
      return newState;
    case 'ADVENTURER_DELTA':
      newState = Object.assign({}, state.quest);
      newState.combat = Object.assign([], newState.combat);
      (newState.combat.details as MidCombatPhase).numAliveAdventurers += (action as AdventurerDeltaAction).delta;
      return newState;
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
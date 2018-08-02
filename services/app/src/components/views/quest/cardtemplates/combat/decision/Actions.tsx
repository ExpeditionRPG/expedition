import {AppStateWithHistory, SettingsType} from 'app/reducers/StateTypes';
import Redux from 'redux';
import {QuestNodeAction, remoteify} from '../../../../../../actions/ActionTypes';
import {toCard} from '../../../../../../actions/Card';
import {generateLeveledChecks, pushDecisionRoll} from '../../decision/Actions';
import {DecisionPhase, DecisionState, EMPTY_DECISION_STATE} from '../../decision/Types';
import {numAdventurers} from '../../PlayerCount';
import {ParserNode} from '../../TemplateTypes';
import {CombatState} from '../Types';

function resolveParams(node: ParserNode|undefined, getState: () => AppStateWithHistory): {node: ParserNode, decision: DecisionState, combat: CombatState} {
  node = (node && node.clone()) || getState().quest.node.clone();
  const decision = node.ctx.templates.decision || EMPTY_DECISION_STATE;
  const combat = node.ctx.templates.combat;
  if (!combat) {
    throw Error('undefined combat node');
  }
  return {node, decision, combat};
}

export function generateCombatDecision(adventurers: number): DecisionState {
  return {
    leveledChecks: generateLeveledChecks(adventurers),
    selected: null,
    rolls: [],
  };
}

interface SetupCombatDecisionArgs {
  node?: ParserNode;
  seed: string;
}
export const setupCombatDecision = remoteify(function setupCombatDecision(a: SetupCombatDecisionArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): SetupCombatDecisionArgs {
  const {node, combat} = resolveParams(a.node, getState);
  const settings = getState().settings;
  const rp = getState().multiplayer;
  combat.decisionPhase = 'PREPARE_DECISION';
  node.ctx.templates.decision = {
    leveledChecks: generateLeveledChecks(numAdventurers(settings, rp)),
    selected: null,
    rolls: [],
  };

  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_DECISION', keySuffix: combat.decisionPhase, noHistory: true}));
  return {seed: a.seed};
});

interface HandleCombatDecisionRollArgs {
  node?: ParserNode;
  roll: number;
}
export const handleCombatDecisionRoll = remoteify(function handleCombatDecisionRoll(a: HandleCombatDecisionRollArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleCombatDecisionRollArgs|null {
  const {node} = resolveParams(a.node, getState);
  pushDecisionRoll(node, a.roll, getState);
  dispatch(toDecisionCard({phase: 'RESOLVE_DECISION', node}));
  return {
    roll: a.roll,
  };
});

interface ToDecisionCardArgs {
  node?: ParserNode;
  phase: DecisionPhase;
  settings?: SettingsType;
}
export const toDecisionCard = remoteify(function toDecisionCard(a: ToDecisionCardArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): ToDecisionCardArgs {
  const {node, decision, combat} = resolveParams(a.node, getState);
  combat.decisionPhase = a.phase;
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: 'MID_COMBAT_DECISION', keySuffix: a.phase + (decision.rolls || '').toString(), noHistory: true}));
  return {
    phase: a.phase,
  };
});

import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {generateCombatTemplate} from './combat/Actions';
import {CombatPhase, CombatState} from './combat/Types';
import {DecisionPhase, DecisionState, EMPTY_DECISION_STATE} from './decision/Types';
import {ParserNode} from './TemplateTypes';

export function resolveParams(node: ParserNode|undefined, getState: () => AppStateWithHistory): {node: ParserNode, decision: DecisionState, combat: CombatState} {
  node = (node && node.clone()) || getState().quest.node.clone();
  const decision = node.ctx.templates.decision || EMPTY_DECISION_STATE;
  let combat = node.ctx.templates.combat;
  if (!combat) {
    combat = generateCombatTemplate(getState().settings);
    node.ctx.templates.combat = combat;
  }
  return {node, decision, combat};
}

export function resolveCombat(node: ParserNode|undefined): CombatState {
  return (node && node.ctx && node.ctx.templates && node.ctx.templates.combat)
    || {
      enemies: [],
      tier: 0,
      mostRecentRolls: [],
      numAliveAdventurers: 1,
      surgePeriod: 0,
      decisionPeriod: 0,
      damageMultiplier: 0,
      maxRoundDamage: 0,
      roundCount: 0,
      seed: '',
      phase: CombatPhase.drawEnemies,
      decisionPhase: DecisionPhase.prepare,
    };
}

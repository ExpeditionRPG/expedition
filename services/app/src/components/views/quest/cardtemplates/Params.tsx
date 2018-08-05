import {AppStateWithHistory} from 'app/reducers/StateTypes';
import {CombatState} from './combat/Types';
import {DecisionState, EMPTY_DECISION_STATE} from './decision/Types';
import {ParserNode} from './TemplateTypes';

export function resolveParams(node: ParserNode|undefined, getState: () => AppStateWithHistory): {node: ParserNode, decision: DecisionState, combat: CombatState} {
  node = (node && node.clone()) || getState().quest.node.clone();
  const decision = node.ctx.templates.decision || EMPTY_DECISION_STATE;
  const combat = node.ctx.templates.combat;
  if (!combat) {
    throw Error('undefined combat node');
  }
  return {node, decision, combat};
}

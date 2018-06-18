import {CombatState, CombatPhase} from './combat/Types'
import {DecisionState, DecisionPhase} from './decision/Types'
import {RoleplayPhase} from './roleplay/Types'
import {Context} from 'expedition-qdl/parse/Context'
import {Node} from 'expedition-qdl/parse/Node'

export interface TemplateState {
  combat?: CombatState;
  decision?: DecisionState;
}

export type TemplatePhase = CombatPhase | RoleplayPhase | DecisionPhase;

export interface TemplateContext extends Context {
  templates: TemplateState;

  // Regenerate template scope (all of "_") with this function.
  _templateScopeFn: () => any;
}


export class ParserNode extends Node<TemplateContext>{};

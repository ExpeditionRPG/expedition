import {Context} from 'shared/parse/Context';
import {Node} from 'shared/parse/Node';
import {CombatPhase, CombatState} from './combat/Types';
import {DecisionPhase, DecisionState} from './decision/Types';
import {RoleplayPhase} from './roleplay/Types';

export interface TemplateState {
  combat?: CombatState;
  decision?: DecisionState;
}

export type TemplatePhase = CombatPhase | RoleplayPhase | DecisionPhase;

export interface TemplateContext extends Context {
  templates: TemplateState;
}

export class ParserNode extends Node<TemplateContext> {}

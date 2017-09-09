import {CombatState, CombatPhase} from './combat/Types'
import {RoleplayPhase} from './roleplay/Types'
import {Context} from 'expedition-qdl/lib/parse/Context'

export interface TemplateState {
  combat?: CombatState
}

export type TemplatePhase = CombatPhase | RoleplayPhase;

export interface TemplateContext extends Context {
  templates: TemplateState;

  // Regenerate template scope (all of "_") with this function.
  _templateScopeFn: () => any;
}

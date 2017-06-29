import {CombatState, CombatPhase} from '../cardtemplates/combat/Types'

export interface TemplateState {
  combat?: CombatState
}

export type TemplatePhase = CombatPhase;

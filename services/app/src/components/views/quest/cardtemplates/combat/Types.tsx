import {Enemy, Loot} from 'app/reducers/QuestTypes';
import {AppStateWithHistory, CardThemeType, SettingsType} from 'app/reducers/StateTypes';
import {DecisionPhase} from '../decision/Types';
import {getCardTemplateTheme} from '../Template';
import {ParserNode} from '../TemplateTypes';

export interface CombatAttack {
  surge: boolean;
  damage: number;
}

export interface MidCombatPhase {
  enemies: Enemy[];
  mostRecentAttack?: CombatAttack;
  mostRecentRolls?: number[];
  numAliveAdventurers: number;
  roundCount: number;
  tier: number;
  decisionPhase: DecisionPhase;
}

export interface EndCombatPhase {
  levelUp?: boolean;
  loot?: Loot[];
}

export interface CombatDifficultySettings {
  surgePeriod: number;
  decisionPeriod: number;
  damageMultiplier: number;
  maxRoundDamage: number;
}

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {
  custom: boolean;
}

export type CombatPhase = 'DRAW_ENEMIES'
  | 'PREPARE'
  | 'TIMER'
  | 'SURGE'
  | 'RESOLVE_ABILITIES'
  | 'RESOLVE_DAMAGE'
  | 'VICTORY'
  | 'DEFEAT'
  | 'NO_TIMER'
  | 'MID_COMBAT_ROLEPLAY'
  | 'MID_COMBAT_DECISION'
  | 'MID_COMBAT_DECISION_TIMER'; // Timer must be separate to allow skip of timer during onReturn.

export interface StateProps {
  node: ParserNode;
  settings: SettingsType;
  seed: string;
  theme: CardThemeType;
}

export function mapStateToProps(state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps {
  return {
    node: ownProps.node || state.quest.node,
    settings: state.settings,
    seed: state.quest.seed,
    theme: getCardTemplateTheme(state.card),
  };
}

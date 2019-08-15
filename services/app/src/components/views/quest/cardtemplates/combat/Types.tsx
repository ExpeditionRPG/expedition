import {numPlayers} from 'app/actions/Settings';
import {Enemy, Loot} from 'app/reducers/QuestTypes';
import {AppStateWithHistory, CardThemeType, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
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
  phase: CombatPhase;
  decisionPhase: DecisionPhase;
  // Combat needs its own seed so as not to interfere
  // with replay/multiplayer seed on main node.
  // This should only be used for calculating rolls & damage;
  // use node seed for mid-combat roleplay.
  seed: string;
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

export enum CombatPhase {
  drawEnemies = 'DRAW_ENEMIES',
  prepare = 'PREPARE',
  timer = 'TIMER', // Timer must be separate to allow skip of timer during onReturn.
  surge = 'SURGE',
  resolveAbilities = 'RESOLVE_ABILITIES',
  resolveDamage = 'RESOLVE_DAMAGE',
  victory = 'VICTORY',
  defeat = 'DEFEAT',
  midCombatRoleplay = 'MID_COMBAT_ROLEPLAY',
  midCombatDecision = 'MID_COMBAT_DECISION',
  midCombatDecisionTimer = 'MID_COMBAT_DECISION_TIMER',
}

export interface CombatState extends CombatDifficultySettings, MidCombatPhase, EndCombatPhase {}
export const EMPTY_COMBAT_STATE = {
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

export interface StateProps {
  node: ParserNode;
  players: number;
  settings: SettingsType;
  seed: string;
  theme: CardThemeType;
  multiplayer: MultiplayerState;
}

export function mapStateToProps(state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps {
  console.log(state.settings);
  const node = ownProps.node || state.quest.node;
  return {
    node,
    players: numPlayers(state.settings, state.multiplayer),
    settings: state.settings,
    seed: (node && node.ctx.seed) || '',
    theme: getCardTemplateTheme(state.card),
    multiplayer: state.multiplayer,
  };
}

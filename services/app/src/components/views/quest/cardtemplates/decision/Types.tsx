import {AppStateWithHistory, CardThemeType, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
const seedrandom = require('seedrandom');
import {Outcome, SkillCheck} from 'shared/schema/templates/Decision';
import {getCardTemplateTheme} from '../Template';
import {ParserNode} from '../TemplateTypes';

export enum Difficulty {
  easy = 'easy',
  medium = 'medium',
  hard = 'hard',
}

export const SUCCESS_THRESHOLD_MAP: Record<keyof typeof Difficulty, number> = {
  easy: 9,
  medium: 13,
  hard: 17,
};

export const RETRY_THRESHOLD_MAP: Record<keyof typeof Difficulty, number> = {
  easy: 5,
  medium: 9,
  hard: 13,
};

export interface LeveledSkillCheck extends SkillCheck {
  difficulty: (keyof typeof Difficulty);
  requiredSuccesses: number;
}
export const EMPTY_LEVELED_CHECK: LeveledSkillCheck = {skill: 'athletics', difficulty: 'medium', requiredSuccesses: 1};

// TODO: Allow specific icons for each instruction.
export interface OutcomeContent {
  type: keyof typeof Outcome;
  text: string;
  instructions: string[];
}
export const EMPTY_OUTCOME: OutcomeContent = {type: 'retry', text: '', instructions: []};

export type DecisionPhase = 'PREPARE_DECISION' | 'DECISION_TIMER' | 'RESOLVE_DECISION';
export interface DecisionState {
  leveledChecks: LeveledSkillCheck[];
  selected: LeveledSkillCheck|null;
  rolls: number[];
}
export const EMPTY_DECISION_STATE: DecisionState = {
  leveledChecks: [],
  selected: null,
  rolls: [],
};

export interface StateProps {
  multiplayerState: MultiplayerState;
  node: ParserNode;
  settings: SettingsType;
  rng: () => number;
  theme: CardThemeType;
}

export function mapStateToProps(state: AppStateWithHistory, ownProps: Partial<StateProps>): StateProps {
  const node = ownProps.node || state.quest.node;
  return {
    multiplayerState: state.multiplayer,
    node,
    settings: state.settings,
    rng: seedrandom.alea((node && node.ctx.seed) || ''),
    theme: getCardTemplateTheme(state.card),
  };
}

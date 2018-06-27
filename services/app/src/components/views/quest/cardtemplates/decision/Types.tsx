export type SkillType = 'Athletics' | 'Knowledge' | 'Charisma';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type PersonaType = 'Light' | 'Dark';
export const SKILL_TYPES: SkillType[] = ['Athletics', 'Knowledge', 'Charisma'];
export const DIFFICULTIES: DifficultyType[] = ['Easy', 'Medium', 'Hard'];
export const PERSONA_TYPES: PersonaType[] = ['Light', 'Dark'];

export interface DecisionType {
  difficulty: DifficultyType|null;
  numAttempts: number;
  persona: PersonaType|null;
  skill: SkillType;
}
export const EMPTY_DECISION: DecisionType = {difficulty: null, persona: null, skill: 'Athletics', numAttempts: 0};

// TODO: Allow specific icons for each instruction.
export interface OutcomeType {type: 'SUCCESS'|'FAILURE'|'RETRY'|'INTERRUPTED'; text: string; instructions: string[]; }
export const EMPTY_OUTCOME: OutcomeType = {type: 'RETRY', text: '', instructions: []};

export interface ScenarioType {
  failure: OutcomeType;
  nonevent: OutcomeType;
  persona: PersonaType;
  prelude: string;
  retry: OutcomeType|null; // If null, a generic "motivational" snippet is shown.
  skill: SkillType;
  success: OutcomeType;
}
export const EMPTY_SCENARIO: ScenarioType = {
  failure: EMPTY_OUTCOME,
  nonevent: EMPTY_OUTCOME,
  persona: 'Light',
  prelude: '',
  retry: null,
  skill: 'Athletics',
  success: EMPTY_OUTCOME,
};

export type DecisionPhase = 'PREPARE_DECISION' | 'DECISION_TIMER' | 'RESOLVE_DECISION';
export interface DecisionState {
  choice: DecisionType;
  numAttempts: number;
  outcomes: OutcomeType[];
  scenario: ScenarioType;
}
export const EMPTY_DECISION_STATE: DecisionState = {
  choice: EMPTY_DECISION,
  numAttempts: 0,
  outcomes: [],
  scenario: EMPTY_SCENARIO,
};

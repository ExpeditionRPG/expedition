export type SkillType = 'Athletics' | 'Knowledge' | 'Charisma';
export type DifficultyType = 'Easy' | 'Medium' | 'Hard';
export type PersonaType = 'Light' | 'Dark';
export const SKILL_TYPES: SkillType[] = ['Athletics', 'Knowledge', 'Charisma'];
export const DIFFICULTIES: DifficultyType[] = ['Easy', 'Medium', 'Hard'];
export const PERSONA_TYPES: PersonaType[] = ['Light', 'Dark'];

export type DecisionType = {
  difficulty: DifficultyType|null;
  persona: PersonaType|null;
  skill: SkillType;
  numAttempts: number;
};
export const EMPTY_DECISION: DecisionType = {difficulty: null, persona: null, skill: 'Athletics', numAttempts: 0};

// TODO: Allow specific icons for each instruction.
export type OutcomeType = {type: 'SUCCESS'|'FAILURE'|'RETRY'|'INTERRUPTED', text: string, instructions: string[]};
export const EMPTY_OUTCOME: OutcomeType = {type: 'RETRY', text: '', instructions: []};

export interface ScenarioType {
  persona: PersonaType;
  skill: SkillType;

  prelude: string;

  success: OutcomeType;
  failure: OutcomeType;
  nonevent: OutcomeType;

  // If null, a generic "motivational" snippet is shown.
  retry: OutcomeType|null;
}
export const EMPTY_SCENARIO: ScenarioType = {
  persona: 'Light',
  skill: 'Athletics',
  prelude: '',
  success: EMPTY_OUTCOME,
  failure: EMPTY_OUTCOME,
  nonevent: EMPTY_OUTCOME,
  retry: null,
}

export type DecisionPhase = 'PREPARE_DECISION' | 'DECISION_TIMER' | 'RESOLVE_DECISION';
export interface DecisionState {
  choice: DecisionType;
  scenario: ScenarioType;
  numAttempts: number;
  outcomes: OutcomeType[];
}
export const EMPTY_DECISION_STATE: DecisionState = {
  choice: EMPTY_DECISION,
  scenario: EMPTY_SCENARIO,
  numAttempts: 0,
  outcomes: [],
};

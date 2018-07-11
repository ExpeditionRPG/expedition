import Redux from 'redux';
import * as seedrandom from 'seedrandom';
import {extractSkillCheck, SkillCheck} from 'shared/schema/templates/Decision';
import {QuestNodeAction, remoteify} from '../../../../../actions/ActionTypes';
import {audioSet} from '../../../../../actions/Audio';
import {toCard} from '../../../../../actions/Card';
import {PLAYER_TIME_MULT} from '../../../../../Constants';
import {AppStateWithHistory, MultiplayerState, SettingsType} from '../../../../../reducers/StateTypes';
import {ParserNode} from '../TemplateTypes';
// import SCENARIOS from './Scenarios';
import {DecisionState, Difficulty, LeveledSkillCheck, OutcomeContent, RETRY_THRESHOLD_MAP, SUCCESS_THRESHOLD_MAP} from './Types';

// TODO put this somewhere better
const COMBAT_SKILL_CHECKS = [
  ['light', 'charisma'],
  ['dark', 'charisma'],
  ['light', 'knowledge'],
  ['dark', 'knowledge'],
  ['light', 'athletics'],
  ['dark', 'athletics'],
  [null, 'charisma'],
  [null, 'knowledge'],
  [null, 'athletics'],
];
const skillCheckHistogram: {[check: string]: number} = {};

interface InitDecisionArgs {
  node?: ParserNode;
  settings?: SettingsType;
  rp?: MultiplayerState;
}
export const initDecision = remoteify(function initDecision(a: InitDecisionArgs, dispatch: Redux.Dispatch<any>,  getState: () => AppStateWithHistory) {
  if (!a.node || !a.settings) {
    a.node = getState().quest.node;
    a.settings = getState().settings;
  }
  if (!a.rp) {
    a.rp = getState().multiplayer;
  }

  console.log('Initializing decision');
  a.node = a.node.clone();
  const settings = getState().settings;
  a.node.ctx.templates.decision = generateDecisionTemplate(numLocalAndMultiplayerAdventurers(a.settings, a.rp), a.node);
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: 'PREPARE_DECISION', noHistory: true}));
  return {};
});

const NUM_SKILL_CHECK_CHOICES = 3;
// Generate 3 random combinations of difficulty, skill, and persona.
// Only 2 of the 3 fields will be available.
export function generateChecks(settings: SettingsType, rng: () => number, maxAllowedAttempts?: number): LeveledSkillCheck[] {
  const result: LeveledSkillCheck[] = [];

  // TODO Make less dumb
  /*
  // TODO: Also randomly choose dark.
  // TODO: Also propagate hardness
  // const choosable = SCENARIOS[a.decision.skill][a.decision.persona || ((arng() > 0.5) ? 'Light' : 'Dark')];
  // decision.scenario = choosable[Math.floor(arng() * choosable.length)];

  const selection = [[0, 1, 1], [1, 0, 1]][Math.floor(rng() * 2)];

  while (result.length < NUM_SKILL_CHECK_CHOICES) {
    const maxAttempts = Math.min(maxAllowedAttempts || 999, 3);
    const minAttempts = 1;

    const gen = {
      difficulty: (selection[0]) ? DIFFICULTIES[Math.floor(rng() * DIFFICULTIES.length)] : null,
      numAttempts: Math.min(settings.numPlayers, Math.floor(rng() * (maxAttempts - minAttempts + 1) + minAttempts)),
      persona: (selection[1]) ? PERSONA_TYPES[Math.floor(rng() * PERSONA_TYPES.length)] : null,
      skill: SKILL_TYPES[Math.floor(rng() * SKILL_TYPES.length)],
    };

    // Throw the generated one away if it exactly matches a result we've already generated
    for (const r of result) {
      if (r.difficulty === gen.difficulty && r.persona === gen.persona && r.skill === gen.skill) {
        continue;
      }
    }
    result.push(gen);
  }
  */
  return result;
}

// TODO DEDUPE
function numLocalAndMultiplayerAdventurers(settings: SettingsType, rp: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    // Since single player still has two adventurers, the minimum possible is two.
    return Math.max(2, settings.numPlayers);
  }

  let count = 0;
  for (const c of Object.keys(rp.clientStatus)) {
    const status = rp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numPlayers || 1);
  }
  return count || 1;
}

// TODO DEDUPE
function numLocalAndMultiplayerPlayers(settings: SettingsType, rp?: MultiplayerState): number {
  if (!rp || !rp.clientStatus || Object.keys(rp.clientStatus).length < 2) {
    return settings.numPlayers;
  }

  let count = 0;
  for (const c of Object.keys(rp.clientStatus)) {
    const status = rp.clientStatus[c];
    if (!status.connected) {
      continue;
    }
    count += (status.numPlayers || 1);
  }
  return count || 1;
}

function generateDecisionTemplate(numTotalAdventurers: number, node?: ParserNode): DecisionState {
  const checks: SkillCheck[] = [];
  if (node) {
    node.loopChildren((tag, c) => {
      if (tag !== 'choice') {
        return;
      }
      const check = extractSkillCheck(c.attr('text') || '');
      if (!check) {
        return;
      }

      console.log(check);
      checks.push(check);
      return;
    });
  }

  console.warn('todo limit num checks');
  const leveledChecks = checks.map((c: SkillCheck): LeveledSkillCheck => {
    return {...c, difficulty: 'medium', requiredSuccesses: numTotalAdventurers};
  });

  return {
    leveledChecks,
    selected: null,
    rolls: [],
  };
}

export function skillTimeMillis(settings: SettingsType, rp?: MultiplayerState) {
  const totalPlayerCount = numLocalAndMultiplayerPlayers(settings, rp);
  // TODO use different value here
  return settings.timerSeconds * 1000 * PLAYER_TIME_MULT[totalPlayerCount];
}

interface HandleDecisionArgs {
  selected: LeveledSkillCheck;
  elapsedMillis: number;
  node?: ParserNode;
}
export const handleDecisionSelect = remoteify(function handleDecisionSelect(a: HandleDecisionArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionArgs|null {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  a.node = a.node.clone();
  const decision = a.node.ctx.templates.decision;
  if (!decision) {
    return null;
  }

  decision.selected = a.selected;
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);

  return {
    selected: a.selected,
    elapsedMillis: a.elapsedMillis,
  };
});

interface HandleDecisionRollArgs {
  node?: ParserNode;
  roll: number;
}
export const handleDecisionRoll = remoteify(function handleDecisionRoll(a: HandleDecisionRollArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionRollArgs|null {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  a.node = a.node.clone();
  const decision = a.node.ctx.templates.decision;
  if (!decision) {
    return null;
  }

  decision.rolls.push(a.roll);
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);

  return {
    roll: a.roll,
  };
});

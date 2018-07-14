import Redux from 'redux';
import {extractSkillCheck, Outcome, SkillCheck} from 'shared/schema/templates/Decision';
import {QuestNodeAction, remoteify} from '../../../../../actions/ActionTypes';
import {toCard} from '../../../../../actions/Card';
import {event} from '../../../../../actions/Quest';
import {PLAYER_TIME_MULT} from '../../../../../Constants';
import {AppStateWithHistory, MultiplayerState, SettingsType} from '../../../../../reducers/StateTypes';
import {numLocalAndMultiplayerAdventurers, numLocalAndMultiplayerPlayers} from '../MultiplayerPlayerCount';
import {ParserNode} from '../TemplateTypes';
// import SCENARIOS from './Scenarios';
import {DecisionState, LeveledSkillCheck, RETRY_THRESHOLD_MAP, SUCCESS_THRESHOLD_MAP} from './Types';

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
  node: ParserNode;
  rp?: MultiplayerState;
}
export const initDecision = remoteify(function initDecision(a: InitDecisionArgs, dispatch: Redux.Dispatch<any>,  getState: () => AppStateWithHistory) {
  if (!a.rp) {
    a.rp = getState().multiplayer;
  }

  a.node = a.node.clone();
  const settings = getState().settings;
  a.node.ctx.templates.decision = generateDecisionTemplate(numLocalAndMultiplayerAdventurers(settings, a.rp), a.node);
  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: 'PREPARE_DECISION', noHistory: true}));
  return {};
});

export function computeSuccesses(rolls: number[], selected: LeveledSkillCheck): number {
  const successThreshold = SUCCESS_THRESHOLD_MAP[selected.difficulty || 'Medium'];
  return rolls.reduce((acc, r) => (r >= successThreshold) ? acc + 1 : acc, 0);
}

export function computeOutcome(rolls: number[], selected: LeveledSkillCheck, settings: SettingsType, rp: MultiplayerState): (keyof typeof Outcome)|null {
  // Compute the outcome from the most recent roll (if any)
  const numTotalAdventurers = numLocalAndMultiplayerAdventurers(settings, rp);
  const retryThreshold = RETRY_THRESHOLD_MAP[selected.difficulty || 'Medium'];
  const successes = computeSuccesses(rolls, selected);
  const failures = rolls.reduce((acc, r) => (r < retryThreshold) ? acc + 1 : acc, 0);
  let outcome: (keyof typeof Outcome)|null = null;
  if (successes >= selected.requiredSuccesses) {
    outcome = Outcome.success;
  } else if (failures > 0) {
    outcome = Outcome.failure;
  } else if (rolls.length >= numTotalAdventurers) {
    outcome = Outcome.interrupted;
  } else if (rolls.length > 0) {
    outcome = Outcome.retry;
  }
  return outcome;
}

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

export function generateDecisionTemplate(numTotalAdventurers: number, node?: ParserNode): DecisionState {
  const checks: SkillCheck[] = [];
  if (node) {
    node.loopChildren((tag, c) => {
      if (tag !== 'event') {
        return;
      }
      const check = extractSkillCheck(c.attr('on') || '');
      if (!check || !check.skill) {
        return;
      }

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
  const selected = decision.selected;
  if (!selected) {
    return null;
  }

  decision.rolls.push(a.roll);

  // Based on the outcome, navigate to a roleplay card
  const settings = getState().settings;
  const rp = getState().multiplayer;
  const outcome = computeOutcome(decision.rolls, selected, settings, rp);

  // In all cases except for retry and just having chosen the check,
  // there's a chance we need to follow an event bullet.
  // Here we check for the best event for the given outcome.
  if (outcome && outcome !== Outcome.retry) {
    let targetCheck: SkillCheck|null = null;
    let targetText: string|null = null;

    a.node.loopChildren((tag, c) => {
      if (tag !== 'event') {
        return;
      }
      const text = c.attr('on') || '';
      const check = extractSkillCheck(text);
      if (!check) {
        return;
      }
      const checkOutcome = check.outcome || Outcome.success;
      if (checkOutcome !== outcome) {
        return;
      }
      if (check.persona !== undefined && check.persona !== selected.persona) {
        return;
      }
      if (check.skill !== undefined && check.skill !== selected.skill) {
        return;
      }

      // Resolve conflicts in favor of more specific event
      if (targetCheck !== null) {
        if (targetCheck.skill && !check.skill) {
          return;
        }
        if (targetCheck.persona && !check.persona) {
          return;
        }
      }

      targetCheck = check;
      targetText = text;
      return;
    });

    if (targetText) {
      dispatch(event({node: a.node, evt: targetText}));
      return {
        roll: a.roll,
      };
    }
  }

  dispatch({type: 'PUSH_HISTORY'});
  dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
  dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION', noHistory: true, keySuffix: Date.now().toString()}));

  return {
    roll: a.roll,
  };
});

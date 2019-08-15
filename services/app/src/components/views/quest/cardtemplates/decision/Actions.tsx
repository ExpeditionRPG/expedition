import {QuestNodeAction} from 'app/actions/ActionTypes';
import {toCard, ToCardArgs} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {numAliveAdventurers, numPlayers} from 'app/actions/Settings';
import {PLAYER_TIME_MULT} from 'app/Constants';
import {remoteify} from 'app/multiplayer/Remoteify';
import {AppStateWithHistory, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import Redux from 'redux';
import {extractSkillCheck, Outcome, Persona, Skill, SkillCheck} from 'shared/schema/templates/Decision';
import {CombatPhase} from '../combat/Types';
import {resolveParams} from '../Params';
import {setAndRenderNode} from '../Render';
import {ParserNode} from '../TemplateTypes';
import {DecisionPhase, DecisionState, Difficulty, EMPTY_DECISION_STATE, LeveledSkillCheck, RETRY_THRESHOLD_MAP, SUCCESS_THRESHOLD_MAP} from './Types';

const MAX_REQUIRED_SUCCESSES = 3;
const MIN_REQUIRED_SUCCESSES = 1;

const seedrandom = require('seedrandom');

export function extractDecision(node: ParserNode): DecisionState {
  return (node &&
          node.ctx &&
          node.ctx.templates &&
          node.ctx.templates.decision)
          || EMPTY_DECISION_STATE;
}

interface InitDecisionArgs {
  node: ParserNode;
  mp?: MultiplayerState;
}
export const initDecision = remoteify(function initDecision(a: InitDecisionArgs, dispatch: Redux.Dispatch<any>,  getState: () => AppStateWithHistory) {
  if (!a.mp) {
    a.mp = getState().multiplayer;
  }

  a.node = a.node.clone();
  const settings = getState().settings;
  const aliveAdventurers = numAliveAdventurers(settings, a.node, a.mp);
  const maxRolls = parseInt(a.node.elem.attr('maxrolls') || '999', 10);
  const leveledChecks = parseDecisionChecks(Math.min(aliveAdventurers, maxRolls), seedrandom.alea(a.node.ctx.seed), a.node);
  if (leveledChecks.length === 0) {
    throw new Error('No valid choices for skill check');
  }
  a.node.ctx.templates.decision = {
    leveledChecks,
    selected: null,
    rolls: [],
    phase: DecisionPhase.prepare,
  };
  dispatch(setAndRenderNode(a.node));
  return {};
});

export function computeSuccesses(rolls: number[], selected: LeveledSkillCheck): number {
  const successThreshold = SUCCESS_THRESHOLD_MAP[selected.difficulty || 'Medium'];
  return rolls.reduce((acc, r) => (r >= successThreshold) ? acc + 1 : acc, 0);
}

// Credit: https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandomSubarray<T>(arr: T[], size: number, rng: () => number) {
    const shuffled = arr.slice(0);
    let i = arr.length;
    const min = i - size;
    while (i-- > min) {
        const index = Math.floor((i + 1) * rng());
        const temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

const MAX_SHOWN_CHECKS = 3;
export function selectChecks(cs: LeveledSkillCheck[], rng: () => number): LeveledSkillCheck[] {
  const mapped: {[k: string]: LeveledSkillCheck[]} = {};
  for (const c of cs) {
    const k = `${c.persona} ${c.skill}`;
    if (!mapped[k]) {
      mapped[k] = [];
    }
    mapped[k].push(c);
  }

  let keys = Object.keys(mapped);
  if (keys.length > MAX_SHOWN_CHECKS) {
    keys = getRandomSubarray(Object.keys(mapped), MAX_SHOWN_CHECKS, rng);
  }
  return keys.map((k) => {
      return mapped[k][Math.floor(rng() * mapped[k].length)];
    });
}

export function computeOutcome(rolls: number[], selected: LeveledSkillCheck, settings: SettingsType, node: ParserNode, rp: MultiplayerState, hasInterrupted: boolean): (keyof typeof Outcome)|null {
  // Compute the outcome from the most recent roll (if any)
  const aliveAdventurers = numAliveAdventurers(settings, node, rp);
  const retryThreshold = RETRY_THRESHOLD_MAP[selected.difficulty || 'Medium'];
  const successes = computeSuccesses(rolls, selected);
  const failures = rolls.reduce((acc, r) => (r < retryThreshold) ? acc + 1 : acc, 0);
  const maxRolls = parseInt(node.elem.attr('maxrolls') || '999', 10);

  let outcome: (keyof typeof Outcome)|null = null;
  if (successes >= selected.requiredSuccesses || (rolls.length >= aliveAdventurers && !hasInterrupted)) {
    outcome = Outcome.success;
  } else if (failures > 0) {
    outcome = Outcome.failure;
  } else if (rolls.length >= aliveAdventurers || (maxRolls && rolls.length >= maxRolls)) {
    outcome = Outcome.interrupted;
  } else if (rolls.length > 0) {
    outcome = Outcome.retry;
  }
  return outcome;
}

function choose<T>(l: T[], rng: () => number): T {
  return l[Math.floor(rng() * l.length)];
}

function generateRequiredSuccesses(maxRequiredSuccesses: number, rng: () => number): number {
  return Math.max(MIN_REQUIRED_SUCCESSES, Math.min(MAX_REQUIRED_SUCCESSES, Math.floor(rng() * maxRequiredSuccesses)));
}

export function generateLeveledChecks(maxRequiredSuccesses: number, rng: () => number): LeveledSkillCheck[] {
  const results: LeveledSkillCheck[] = [];
  while (results.length < 3) {
    const gen = {
      persona: choose<keyof typeof Persona>(Object.keys(Persona) as any, rng),
      skill: choose<keyof typeof Skill>(Object.keys(Skill) as any, rng),
      difficulty: choose<keyof typeof Difficulty>(Object.keys(Difficulty) as any, rng),
      requiredSuccesses: generateRequiredSuccesses(maxRequiredSuccesses, rng),
    };

    for (const r of results) {
      if (r.persona === gen.persona && r.skill === gen.skill && r.difficulty === gen.difficulty) {
        continue;
      }
    }
    results.push(gen);
  }
  return results;
}

function parseDecisionChecks(maxRequiredSuccesses: number, rng: () => number, node?: ParserNode): LeveledSkillCheck[] {
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

  return checks.map((c: SkillCheck): LeveledSkillCheck => {
    return {...c, difficulty: 'medium', requiredSuccesses: generateRequiredSuccesses(maxRequiredSuccesses, rng)};
  });
}

export function skillTimeMillis(settings: SettingsType, rp?: MultiplayerState) {
  const totalPlayerCount = numPlayers(settings, rp);
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
  decision.phase = DecisionPhase.resolve;
  dispatch(setAndRenderNode(a.node));

  return {
    selected: a.selected,
    elapsedMillis: a.elapsedMillis,
  };
});

interface HandleDecisionTimerStartArgs {
  node?: ParserNode;
}
export const handleDecisionTimerStart = remoteify(function handleDecisionTimerStart(a: HandleDecisionTimerStartArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionTimerStartArgs|null {
  if (!a.node) {
    a.node = getState().quest.node;
  }
  a.node = a.node.clone();
  const decision = a.node.ctx.templates.decision;
  if (!decision) {
    return null;
  }

  decision.phase = DecisionPhase.timer;
  dispatch(setAndRenderNode(a.node));

  return {};
});

// Pushes the roll value onto the given node, returning a string
// event name if such an event exists on the node.
function pushDecisionRoll(node: ParserNode, roll: number, getState: () => AppStateWithHistory): string|null {
  const decision = node.ctx.templates.decision;
  if (!decision) {
    return null;
  }
  const selected = decision.selected;
  if (!selected) {
    return null;
  }

  decision.rolls.push(roll);
  decision.phase = DecisionPhase.resolve;

  // Based on the outcome, navigate to a roleplay card
  const {settings, multiplayer, card} = getState();
  const hasInterrupted = (card.phase === CombatPhase.midCombatDecision) || (node.getVisibleKeys().filter((k) => k === 'interrupted').length > 0);
  const outcome = computeOutcome(decision.rolls, selected, settings, node, multiplayer, hasInterrupted);

  // In all cases except for retry and just having chosen the check,
  // there's a chance we need to follow an event bullet.
  // Here we check for the best event for the given outcome.
  // TODO: If outcome is "interrupted" and we don't have any events for it,
  // fall back to "failure".
  if (outcome && outcome !== Outcome.retry) {
    let targetCheck: SkillCheck|null = null;
    let targetText: string|null = null;

    node.loopChildren((tag, c) => {
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
      return targetText;
    }
  }
  return null;
}

interface HandleDecisionRollArgs {
  node?: ParserNode;
  roll: number;
}
export const handleDecisionRoll = remoteify(function handleDecisionRoll(a: HandleDecisionRollArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): HandleDecisionRollArgs|null {
  if (getState().card.phase === CombatPhase.midCombatDecision) {
    const {node} = resolveParams(a.node, getState);
    pushDecisionRoll(node, a.roll, getState);
    dispatch(toDecisionCard({phase: DecisionPhase.resolve, node}));
    return {
      roll: a.roll,
    };
  }

  if (!a.node) {
    a.node = getState().quest.node;
  }
  a.node = a.node.clone();

  const targetText = pushDecisionRoll(a.node, a.roll, getState);
  if (targetText) {
    dispatch(event({node: a.node, evt: targetText}));
  } else {
    dispatch(setAndRenderNode(a.node));
  }
  return {
    roll: a.roll,
  };
});

interface ToDecisionCardArgs extends Partial<ToCardArgs> {
  node?: ParserNode;
  phase: DecisionPhase;
}
export const toDecisionCard = remoteify(function toDecisionCard(a: ToDecisionCardArgs, dispatch: Redux.Dispatch<any>, getState: () => AppStateWithHistory): ToDecisionCardArgs {
  const phase = a.phase || DecisionPhase.prepare;
  const statePhase = getState().card.phase;

  // Non-combat flow
  if (statePhase !== CombatPhase.midCombatDecision && statePhase !== CombatPhase.midCombatDecisionTimer && a.name !== undefined) {
    console.log('noncombat');
    const a2: ToCardArgs = {
      keySuffix: a.keySuffix,
      name: a.name || CombatPhase.midCombatDecision,
      noHistory: a.noHistory,
      overrideDebounce: a.overrideDebounce,
      phase,
    };
    dispatch(toCard(a2));
    return {...a2, phase};
  }

  // Combat flow
  console.log('combat');
  const {node, decision, combat} = resolveParams(a.node, getState);
  combat.phase = (phase === DecisionPhase.timer) ? CombatPhase.midCombatDecisionTimer : CombatPhase.midCombatDecision;
  combat.decisionPhase = phase;
  console.log(node.ctx.templates.combat);
  dispatch(setAndRenderNode(node));

  return {
  phase: a.phase,
};
});

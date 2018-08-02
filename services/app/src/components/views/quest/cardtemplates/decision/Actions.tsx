import {QuestNodeAction, remoteify} from 'app/actions/ActionTypes';
import {toCard} from 'app/actions/Card';
import {event} from 'app/actions/Quest';
import {PLAYER_TIME_MULT} from 'app/Constants';
import {AppStateWithHistory, MultiplayerState, SettingsType} from 'app/reducers/StateTypes';
import Redux from 'redux';
import {extractSkillCheck, Outcome, SkillCheck} from 'shared/schema/templates/Decision';
import {numAdventurers, numPlayers} from '../PlayerCount';
import {ParserNode} from '../TemplateTypes';
import {LeveledSkillCheck, RETRY_THRESHOLD_MAP, SUCCESS_THRESHOLD_MAP} from './Types';

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
  const leveledChecks = parseDecisionChecks(numAdventurers(settings, a.rp), a.node);
  a.node.ctx.templates.decision = {
    leveledChecks,
    selected: null,
    rolls: [],
  };
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
  const numTotalAdventurers = numAdventurers(settings, rp);
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

export function generateLeveledChecks(numTotalAdventurers: number): LeveledSkillCheck[] {
  // TODO
  return [
    {persona: 'light', skill: 'athletics', difficulty: 'medium', requiredSuccesses: numTotalAdventurers},
    {persona: 'light', skill: 'athletics', difficulty: 'medium', requiredSuccesses: numTotalAdventurers},
    {persona: 'light', skill: 'athletics', difficulty: 'medium', requiredSuccesses: numTotalAdventurers},
  ];
}

export function parseDecisionChecks(numTotalAdventurers: number, node?: ParserNode): LeveledSkillCheck[] {
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
    return {...c, difficulty: 'medium', requiredSuccesses: numTotalAdventurers};
  });
}

export function skillTimeMillis(settings: SettingsType, rp?: MultiplayerState) {
  const totalPlayerCount = numPlayers(settings, rp);
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

// Pushes the roll value onto the given node, returning a string
// event name if such an event exists on the node.
export function pushDecisionRoll(node: ParserNode, roll: number, getState: () => AppStateWithHistory): string|null {
  const decision = node.ctx.templates.decision;
  if (!decision) {
    return null;
  }
  const selected = decision.selected;
  if (!selected) {
    return null;
  }

  decision.rolls.push(roll);

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
  if (!a.node) {
    a.node = getState().quest.node;
  }
  a.node = a.node.clone();

  const targetText = pushDecisionRoll(a.node, a.roll, getState);
  if (targetText) {
    dispatch(event({node: a.node, evt: targetText}));
  } else {
    dispatch({type: 'PUSH_HISTORY'});
    dispatch({type: 'QUEST_NODE', node: a.node} as QuestNodeAction);
    dispatch(toCard({name: 'QUEST_CARD', phase: 'RESOLVE_DECISION', noHistory: true, keySuffix: Date.now().toString()}));
  }
  return {
    roll: a.roll,
  };
});

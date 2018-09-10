import {
  extractDecision,
  initDecision,
  computeSuccesses,
  computeOutcome,
  generateLeveledChecks,
  skillTimeMillis,
  handleDecisionRoll,
  toDecisionCard,
} from './Actions';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {EMPTY_DECISION_STATE} from './Types';
import {Action, newMockStore} from 'app/Testing';
import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {Outcome} from 'shared/schema/templates/Decision';

const cheerio = require('cheerio');
const seedrandom = require('seedrandom');

const TEST_SETTINGS = {
  audioEnabled: false,
  autoRoll: false,
  contentSets: {
    horror: false,
  },
  difficulty: 'NORMAL' as DifficultyType,
  experimental: false,
  fontSize: 'NORMAL' as FontSizeType,
  multitouch: true,
  numPlayers: 3,
  showHelp: true,
  simulator: false,
  timerSeconds: 10,
  vibration: true,
};

const TEST_RP = {
  ...initialMultiplayer,
  clientStatus: {
    1: {
      connected: true,
      numPlayers: 3,
      type: 'STATUS',
    },
    2: {
      connected: true,
      numPlayers: 2,
      type: 'STATUS',
    },
  },
} as MultiplayerState;

const TEST_NODE = new ParserNode(cheerio.load(`
  <decision>
    <p>Decision text</p>
    <event on="light athletics"></event>
    <event on="dark athletics"></event>
    <event on="charisma"></event>
    <event on="failure"><roleplay>failure node reached</roleplay></event>
    <event on="interrupted"></event>
  </decision>`)('decision'), defaultContext());

describe('Decision actions', () => {
  function setup(): ParserNode {
    const node = Action(initDecision, {
      settings: TEST_SETTINGS,
      multiplayer: TEST_RP,
    }).execute({node: TEST_NODE.clone()})[1].node;
    const decision = extractDecision(node);
    decision.selected = decision.leveledChecks[0];
    node.ctx.templates.combat = {decisionPhase: 'RESOLVE_DECISION'}; // Ignored if non-combat, used if mid-combat
    return node;
  }

  describe('extractDecision', () => {
    test('extracts the decision from a node', () => {
      const n = TEST_NODE.clone();
      const d: DecisionState = {
          leveledChecks: [],
          selected: null,
          rolls: [1,2,3],
        };
      n.ctx.templates.decision = d;
      expect(extractDecision(n)).toEqual(d);
    });
    test('handles null node', () => {
      expect(extractDecision(TEST_NODE.clone())).toEqual(EMPTY_DECISION_STATE);
    });
  });
  describe('initDecision', () => {
    test('sets up decision template within node using qdl', () => {
      const actions = Action(initDecision, {
        settings: TEST_SETTINGS,
        multiplayer: TEST_RP,
      }).execute({node: TEST_NODE.clone()});
      expect(extractDecision(actions[1].node)).toEqual({
        "leveledChecks": [
          {difficulty: 'medium', persona: 'light', requiredSuccesses: 5, skill: 'athletics'},
          {difficulty: 'medium', persona: 'dark', requiredSuccesses: 5, skill: 'athletics'},
          {difficulty: 'medium', persona: undefined, requiredSuccesses: 5, skill: 'charisma'}],
          "rolls": [],
          "selected": null
        });
      expect(actions[2].to).toEqual(jasmine.objectContaining({phase: 'PREPARE_DECISION'}));
    });
  });
  describe('computeSuccesses', () => {
    test('works when zero rolls', () => {
      expect(computeSuccesses([], {difficulty: 'medium'})).toEqual(0);
    });
    test('counts successes and ignores other rolls', () => {
      expect(computeSuccesses([5, 20, 10, 5], {difficulty: 'medium'})).toEqual(1);
    });
    test('respects difficulty', () => {
      expect(computeSuccesses([16, 15, 10, 14], {difficulty: 'hard'})).toEqual(0);
    });
  });
  describe('computeOutcome', () => {
    const selected = {difficulty: 'medium', requiredSuccesses: 5};

    test('computes success', () => {
      expect(computeOutcome([20, 20, 20, 20, 20], selected, TEST_SETTINGS, TEST_RP)).toEqual(Outcome.success);
    });
    test('computes failure', () => {
      expect(computeOutcome([1], selected, TEST_SETTINGS, TEST_RP)).toEqual(Outcome.failure);
    });
    test('computes interrupted', () => {
      expect(computeOutcome([20, 20, 20, 20, 10], selected, TEST_SETTINGS, TEST_RP)).toEqual(Outcome.interrupted);
    });
    test('computes retry', () => {
      expect(computeOutcome([20, 20, 20, 20], selected, TEST_SETTINGS, TEST_RP)).toEqual(Outcome.retry);
    });
    test('returns null when no rolls', () => {
      expect(computeOutcome([], selected, TEST_SETTINGS, TEST_RP)).toEqual(null);
    });
  });
  describe('generateLeveledChecks', () => {
    test('returns 3 semi-unique, generated checks', () => {
      expect(generateLeveledChecks(5, seedrandom.alea('1234'))).toEqual([
        {difficulty: 'hard', persona: 'light', requiredSuccesses: 1, skill: 'athletics'},
        {difficulty: 'medium', persona: 'dark', requiredSuccesses: 3, skill: 'athletics'},
        {difficulty: 'easy', persona: 'light', requiredSuccesses: 1, skill: 'knowledge'},
      ]);
    });
    test('scales num successes with num adventurers', () => {
      expect(Math.max(...generateLeveledChecks(1, seedrandom.alea('1234')).map((c) => c.requiredSuccesses))).toEqual(1);
      expect(Math.max(...generateLeveledChecks(6, seedrandom.alea('1234')).map((c) => c.requiredSuccesses))).toBeGreaterThan(3);
    });
    test.skip('scales difficulty with the number of times this type of check was selected previously', () => { /* TODO */ });
  });
  describe('skillTimeMillis', () => {
    test('scales with player count', () => {
      expect(skillTimeMillis(TEST_SETTINGS, TEST_RP)).toBeLessThan(skillTimeMillis({...TEST_SETTINGS, numPlayers: 1}, initialMultiplayer));
    });
    test.skip('respects settings', () => { /* TODO */});
  });
  describe('handleDecisionRoll', () => {
    test('pushes the roll value onto the node', () => {
      const actions = Action(handleDecisionRoll, {
        card: {phase: 'MID_COMBAT_DECISION'},
        settings: TEST_SETTINGS,
        multiplayer: TEST_RP
      }).execute({node: setup(), roll: 5});
      expect(extractDecision(actions[1].node).rolls).toEqual([5]);
    });
    test('fires event for matching outcome event in the node', () => {
      const actions = Action(handleDecisionRoll, {
        card: {phase: ''},
        settings: TEST_SETTINGS,
        multiplayer: TEST_RP
      }).execute({node: setup(), roll: 1});
      expect(actions[1].node.elem.text()).toEqual('failure node reached');
    });
    test('continues resolve phase if no matching outcome event', () => {
      const actions = Action(handleDecisionRoll, {
        card: {phase: ''},
        settings: TEST_SETTINGS,
        multiplayer: TEST_RP
      }).execute({node: setup(), roll: 10});
      expect(actions[2].to.phase).toEqual('RESOLVE_DECISION');
    });
    test('mid-combat decision remains in combat when resolving', () => {
      const actions = Action(handleDecisionRoll, {
        card: {phase: 'MID_COMBAT_DECISION'},
        settings: TEST_SETTINGS,
        multiplayer: TEST_RP
      }).execute({node: setup(), roll: 10});
      expect(actions[2].to).toEqual(jasmine.objectContaining({phase: 'MID_COMBAT_DECISION'}));
      expect(actions[1].node.ctx.templates.combat.decisionPhase).toEqual('RESOLVE_DECISION');
    });
    test('mid-combat decision remains in combat when resolving', () => {
      const actions = Action(handleDecisionRoll, {
        card: {phase: 'MID_COMBAT_DECISION'},
        settings: TEST_SETTINGS,
        multiplayer: TEST_RP
      }).execute({node: setup(), roll: 10});
      expect(actions[2].to).toEqual(jasmine.objectContaining({phase: 'MID_COMBAT_DECISION'}));
      expect(actions[1].node.ctx.templates.combat.decisionPhase).toEqual('RESOLVE_DECISION');
    });
  });
  describe('toDecisionCard', () => {
    test('goes to MID_COMBAT_DECISION if in combat', () => {
      const actions = Action(toDecisionCard, {card: {phase: 'MID_COMBAT_DECISION'}}).execute({node: setup()});
      expect(actions[2].to).toEqual(jasmine.objectContaining({phase: 'MID_COMBAT_DECISION'}));
    });
    test('does pass-thru to toCard if not in combat', () => {
      const actions = Action(toDecisionCard, {card: {phase: ''}}).execute({node: setup() name: 'QUEST_CARD', phase: 'RESOLVE_DECISION'});
      expect(actions[1].to).toEqual(jasmine.objectContaining({phase: 'RESOLVE_DECISION'}));
    });
  });
});

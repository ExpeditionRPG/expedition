import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {DifficultyType, FontSizeType, MultiplayerState} from 'app/reducers/StateTypes';
import {Action, newMockStore} from 'app/Testing';
import {fakeConnection} from 'app/multiplayer/Testing';
import {getMultiplayerConnection} from 'app/multiplayer/Connection';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  findCombatParent,
  handleCombatEnd,
  handleCombatTimerStop,
  handleResolvePhase,
  initCombat,
  isSurgeNextRound,
  roundTimeMillis,
  tierSumDelta,
  handleCombatTimerStart,
  setupCombatDecision,
} from './Actions';
import {Multiplayer as m, Settings as s} from 'app/reducers/TestData';

const cheerio: any = require('cheerio');

const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Test</e><e>Lich</e><e>lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());

const checkNodeIntegrity = jest.fn((before: ParserNode|null, after: ParserNode|null) {
  // Pass null/null to ignore the integrity check
  if (before === null && after === null) {
    return;
  }
  expect(before.ctx.seed).toEqual(after.ctx.seed);
});

describe('Combat actions', () => {
  beforeEach(() => {
    checkNodeIntegrity.mockClear();
  });

  afterEach(() => {
    // Actions on combat nodes must *not* result in a combat node with a different seed.
    // It is expected that the node seed should stay the same throughout combat, to be
    // consistent with multiplayer and crawler actions.
    expect(checkNodeIntegrity.mock.calls.length).toEqual(1);
  })

  const newCombatNode = () => {
    const baseNode = Action(initCombat, {settings: s.basic}).execute({node: TEST_NODE.clone()})[1].node;
    return baseNode.clone();
  };

  describe('roundTimeMillis', () => {
    test('Set timer to 10s with two+ players', () => {
      const result = roundTimeMillis({...s.basic, numLocalPlayers: 2});
      expect(result).toEqual(10000);
      checkNodeIntegrity(null, null); // skip
    });
    test('Set timer to 20s with one player', () => {
      const result = roundTimeMillis({...s.basic, numLocalPlayers: 1});
      expect(result).toEqual(20000);
      checkNodeIntegrity(null, null); // skip
    });
    test.skip('Accounts for remote play', () => { /* TODO */ }); // TODO
  });

  describe('initCombat', () => {
    const actions = Action(initCombat, {settings: s.basic}).execute({node: TEST_NODE.clone()});

    test('triggers nav to combat start', () => {
      expect(actions[2]).toEqual(jasmine.objectContaining({
        to: jasmine.objectContaining({
          name: 'QUEST_CARD',
          phase: 'DRAW_ENEMIES',
        }),
        type: 'NAVIGATE',
      }));
      checkNodeIntegrity(null, null); // skip
    });

    test('parses initial state', () => {
      // "Unknown" enemies are given tier 1.
      // Known enemies' tier is parsed from constants.
      expect(actions[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        enemies: [
          {name: 'Test', tier: 1},
          {name: 'Lich', tier: 4, class: 'Undead'},
          {name: 'Lich', tier: 4, class: 'Undead'},
        ],
        numAliveAdventurers: 3,
        roundCount: 0,
        tier: 9,
      }));
      checkNodeIntegrity(null, null); // skip
    });
  });

  describe('isSurgeNextRound', () => {
    test('surges according to the period', () => {
      // "Play" until surge
      const store = newMockStore({settings: s.basic, multiplayer: initialMultiplayer});
      let node = newCombatNode();
      let initNode = node;
      for (let i = 0; i < 10 && (!node || !isSurgeNextRound(node.ctx.templates.combat)); i++) {
        store.clearActions();
        store.dispatch(handleCombatTimerStop({node, settings: s.basic, elapsedMillis: 1000, seed: ''}));
        const actions = store.getActions();
        for (const a of actions) {
          if (a.type === 'QUEST_NODE') {
            node = a.node;
            break;
          }
        }
      }
      expect(isSurgeNextRound(node.ctx.templates.combat)).toEqual(true);

      // Count time till next surge
      let pd = 0;
      do {
        store.clearActions();
        store.dispatch(handleCombatTimerStop({node, settings: s.basic, elapsedMillis: 1000, seed: ''}));
        const actions = store.getActions();
        for (const a of actions) {
          if (a.type === 'QUEST_NODE') {
            node = a.node;
            break;
          }
        }
        pd++;
      } while (pd < 10 && !isSurgeNextRound(node.ctx.templates.combat));
      expect(pd).toEqual(3); // Default for normal difficulty

      checkNodeIntegrity(initNode, node);
    });
  });

  describe('handleCombatTimerStart', () => {
    const PAUSE_TIMER_MATCH = jasmine.objectContaining({
      type: 'MULTIPLAYER_CLIENT_STATUS',
      status: jasmine.objectContaining({
        waitingOn: {elapsedMillis: 0, type: 'TIMER'}
      }),
    });

    function doTest(numAlive: number): any[] {
      const store = newMockStore({
        multiplayer: m.s2p5,
      });
      const node = newCombatNode();
      node.ctx.templates.combat.numAliveAdventurers = numAlive;
      store.dispatch(handleCombatTimerStart({
        node,
        settings: s.basic,
      }));
      return store.getActions();
    }

    test('starts timer (without pausing) when local alive adventurers in multiplayer', () => {
      expect(doTest(2)).not.toContainEqual(PAUSE_TIMER_MATCH);
      checkNodeIntegrity(null, null); // skip
    });

    test('starts timer in pause state when 0 local alive adventurers in multiplayer', () => {
      expect(doTest(0)).toContainEqual(PAUSE_TIMER_MATCH)
      checkNodeIntegrity(null, null); // skip
    });
  });

  describe('handleCombatTimerStop', () => {
    const runTest = (overrides: any) => {
      const startNode = newCombatNode(); // Caution: this reset the multiplayer connection
      const conn = fakeConnection();
      const store = newMockStore({multiplayer: m.s2p5}, conn);
      store.dispatch(handleCombatTimerStop({
        elapsedMillis: 1000,
        node: startNode,
        multiplayer: m.s2p5,
        seed: '',
        settings: s.basic,
        ...overrides,
      }));
      const actions = store.getActions();
      return {startNode, actions, store, conn};
    };

    test('randomly assigns damage', () => {
      const {startNode, actions} = runTest({});
      expect(actions[2].node.ctx.templates.combat.mostRecentAttack.damage).toBeDefined();
      checkNodeIntegrity(startNode, actions[2].node);
    });
    test('generates rolls according to player count', () => {
      const {startNode, actions} = runTest({});
      expect(actions[2].node.ctx.templates.combat.mostRecentRolls.length).toEqual(3);
      checkNodeIntegrity(startNode, actions[2].node);
    });
    test('increments the round counter', () => {
      const {startNode, actions} = runTest({});
      expect(actions[2].node.ctx.templates.combat.roundCount).toEqual(1);
      checkNodeIntegrity(startNode, actions[2].node);
    });
    test('only generates rolls for local, not remote, players', () => {
      const {startNode, actions} = runTest({ multiplayer: m.s2p5 });
      expect(actions[2].node.ctx.templates.combat.mostRecentRolls.length).toEqual(3);
      checkNodeIntegrity(startNode, actions[2].node);
    });
    test('clears waitingOn for multiplayer', () => {
      const {startNode, conn, actions} = runTest({});
      expect(conn.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({type: 'STATUS', waitingOn: undefined}), undefined);
      checkNodeIntegrity(startNode, actions[2].node);
    });
  });

  describe('handleCombatEnd', () => {
    test('levels up if high maxTier on victory', () => {
      const store = newMockStore({settings: s.basic});
      const startNode = newCombatNode();
      store.dispatch(handleCombatEnd({node: startNode, settings: s.basic, victory: true, maxTier: 9, seed: ''}));

      const actions = store.getActions();
      expect(actions[1].node.ctx.templates.combat.levelUp).toEqual(true);
      checkNodeIntegrity(startNode, actions[1].node);
    });

    test('does not level up if low maxTier on victory', () => {
      const store = newMockStore({settings: s.basic});
      const startNode = newCombatNode();
      store.dispatch(handleCombatEnd({node: startNode, settings: s.basic, victory: true, maxTier: 1, seed: ''}));

      const actions = store.getActions();
      expect(actions[1].node.ctx.templates.combat.levelUp).toEqual(false);
      checkNodeIntegrity(startNode, actions[1].node);
    });

    test('assigns random loot on victory', () => {
      const store = newMockStore({settings: s.basic});
      const startNode = newCombatNode();
      store.dispatch(handleCombatEnd({node: startNode, settings: s.basic, victory: true, maxTier: 9, seed: ''}));

      const actions = store.getActions();
      const loot = actions[1].node.ctx.templates.combat.loot;
      let lootCount = 0;
      for (const l of loot) {
        lootCount += l.count;
      }
      expect(lootCount).toBeGreaterThan(0);
      checkNodeIntegrity(startNode, actions[1].node);
    });

    test('never assigns loot or levels up on defeat', () => {
      const store = newMockStore({});
      const startNode = newCombatNode();
      store.dispatch(handleCombatEnd({node: startNode, settings: s.basic, victory: false, maxTier: 9, seed: ''}));

      const actions = store.getActions();
      expect(actions[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        levelUp: false,
        loot: [],
      }));
      checkNodeIntegrity(startNode, actions[1].node);
    });

    test('does not level up if multiplayer count exceeds tier sum', () => {
      const store = newMockStore({settings: s.basic, multiplayer: m.s2p5});
      const startNode = newCombatNode();
      store.dispatch(handleCombatEnd({
        maxTier: 4,
        node: startNode,
        seed: '',
        settings: s.basic,
        victory: true,
      }));

      const actions = store.getActions();
      expect(actions[1].node.ctx.templates.combat.levelUp).toEqual(false);
      checkNodeIntegrity(startNode, actions[1].node);
    });

    test('Uses parent combat node when given a mid-combat roleplay node', () => {
      const pnode = new ParserNode(cheerio.load(`
        <combat><e>lich</e>
          <event on="round">
            <roleplay id="start">Roleplay node</roleplay>
          </event>
          <event on="win"></event>
          <event on="lose"></event>
        </combat>`)('combat'), defaultContext());
      const node = Action(initCombat, {settings: s.basic}).execute({node: pnode.clone()})[1].node;
      // Replace combat node elem with the roleplay node
      node.elem = node.elem.find('#start');

      const store = newMockStore({settings: s.basic, multiplayer: m.s2p5});
      store.dispatch(handleCombatEnd({
        maxTier: 4,
        node,
        seed: '',
        settings: s.basic,
        victory: true,
      }));

      const actions = store.getActions();
      expect(actions[1].node.getTag()).toEqual('combat');
      checkNodeIntegrity(node, actions[1].node);
    });
  });

  describe('tierSumDelta', () => {
    test('increases', () => {
      const startNode = newCombatNode();
      const node = Action(tierSumDelta).execute({node: startNode, current: 9, delta: 1})[0].node;
      expect(node.ctx.templates.combat.tier).toEqual(10);
      checkNodeIntegrity(startNode, node);
    });
    test('decreases', () => {
      const startNode = newCombatNode();
      const node = Action(tierSumDelta).execute({node: startNode, current: 9, delta: -1})[0].node;
      expect(node.ctx.templates.combat.tier).toEqual(8);
      checkNodeIntegrity(startNode, node);
    });
    test('does not go below 0', () => {
      const startNode = newCombatNode();
      const node = Action(tierSumDelta).execute({node: startNode, current: 9, delta: -1000})[0].node;
      expect(node.ctx.templates.combat.tier).toEqual(0);
      checkNodeIntegrity(startNode, node);
    });
  });

  describe('adventurerDelta', () => {
    test('increases', () => {
      const startNode = newCombatNode();
      const node = Action(adventurerDelta).execute({node: startNode, settings: s.basic, current: 1, delta: 2})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(3);
      checkNodeIntegrity(startNode, node);
    });
    test('decreases', () => {
      const startNode = newCombatNode();
      const node = Action(adventurerDelta).execute({node: startNode, settings: s.basic, current: 3, delta: -1})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(2);
      checkNodeIntegrity(startNode, node);
    });
    test('does not go above player count', () => {
      const startNode = newCombatNode();
      const node = Action(adventurerDelta).execute({node: startNode, settings: s.basic, current: s.basic.numLocalPlayers, delta: 1})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(s.basic.numLocalPlayers);
      checkNodeIntegrity(startNode, node);
    });
    test('does not go below 0', () => {
      const startNode = newCombatNode();
      const node = Action(adventurerDelta).execute({node: startNode, settings: s.basic, current: 1, delta: -2})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(0);
      checkNodeIntegrity(startNode, node);
    });
    test('does not go below 0', () => {
      const startNode = newCombatNode();
      const node = Action(adventurerDelta).execute({node: startNode, settings: s.basic, current: 3, delta: -1000})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(0);
      checkNodeIntegrity(startNode, node);
    });
  });

  describe('handleResolvePhase', () => {
    test('goes to resolve card if no round event handler', () => {
      const node = new ParserNode(cheerio.load(`<combat>
        <e>Test</e>
        <e>Lich</e>
        <e>lich</e>
        <event on="win"></event>
        <event on="lose"></event>
      </combat>`)('combat'), defaultContext());
      const actions = Action(handleResolvePhase).execute({node});
      expect(actions[1].type).toEqual('QUEST_NODE');
      expect(actions[2].to.phase).toEqual('RESOLVE_ABILITIES');
      checkNodeIntegrity(node, actions[1].node);
    });

    test('goes to resolve card if conditionally false round event handler', () => {
      const node = new ParserNode(cheerio.load(`<combat>
        <e>Test</e>
        <e>Lich</e>
        <e>lich</e>
        <event on="win"></event>
        <event on="lose"></event>
        <event if="false" on="round"><roleplay>bad</roleplay></event>
      </combat>`)('combat'), defaultContext());
      const actions = Action(handleResolvePhase).execute({node});
      expect(actions[1].type).toEqual('QUEST_NODE');
      expect(actions[2].to.phase).toEqual('RESOLVE_ABILITIES');
      checkNodeIntegrity(node, actions[1].node);
    });

    test('goes to roleplay card on round event handler', () => {
      let node = new ParserNode(cheerio.load(`<combat>
        <e>Test</e>
        <e>Lich</e>
        <e>lich</e>
        <event on="win"></event>
        <event on="round">
          <roleplay>expected</roleplay>
        </event>
        <event on="lose"></event>
      </combat>`)('combat'), defaultContext());
      node = Action(initCombat as any).execute({node: node.clone(), settings: s.basic})[1].node;
      const actions = Action(handleResolvePhase).execute({node});
      expect(actions[1].node.elem.text()).toEqual('expected');
      expect(actions[2].to.phase).toEqual('MID_COMBAT_ROLEPLAY');
      checkNodeIntegrity(node, actions[1].node);
    });
  });

  test.skip('handles global player count change', () => { /* TODO */ });

  test.skip('clears combat state on completion', () => { /* TODO */ });

  describe('findCombatParent', () => {
    test('returns node when node is combat', () => {
      const v = cheerio.load('<quest><combat id="start"></combat></quest>')('#start');
      const result = findCombatParent(new ParserNode(v, defaultContext()));
      if (result === null) {
        throw Error('null result');
      }
      expect(result.attr('id')).toEqual('start');
      checkNodeIntegrity(null, null); // skip
    });
    test('returns combat parent', () => {
      const v = cheerio.load('<quest><combat id="expected"><event on="round"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      const result = findCombatParent(new ParserNode(v, defaultContext()));
      if (result === null) {
        throw Error('null result');
      }
      expect(result.attr('id')).toEqual('expected');
      checkNodeIntegrity(null, null); // skip
    });
    test('does not return combat when node is within a win/lose event', () => {
      const v = cheerio.load('<quest><combat><event on="win"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      expect(findCombatParent(new ParserNode(v, defaultContext()))).toEqual(null);
      checkNodeIntegrity(null, null); // skip
    });
  });

  describe('setupCombatDecision', () => {
    test('requires fewer successes than total alive player count (multiplayer)', () => {
      const startNode = newCombatNode();
      const node = Action(setupCombatDecision, {settings: s.basic, multiplayer: m.s2p5a1}).execute({node: startNode, seed: 'asdf'})[1].node;
      for (const lc of node.ctx.templates.decision.leveledChecks) {
        expect(lc.requiredSuccesses).toBeLessThan(2);
      }
      checkNodeIntegrity(startNode, node);
    });
    test.skip('populates combat decision template with generated LeveledSkillChecks', () => { /* TODO */ });
  });
  describe('handleCombatDecisionRoll', () => {
    test.skip('appends the roll to the combat decision', () => { /* TODO */ });
  });
  describe('toDecisionCard', () => {
    test.skip('updates node decision phase when in combat', () => { /* TODO */ });
    test.skip('calls toCard when not in combat', () => { /* TODO */ });
  });
});

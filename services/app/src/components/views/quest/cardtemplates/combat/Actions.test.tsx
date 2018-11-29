import {initialMultiplayer} from 'app/reducers/Multiplayer';
import {DifficultyType, FontSizeType, MultiplayerState} from 'app/reducers/StateTypes';
import {Action, newMockStore} from 'app/Testing';
import {defaultContext} from '../Template';
import {ParserNode} from '../TemplateTypes';
import {
  adventurerDelta,
  findCombatParent,
  handleCombatEnd,
  handleCombatTimerStop,
  handleResolvePhase,
  initCombat,
  initCustomCombat,
  isSurgeNextRound,
  roundTimeMillis,
  tierSumDelta,
  handleCombatTimerStart,
} from './Actions';

const cheerio: any = require('cheerio');

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
  numLocalPlayers: 3,
  showHelp: true,
  simulator: false,
  timerSeconds: 10,
  vibration: true,
};

const TEST_MP = {
  ...initialMultiplayer,
  clientStatus: {
    1: {
      connected: true,
      numLocalPlayers: 3,
      type: 'STATUS',
    },
    2: {
      connected: true,
      numLocalPlayers: 2,
      type: 'STATUS',
    },
  },
} as MultiplayerState;


const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Test</e><e>Lich</e><e>lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultContext());

describe('Combat actions', () => {
  const newCombatNode = () => {
    const baseNode = Action(initCombat, {settings: TEST_SETTINGS}).execute({node: TEST_NODE.clone()})[1].node;
    return baseNode.clone();
  };

  describe('roundTimeMillis', () => {
    test('Set timer to 10s with two+ players', () => {
      const result = roundTimeMillis({...TEST_SETTINGS, numLocalPlayers: 2});
      expect(result).toEqual(10000);
    });
    test('Set timer to 20s with one player', () => {
      const result = roundTimeMillis({...TEST_SETTINGS, numLocalPlayers: 1});
      expect(result).toEqual(20000);
    });
    test.skip('Accounts for remote play', () => { /* TODO */ }); // TODO
  });

  describe('initCombat', () => {
    const actions = Action(initCombat, {settings: TEST_SETTINGS}).execute({node: TEST_NODE.clone()});

    test('triggers nav to combat start', () => {
      expect(actions[2]).toEqual(jasmine.objectContaining({
        to: jasmine.objectContaining({
          name: 'QUEST_CARD',
          phase: 'DRAW_ENEMIES',
        }),
        type: 'NAVIGATE',
      }));
    });

    test('parses initial state', () => {
      // "Unknown" enemies are given tier 1.
      // Known enemies' tier is parsed from constants.
      expect(actions[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        custom: false,
        enemies: [
          {name: 'Test', tier: 1},
          {name: 'Lich', tier: 4, class: 'Undead'},
          {name: 'Lich', tier: 4, class: 'Undead'},
        ],
        numAliveAdventurers: 3,
        roundCount: 0,
        tier: 9,
      }));
    });
  });

  describe('generate combat template', () => {
    test.skip('Returns expected difficulty settings', () => { /* TODO */ });
    test.skip('Returns expected alive adventurers - one player', () => { /* TODO */ });
    test.skip('Returns expected alive adventurers - multiplayer', () => { /* TODO */ });
  });

  describe('initCustomCombat', () => {
    test('has custom=true', () => {
      const actions = Action(initCustomCombat, {settings: TEST_SETTINGS}).execute({});
      expect(actions[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        custom: true,
      }));
    });

    test('identifies as a combat element', () => {
      const actions = Action(initCustomCombat, {settings: TEST_SETTINGS}).execute({});
      expect(actions[1].node.getTag()).toEqual('combat');
    });

    test('passes seed to multiplayer', () => {
      const store = newMockStore({settings: TEST_SETTINGS, multiplayer: {...initialMultiplayer, connected: true, client: "abc", instance: "def", commitID: 0});
      (store as any).multiplayerClient.sendEvent = jasmine.createSpy('sendEvent');
      store.dispatch(initCustomCombat({seed: 'testseed'}));
      expect((store as any).multiplayerClient.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({args: JSON.stringify({seed: 'testseed'})}), undefined);
    });

    test('uses passed seed', () => {
      const actions = Action(initCustomCombat, {settings: TEST_SETTINGS}).execute({seed: 'testseed'});
      expect(actions[1].node.ctx.seed).toEqual('testseed');
    })
  });

  describe('isSurgeNextRound', () => {
    test('surges according to the period', () => {
      // "Play" until surge
      const store = newMockStore({settings: TEST_SETTINGS, multiplayer: initialMultiplayer});
      let node = newCombatNode();
      for (let i = 0; i < 10 && (!node || !isSurgeNextRound(node.ctx.templates.combat)); i++) {
        store.clearActions();
        store.dispatch(handleCombatTimerStop({node, settings: TEST_SETTINGS, elapsedMillis: 1000, seed: ''}));
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
        store.dispatch(handleCombatTimerStop({node, settings: TEST_SETTINGS, elapsedMillis: 1000, seed: ''}));
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
        multiplayer: TEST_MP,
      });
      const node = newCombatNode();
      node.ctx.templates.combat.numAliveAdventurers = numAlive;
      store.dispatch(handleCombatTimerStart({
        node,
        settings: TEST_SETTINGS,
      }));
      return store.getActions();
    }

    test('starts timer (without pausing) when local alive adventurers in multiplayer', () => {
      expect(doTest(2)).not.toContainEqual(PAUSE_TIMER_MATCH);
    });

    test('starts timer in pause state when 0 local alive adventurers in multiplayer', () => {
      expect(doTest(0)).toContainEqual(PAUSE_TIMER_MATCH)
    });
  });

  describe('handleCombatTimerStop', () => {
    const runTest = (overrides: any) => {
      const store = newMockStore({multiplayer: initialMultiplayer});
      store.dispatch(handleCombatTimerStop({
        elapsedMillis: 1000,
        node: newCombatNode(),
        seed: '',
        settings: TEST_SETTINGS,
        ...overrides,
      }));
      const actions = store.getActions();
      return {actions, store};
    };

    test('randomly assigns damage', () => {
      const {actions} = runTest({});
      expect(actions[2].node.ctx.templates.combat.mostRecentAttack.damage).toBeDefined();
    });
    test('generates rolls according to player count', () => {
      const {actions} = runTest({});
      expect(actions[2].node.ctx.templates.combat.mostRecentRolls.length).toEqual(3);
    });
    test('increments the round counter', () => {
      const {actions} = runTest({});
      expect(actions[2].node.ctx.templates.combat.roundCount).toEqual(1);
    });
    test('only generates rolls for local, not remote, players', () => {
      const {actions} = runTest({ multiplayer: TEST_MP });
      expect(actions[2].node.ctx.templates.combat.mostRecentRolls.length).toEqual(3);
    });
  });

  describe('handleCombatEnd', () => {
    test('levels up if high maxTier on victory', () => {
      const store = newMockStore({settings: TEST_SETTINGS});
      store.dispatch(handleCombatEnd({node: newCombatNode(), settings: TEST_SETTINGS, victory: true, maxTier: 9, seed: ''}));

      expect(store.getActions()[1].node.ctx.templates.combat.levelUp).toEqual(true);
    });

    test('does not level up if low maxTier on victory', () => {
      const store = newMockStore({settings: TEST_SETTINGS});
      store.dispatch(handleCombatEnd({node: newCombatNode(), settings: TEST_SETTINGS, victory: true, maxTier: 1, seed: ''}));

      expect(store.getActions()[1].node.ctx.templates.combat.levelUp).toEqual(false);
    });

    test('assigns random loot on victory', () => {
      const store = newMockStore({settings: TEST_SETTINGS});
      store.dispatch(handleCombatEnd({node: newCombatNode(), settings: TEST_SETTINGS, victory: true, maxTier: 9, seed: ''}));

      const loot = store.getActions()[1].node.ctx.templates.combat.loot;
      let lootCount = 0;
      for (const l of loot) {
        lootCount += l.count;
      }
      expect(lootCount).toBeGreaterThan(0);
    });

    test('never assigns loot or levels up on defeat', () => {
      const store = newMockStore({});
      store.dispatch(handleCombatEnd({node: newCombatNode(), settings: TEST_SETTINGS, victory: false, maxTier: 9, seed: ''}));
      expect(store.getActions()[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        levelUp: false,
        loot: [],
      }));
    });

    test('does not level up if multiplayer count exceeds tier sum', () => {
      const store = newMockStore({settings: TEST_SETTINGS, multiplayer: TEST_MP});
      store.dispatch(handleCombatEnd({
        maxTier: 4,
        node: newCombatNode(),
        seed: '',
        settings: TEST_SETTINGS,
        victory: true,
      }));

      expect(store.getActions()[1].node.ctx.templates.combat.levelUp).toEqual(false);
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
      const node = Action(initCombat, {settings: TEST_SETTINGS}).execute({node: pnode.clone()})[1].node;
      // Replace combat node elem with the roleplay node
      node.elem = node.elem.find('#start');

      const store = newMockStore({settings: TEST_SETTINGS, multiplayer: TEST_MP});
      store.dispatch(handleCombatEnd({
        maxTier: 4,
        node,
        seed: '',
        settings: TEST_SETTINGS,
        victory: true,
      }));

      expect(store.getActions()[1].node.getTag()).toEqual('combat');
    });
  });

  describe('tierSumDelta', () => {
    test('increases', () => {
      const node = Action(tierSumDelta).execute({node: newCombatNode(), current: 9, delta: 1})[0].node;
      expect(node.ctx.templates.combat.tier).toEqual(10);
    });
    test('decreases', () => {
      const node = Action(tierSumDelta).execute({node: newCombatNode(), current: 9, delta: -1})[0].node;
      expect(node.ctx.templates.combat.tier).toEqual(8);
    });
    test('does not go below 0', () => {
      const node = Action(tierSumDelta).execute({node: newCombatNode(), current: 9, delta: -1000})[0].node;
      expect(node.ctx.templates.combat.tier).toEqual(0);
    });
  });

  describe('adventurerDelta', () => {
    test('increases', () => {
      const node = Action(adventurerDelta).execute({node: newCombatNode(), settings: TEST_SETTINGS, current: 1, delta: 2})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(3);
    });
    test('decreases', () => {
      const node = Action(adventurerDelta).execute({node: newCombatNode(), settings: TEST_SETTINGS, current: 3, delta: -1})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(2);
    });
    test('does not go above player count', () => {
      const node = Action(adventurerDelta).execute({node: newCombatNode(), settings: TEST_SETTINGS, current: TEST_SETTINGS.numLocalPlayers, delta: 1})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(TEST_SETTINGS.numLocalPlayers);
    });
    test('does not go below 0', () => {
      const node = Action(adventurerDelta).execute({node: newCombatNode(), settings: TEST_SETTINGS, current: 1, delta: -2})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(0);
    });
    test('does not go below 0', () => {
      const node = Action(adventurerDelta).execute({node: newCombatNode(), settings: TEST_SETTINGS, current: 3, delta: -1000})[0].node;
      expect(node.ctx.templates.combat.numAliveAdventurers).toEqual(0);
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
      node = Action(initCombat as any).execute({node: node.clone(), settings: TEST_SETTINGS})[1].node;
      const actions = Action(handleResolvePhase).execute({node});
      expect(actions[1].node.elem.text()).toEqual('expected');
      expect(actions[2].to.phase).toEqual('MID_COMBAT_ROLEPLAY');
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
    });
    test('returns combat parent', () => {
      const v = cheerio.load('<quest><combat id="expected"><event on="round"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      const result = findCombatParent(new ParserNode(v, defaultContext()));
      if (result === null) {
        throw Error('null result');
      }
      expect(result.attr('id')).toEqual('expected');
    });
    test('does not return combat when node is within a win/lose event', () => {
      const v = cheerio.load('<quest><combat><event on="win"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      expect(findCombatParent(new ParserNode(v, defaultContext()))).toEqual(null);
    });
  });

  describe('setupCombatDecision', () => {
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

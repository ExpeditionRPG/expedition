import {defaultQuestContext, DifficultyType} from '../../reducers/QuestTypes'
import {initCombat, initCustomCombat, isSurgeRound, handleCombatTimerStop, handleCombatEnd, tierSumDelta, adventurerDelta} from './Actions'
import {ParserNode} from '../../parser/Node'
import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'

var cheerio: any = require('cheerio');

const mockStore = configureStore([ thunk ]);

const TEST_SETTINGS = {
  autoRoll: false,
  difficulty: 'NORMAL' as DifficultyType,
  multitouch: true,
  numPlayers: 3,
  showHelp: true,
  vibration: true,
};

const TEST_NODE = new ParserNode(cheerio.load('<combat><e>Test</e><e>Lich</e><e>lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), defaultQuestContext());

describe('Combat actions', () => {

  let baseNode: ParserNode = null;
  {
    // Initialize combat
    const store = mockStore({});
    store.dispatch(initCombat(TEST_NODE.clone(), TEST_SETTINGS));
    baseNode = store.getActions()[1].node;
  }

  const newCombatNode = () => {
    return baseNode.clone();
  }

  describe('initCombat', () => {
    const store = mockStore({});
    store.dispatch(initCombat(TEST_NODE.clone(), TEST_SETTINGS));
    const actions = store.getActions();

    it('triggers nav to combat start', () => {
      expect(actions[0]).toEqual(jasmine.objectContaining({
        type: 'NAVIGATE',
        to: jasmine.objectContaining({
          name: 'QUEST_CARD',
          phase: 'DRAW_ENEMIES',
        })
      }));
    })

    it('parses initial state', () => {
      // "Unknown" enemies are given tier 1.
      // Known enemies' tier is parsed from constants.
      expect(actions[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        custom: false,
        roundCount: 0,
        tier: 9,
        numAliveAdventurers: 3,
        enemies: [
          {name: 'Test', tier: 1},
          {name: 'Lich', tier: 4, class: 'Undead'},
          {name: 'Lich', tier: 4, class: 'Undead'}
        ],
      }));
    });
  });

  describe('initCustomCombat', () => {
    const store = mockStore({});
    store.dispatch(initCustomCombat(TEST_SETTINGS));
    const actions = store.getActions();

    it('has custom=true', () => {
      expect(actions[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        custom: true
      }));
    });

    it('identifies as a combat element', () => {
      expect(actions[1].node.getTag()).toEqual('combat');
    });
  });

  describe('isSurgeRound', () => {
    it('surges according to the period', () => {
      // "Play" until surge
      const store = mockStore({});
      let node = newCombatNode();
      for(let i = 0; i < 10 && (!node || !isSurgeRound(node)); i++) {
        store.clearActions();
        store.dispatch(handleCombatTimerStop(node, TEST_SETTINGS, 1000));
        node = store.getActions()[1].node;
      }
      expect(isSurgeRound(node)).toEqual(true);

      // Count time till next surge
      let pd = 0;
      do {
        store.clearActions();
        store.dispatch(handleCombatTimerStop(node, TEST_SETTINGS, 1000));
        node = store.getActions()[1].node;
        pd++;
      } while (pd < 10 && !isSurgeRound(node));
      expect(pd).toEqual(3); // Default for normal difficulty
    });
  });

  describe('handleCombatTimerStop', () => {
    const store = mockStore({});
    store.dispatch(handleCombatTimerStop(newCombatNode(), TEST_SETTINGS, 1000));
    const actions = store.getActions();

    it('randomly assigns damage', () => {
      expect(actions[1].node.ctx.templates.combat.mostRecentAttack.damage).toBeDefined();
    });
    it('generates rolls according to player count', () => {
      expect(actions[1].node.ctx.templates.combat.mostRecentRolls.length).toEqual(3);
    });
    it('increments the round counter', () => {
      expect(actions[1].node.ctx.templates.combat.roundCount).toEqual(1);
    });
  });

  describe('handleCombatEnd', () => {
    it('levels up if high maxTier on victory', () => {
      const store = mockStore({});
      store.dispatch(handleCombatEnd(newCombatNode(), TEST_SETTINGS, true, 9));

      expect(store.getActions()[1].node.ctx.templates.combat.levelUp).toEqual(true);
    });

    it('does not level up if low maxTier on victory', () => {
      const store = mockStore({});
      store.dispatch(handleCombatEnd(newCombatNode(), TEST_SETTINGS, true, 1));

      expect(store.getActions()[1].node.ctx.templates.combat.levelUp).toEqual(false);
    })

    it('assigns random loot on victory', () => {
      const store = mockStore({});
      store.dispatch(handleCombatEnd(newCombatNode(), TEST_SETTINGS, true, 9));

      let loot = store.getActions()[1].node.ctx.templates.combat.loot;
      let lootCount = 0;
      for(let l of loot) {
        lootCount += l.count;
      }
      expect(lootCount).toBeGreaterThan(0);
    });

    it('never assigns loot or levels up on defeat', () => {
      const store = mockStore({});
      store.dispatch(handleCombatEnd(newCombatNode(), TEST_SETTINGS, false, 9));
      expect(store.getActions()[1].node.ctx.templates.combat).toEqual(jasmine.objectContaining({
        levelUp: false,
        loot: [],
      }));
    });
  });

  describe('tierSumDelta', () => {
    it('increases', () => {
      expect(tierSumDelta(newCombatNode(), 1).node.ctx.templates.combat.tier).toEqual(10);
    });
    it('decreases', () => {
      expect(tierSumDelta(newCombatNode(), -1).node.ctx.templates.combat.tier).toEqual(8);
    });
    it('does not go below 0', () => {
      expect(tierSumDelta(newCombatNode(), -1000).node.ctx.templates.combat.tier).toEqual(0);
    });
  })

  describe('adventurerDelta', () => {
    it('increases', () => {
      let node = adventurerDelta(newCombatNode(), TEST_SETTINGS, -2).node;
      expect(adventurerDelta(node, TEST_SETTINGS, 1).node.ctx.templates.combat.numAliveAdventurers).toEqual(2);
    });
    it('decreases', () => {
      expect(adventurerDelta(newCombatNode(), TEST_SETTINGS, -1).node.ctx.templates.combat.numAliveAdventurers).toEqual(2);
    });
    it('does not go below 0', () => {
      expect(adventurerDelta(newCombatNode(), TEST_SETTINGS, -1000).node.ctx.templates.combat.numAliveAdventurers).toEqual(0);
    });
    it('does not go above the player count', () => {
      expect(adventurerDelta(newCombatNode(), TEST_SETTINGS, 1000).node.ctx.templates.combat.numAliveAdventurers).toEqual(3);
    });
  });

  it('handles global player count change');

  it('clears combat state on completion');
});

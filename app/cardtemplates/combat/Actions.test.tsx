import {initCombat, initCustomCombat, isSurgeNextRound, handleCombatTimerStop, handleCombatEnd, tierSumDelta, adventurerDelta, handleResolvePhase, midCombatChoice} from './Actions'
import {DifficultyType} from '../../reducers/QuestTypes'
import {defaultQuestContext} from '../../reducers/Quest'
import {ParserNode} from '../../parser/Node'
import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'

const cheerio: any = require('cheerio');

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

  describe('isSurgeNextRound', () => {
    it('surges according to the period', () => {
      // "Play" until surge
      const store = mockStore({});
      let node = newCombatNode();
      for(let i = 0; i < 10 && (!node || !isSurgeNextRound(node)); i++) {
        store.clearActions();
        store.dispatch(handleCombatTimerStop(node, TEST_SETTINGS, 1000));
        const actions = store.getActions();
        for (const a of actions) {
          if (a.type === 'QUEST_NODE') {
            node = a.node;
            break;
          }
        }
      }
      expect(isSurgeNextRound(node)).toEqual(true);

      // Count time till next surge
      let pd = 0;
      do {
        store.clearActions();
        store.dispatch(handleCombatTimerStop(node, TEST_SETTINGS, 1000));
        const actions = store.getActions();
        for (const a of actions) {
          if (a.type === 'QUEST_NODE') {
            node = a.node;
            break;
          }
        }
        pd++;
      } while (pd < 10 && !isSurgeNextRound(node));
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

      const loot = store.getActions()[1].node.ctx.templates.combat.loot;
      let lootCount = 0;
      for(const l of loot) {
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
      const node = adventurerDelta(newCombatNode(), TEST_SETTINGS, -2).node;
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

  describe('handleResolvePhase', () => {
    it('goes to resolve card if no round event handler', () => {
      const node = new ParserNode(cheerio.load(`<combat>
        <e>Test</e>
        <e>Lich</e>
        <e>lich</e>
        <event on="win"></event>
        <event on="lose"></event>
      </combat>`)('combat'), defaultQuestContext());
      const store = mockStore({});
      store.dispatch(handleResolvePhase(node));
      expect(store.getActions()[0].to.phase).toEqual('RESOLVE_ABILITIES');
      expect(store.getActions()[1].type).toEqual('QUEST_NODE');
    });

    it('goes to resolve card if conditionally false round event handler', () => {
      const node = new ParserNode(cheerio.load(`<combat>
        <e>Test</e>
        <e>Lich</e>
        <e>lich</e>
        <event on="win"></event>
        <event on="lose"></event>
        <event if="false" on="round"><roleplay>bad</roleplay></event>
      </combat>`)('combat'), defaultQuestContext());
      const store = mockStore({});
      store.dispatch(handleResolvePhase(node));
      expect(store.getActions()[0].to.phase).toEqual('RESOLVE_ABILITIES');
      expect(store.getActions()[1].type).toEqual('QUEST_NODE');
    })

    it('goes to roleplay card on round event handler', () => {
      let node = new ParserNode(cheerio.load(`<combat>
        <e>Test</e>
        <e>Lich</e>
        <e>lich</e>
        <event on="win"></event>
        <event on="round">
          <roleplay>expected</roleplay>
        </event>
        <event on="lose"></event>
      </combat>`)('combat'), defaultQuestContext());
      const store = mockStore({});
      store.dispatch(initCombat(node.clone(), TEST_SETTINGS));
      node = store.getActions()[1].node;
      store.clearActions();

      store.dispatch(handleResolvePhase(node));
      expect(store.getActions()[0].node.ctx.templates.combat.roleplay.elem.text()).toEqual('expected');
      expect(store.getActions()[1].to.phase).toEqual('ROLEPLAY');
    });
  });

  describe('midCombatChoice', () => {
    // Setup combat state where we've initialized combat and just finished a timed round.

    let baseNode = new ParserNode(cheerio.load(`<quest>
      <combat id="c1">
        <e>Test</e>
        <event on="win"><roleplay>win card</roleplay></event>
        <event on="lose"><roleplay>lose card</roleplay></event>
        <event on="round"><roleplay>
          <choice><trigger>win</trigger></choice>
          <choice><trigger>lose</trigger></choice>
          <choice><trigger>end</trigger></choice>
          <choice><roleplay>rp2</roleplay></choice>
        </roleplay></event>
      </combat>
      <roleplay id="outside"></roleplay>
    </quest>`)('#c1'), defaultQuestContext());
    {
      const store = mockStore({});
      store.dispatch(initCombat(baseNode, TEST_SETTINGS));
      baseNode = store.getActions()[store.getActions().length-1].node;
      store.clearActions();

      store.dispatch(handleResolvePhase(baseNode));
      baseNode = store.getActions()[store.getActions().length-2].node;
    }

    const newCombatNode = () => {
      return baseNode.clone();
    }

    it('goes to win screen on **win**', () => {
      const store = mockStore({});
      store.dispatch(midCombatChoice(TEST_SETTINGS, newCombatNode(), 0));
      expect(store.getActions()[1].node.elem.text()).toEqual('win card');
    });

    it('goes to lose screen on **lose**', () => {
      const store = mockStore({});
      store.dispatch(midCombatChoice(TEST_SETTINGS, newCombatNode(), 1));
      expect(store.getActions()[1].node.elem.text()).toEqual('lose card');
    });

    it('ends quest on **end**', () => {
      const store = mockStore({});
      store.dispatch(midCombatChoice(TEST_SETTINGS, newCombatNode(), 2));
      expect(store.getActions()[0].to.name).toEqual('QUEST_END');
    });

    it('goes to next round when pnode.getNext() falls outside of combat scope', () => {
      const store = mockStore({});
      const node = newCombatNode();

      store.dispatch(midCombatChoice(TEST_SETTINGS, node, 3));
      const rp2 = store.getActions()[1].node;
      store.clearActions();

      store.dispatch(midCombatChoice(TEST_SETTINGS, rp2, 0));
      expect(store.getActions()[0].to.phase).toEqual('RESOLVE_ABILITIES');
    });
  });

  it('handles global player count change');

  it('clears combat state on completion');
});

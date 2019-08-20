import {Quest} from 'shared/schema/Quests';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {ParserNode} from '../components/views/quest/cardtemplates/TemplateTypes';
import {getCheerio} from '../Globals';
import {getStorageJson, getStorageString, checkStorageFreeBytes} from '../LocalStorage';
import {deleteSavedQuest, listSavedQuests, loadSavedQuest, SAVED_QUESTS_KEY, savedQuestKey, storeSavedQuest, recreateNodeFromPath} from './SavedQuests';
import {newMockStore} from '../Testing';

describe('SavedQuest actions', () => {
  const STORED_QUEST_ID = '12345';
  const STORED_QUEST_TS = 67890;

  beforeEach((done) => {
    const quest = getCheerio().load(`
      <quest>
        <roleplay data-line="0">
          <choice></choice>
          <choice if="false"></choice>
          <choice>
            <roleplay data-line="1">expected</roleplay>
            <roleplay data-line="2">wrong</roleplay>
          </choice>
        </roleplay>
      </quest>`)('quest');
    const pnode = new ParserNode(quest.children().eq(0), defaultContext());
    const next = pnode.getNext(1);
    if (next === null) {
      throw new Error('Initial setup failed');
    }
    const tmpStore = newMockStore();
    tmpStore.dispatch(storeSavedQuest(next, {id: STORED_QUEST_ID} as any as Quest, STORED_QUEST_TS)).then(done);
  });
  afterEach(() => {
    localStorage.clear();
  });

  describe('deleteSavedQuest', () => {
    test('removes both the listing and the data', () => {
      const store = newMockStore({});
      store.dispatch(deleteSavedQuest(STORED_QUEST_ID, STORED_QUEST_TS));
      expect(getStorageString(savedQuestKey(STORED_QUEST_ID, STORED_QUEST_TS), '')).toEqual('');
      expect(getStorageJson(SAVED_QUESTS_KEY, {})).toEqual([]);
    });
    test('updates available storage', () => {
      const store = newMockStore({});
      const startBytes = checkStorageFreeBytes();
      store.dispatch(deleteSavedQuest(STORED_QUEST_ID, STORED_QUEST_TS));
      const bytesAction = store.getActions()[0];
      expect(bytesAction).toEqual(jasmine.objectContaining({type: 'STORAGE_FREE'}));
    });
  });

  describe('storeSavedQuest', () => {
    const quest = getCheerio().load(`
      <quest>
        <roleplay data-line="0">
          <choice>
            <roleplay data-line="2">expected</roleplay>
            <roleplay data-line="3">wrong</roleplay>
          </choice>
          <choice></choice>
          <choice if="false"></choice>
        </roleplay>
      </quest>`)('quest');
    const pnode = new ParserNode(quest.children().eq(0), defaultContext()).getNext(0);
    const NEW_ID = '0123';
    const NEW_TS = 4567;

    if (pnode === null) {
      throw new Error('Test setup failed');
    }

    test('adds to the listing without affecting other quests', () => {
      const store = newMockStore({});
      store.dispatch(storeSavedQuest(pnode, {id: NEW_ID} as any as Quest, NEW_TS));
      expect(getStorageJson(SAVED_QUESTS_KEY, [])).toContainEqual(jasmine.objectContaining({ts: NEW_TS, details: {id: NEW_ID}, pathLen: 1}));
    });
    test('stores xml and context path', () => {
      const store = newMockStore({});
      store.dispatch(storeSavedQuest(pnode, {id: NEW_ID} as any as Quest, NEW_TS));
      expect(getStorageJson(savedQuestKey(NEW_ID, NEW_TS), {})).toEqual(jasmine.objectContaining({xml: (quest + ''), path: [0]}));
    });
    test('updates available storage', () => {
      const store = newMockStore({});
      const startBytes = checkStorageFreeBytes();
      store.dispatch(storeSavedQuest(pnode, {id: NEW_ID} as any as Quest, NEW_TS));
      const bytesAction = store.getActions()[0];
      expect(bytesAction).toEqual(jasmine.objectContaining({type: 'STORAGE_FREE'}));
    });
    test('data is removed when there is a storage error', (done) => {
      const store = newMockStore({});
      const startBytes = checkStorageFreeBytes();
      const testKey = savedQuestKey(NEW_ID, NEW_TS);
      const mockSetKeyValue = jasmine.createSpy('mockSetKeyValue').and.callFake((k: string, v: any) => {
        if (k === SAVED_QUESTS_KEY && v !== null) {
          throw new Error('exceeded the quota');
        }
      });
      store.dispatch(storeSavedQuest(pnode, {id: NEW_ID} as any as Quest, NEW_TS mockSetKeyValue)).then(() => done.fail('expected error')).catch((e) => {
        expect(mockSetKeyValue).toHaveBeenCalledWith(savedQuestKey(NEW_ID, NEW_TS), null);
        done();
      });
    });
  });

  describe('listSavedQuests', () => {
    test('loads the listing', () => {
      const list = listSavedQuests();
      expect(list.savedQuests.length).toEqual(1);
      expect(list.savedQuests[0]).toEqual(jasmine.objectContaining({ts: STORED_QUEST_TS, details: {id: STORED_QUEST_ID}, pathLen: 1}));
    });
  });

  describe('loadSavedQuest', () => {
    function storeAndLoadQuest(xml: string, mutateCtx: ((ctx: TemplateContext) => TemplateContext) = (c) => c): {saved: ParserNode, loaded: ParserNode} {
      const quest = getCheerio().load(xml)('quest');
      const pnode = new ParserNode(quest.children().eq(0), defaultContext());
      const next = pnode.getNext(0);
      if (next === null) {
        throw new Error('Initial setup failed');
      }
      next.ctx = mutateCtx(next.ctx);
      const store = newMockStore({});
      store.dispatch(storeSavedQuest(next, {id: STORED_QUEST_ID} as any as Quest, STORED_QUEST_TS+1));
      store.clearActions();

      store.dispatch(loadSavedQuest(STORED_QUEST_ID, STORED_QUEST_TS+1));
      const loaded = store.getActions().filter((a) => a.type === 'QUEST_NODE')[0].node;
      return {saved: next, loaded};
    }
    test('loads from context, properly binding "lodash" functions in roleplay node', () => {
      // This tests the viewCount function defined in populateScope() (in TemplateTypes.tsx).
      // We pass once through the starting node, so viewCount("a") should equal 1.
      //
      // This test also sets a variable earlier in the save, and attempts to render the same
      // var when landing on the loaded node.
      const node = storeAndLoadQuest(`
        <quest>
          <roleplay data-line="0" id="a">
            <p>{{n = "test"}}</p>
            <choice>
              <roleplay data-line="2"><p>Result: {{_.viewCount("a")}}{{n}}</p></roleplay>
              <roleplay data-line="3"><p>wrong</p></roleplay>
            </choice>
          </roleplay>
        </quest>`).loaded;
      let result = "";
      node.loopChildren((tag: string, child: Cheerio, original: Cheerio) => {
        result += child
      });
      expect(result).toEqual('<p>Result: 1test</p>');
    });
    test('Loaded node seed matches saved node seed', () => {
      const {saved, loaded} = storeAndLoadQuest(`
        <quest>
          <roleplay data-line="0"></roleplay>
          <roleplay data-line="1"></roleplay>
        </quest>`);
      let result = "";
      expect(saved.ctx.seed).toEqual(loaded.ctx.seed);
    });
    test('handles loading into combat', () => {
      // When recreating from ctx, user should be able to load into the exact round
      // of combat they were originally in.
      const node = storeAndLoadQuest(`
        <quest>
          <roleplay data-line="0" id="a"></roleplay>
          <combat data-line="1"><e>Giant Rat</e></combat>
        </quest>`, (c: TemplateContext) => {
          c.templates.combat = {...c.templates.combat, roundCount: 6, tier: 4};
          return c;
        }).loaded;
      expect(node.ctx.templates.combat.roundCount).toEqual(6);
      expect(node.ctx.templates.combat.tier).toEqual(4);
      expect(node.getTag()).toEqual('combat');
    });
    test.skip('handles loading into mid-combat roleplay', () => { /* todo */ });
  });

  describe('recreateNodeFromPath', () => {
    test('safely handles zero path length', () => {
      const {node} = recreateNodeFromPath(`<quest><roleplay>expected</roleplay></quest>`, []);
      expect(node.elem.text()).toEqual('expected');
    });
    test('handles simple choices, preserving op changes', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <roleplay>start</roleplay>
        <roleplay><p>{{a=5}}</p></roleplay>
        <roleplay>expected</roleplay>
      </quest>`, [0, 0]);
      expect(node.elem.text()).toEqual('expected');
      expect(node.ctx.scope['a']).toEqual(5);
    });
    test('handles gotos', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <roleplay>start</roleplay>
        <trigger>goto g1</trigger>
        <roleplay>wrong</roleplay>
        <roleplay id="g1">expected</roleplay>
      </quest>`, [0]);
      expect(node.elem.text()).toEqual('expected');
    });
    test('handles mid-combat roleplay, preserving op changes', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <combat>
          <e>Bandit</e>
          <event on="round">
            <roleplay><p>{{a=5}}</p></roleplay>
            <trigger>goto g1</trigger>
          </event>
        </combat>
        <roleplay id="g1">expected</roleplay>
      </quest>`, ['round', 0]);
      expect(node.elem.text()).toEqual('expected');
      expect(node.ctx.scope['a']).toEqual(5);
    });
    test('handles conditional mid-combat roleplay', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <roleplay></roleplay>
        <combat>
          <e>Bandit</e>
          <event on="round" if="_.currentCombatRound() == 3">
            <roleplay>expected</roleplay>
          </event>
        </combat>
      </quest>`, [0, '|3', 'round']);
      expect(node.elem.text()).toEqual('expected');
    });
    test('handles error on mid-combat roleplay', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <roleplay>expected</roleplay>
        <combat>
          <e>Bandit</e>
          <event on="round" if="false">
            <roleplay>never get here</roleplay>
          </event>
        </combat>
      </quest>`, [0, '|3', 'round']);
      expect(node.elem.text()).toEqual('expected');
    });
    test('uses saved seed', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <roleplay></roleplay>
        <combat>
          <e>Bandit</e>
          <event on="round" if="randomInt(100) == 71">
            <roleplay>expected</roleplay>
          </event>
        </combat>
      </quest>`, [0, '|3', 'round'], 'asdg');
      expect(node.elem.text()).toEqual('expected');
    });
    test('handles exiting of combat (win/lose)', () => {
      const {node} = recreateNodeFromPath(`<quest>
        <roleplay></roleplay>
        <combat>
          <e>Bandit</e>
          <event on="win"><roleplay>expected</roleplay></event>
          <event on="lose"></event>
        </combat>
      </quest>`, [0, '|3', 'win']);
      expect(node.elem.text()).toEqual('expected');
    });
    test('returns earlier node if there was a problem with the full path', () => {
      const {node, complete} = recreateNodeFromPath(`<quest>
        <roleplay>expected</roleplay>
        <trigger>goto undefined</trigger>
      </quest>`, [0]);
      expect(node.elem.text()).toEqual('expected');
      expect(complete).toEqual(false);
    });
    test('stopping during combat returns the node preceding the combat', () => {
      const {node, complete} = recreateNodeFromPath(`<quest>
        <roleplay>expected</roleplay>
        <combat>
          <e>Bandit</e>
        </combat>
      </quest>`, [0, '|1', '|2']);
      expect(node.elem.text()).toEqual('expected');
      expect(complete).toEqual(false);
    });
  });

  describe('saveQuestForOffline', () => {
    test.skip('Saves a publishedurl to local storage', () => { /* TODO */ });
    test.skip('storage errors are shown in snackbar', () => { /* TODO */ });
  });
});

import { Partition } from 'shared/schema/Constants';
import { Quest } from 'shared/schema/Quests';
import { saved } from './Saved';
import { SavedQuestMeta, SavedQuestState } from './StateTypes';

const questA = new Quest({
  partition: Partition.expeditionPublic,
  id: 'quest-a',
});
const questB = new Quest({
  partition: Partition.expeditionPrivate,
  id: 'quest-b',
});

const saveA: SavedQuestMeta = {
  details: questA,
  ts: 1000,
  pathLen: 4,
  savedBytes: 128,
};
const saveB: SavedQuestMeta = {
  details: questB,
  ts: 2000,
  pathLen: 9,
  savedBytes: 256,
};

describe('Saved quests reducer', () => {
  describe('initial state', () => {
    test('is returned when state is undefined', () => {
      expect(saved(undefined, { type: '@@INIT' })).toEqual({
        list: [],
        selectedTS: null,
        freeBytes: null,
      });
    });
  });

  describe('unknown actions', () => {
    test('returns the exact same state object', () => {
      const state: SavedQuestState = {
        list: [saveA],
        selectedTS: 1000,
        freeBytes: 500,
      };
      expect(saved(state, { type: 'NOT_A_SAVED_QUEST_ACTION' })).toBe(state);
    });
  });

  describe('list-replacing actions', () => {
    const listActions = [
      'SAVED_QUEST_LIST',
      'SAVED_QUEST_STORED',
      'SAVED_QUEST_DELETED',
    ];

    listActions.forEach((type: string) => {
      test(`${type} replaces the list wholesale`, () => {
        const state: SavedQuestState = {
          list: [saveA],
          selectedTS: null,
          freeBytes: null,
        };
        expect(
          saved(state, { type, savedQuests: [saveB] } as any).list,
        ).toEqual([saveB]);
      });

      test(`${type} copies the incoming array rather than aliasing it`, () => {
        const savedQuests = [saveA, saveB];
        const next = saved(undefined, { type, savedQuests } as any);
        expect(next.list).toEqual(savedQuests);
        expect(next.list).not.toBe(savedQuests);
      });

      test(`${type} preserves selectedTS and freeBytes`, () => {
        const state: SavedQuestState = {
          list: [],
          selectedTS: 1000,
          freeBytes: 4096,
        };
        expect(saved(state, { type, savedQuests: [saveA] } as any)).toEqual({
          list: [saveA],
          selectedTS: 1000,
          freeBytes: 4096,
        });
      });
    });

    test('SAVED_QUEST_STORED can append to an existing list', () => {
      const state: SavedQuestState = {
        list: [saveA],
        selectedTS: null,
        freeBytes: null,
      };
      const next = saved(state, {
        type: 'SAVED_QUEST_STORED',
        savedQuests: [saveA, saveB],
      } as any);
      expect(next.list).toEqual([saveA, saveB]);
    });

    test('SAVED_QUEST_DELETED can empty the list', () => {
      const state: SavedQuestState = {
        list: [saveA, saveB],
        selectedTS: null,
        freeBytes: null,
      };
      expect(
        saved(state, { type: 'SAVED_QUEST_DELETED', savedQuests: [] } as any)
          .list,
      ).toEqual([]);
    });

    test('does not mutate the previous state', () => {
      const state: SavedQuestState = {
        list: [saveA],
        selectedTS: null,
        freeBytes: null,
      };
      const next = saved(state, {
        type: 'SAVED_QUEST_LIST',
        savedQuests: [],
      } as any);
      expect(state.list).toEqual([saveA]);
      expect(next).not.toBe(state);
    });
  });

  describe('SAVED_QUEST_SELECT', () => {
    test('records the selected timestamp', () => {
      const state: SavedQuestState = {
        list: [saveA, saveB],
        selectedTS: null,
        freeBytes: null,
      };
      expect(
        saved(state, { type: 'SAVED_QUEST_SELECT', ts: 2000 } as any)
          .selectedTS,
      ).toEqual(2000);
    });

    test('leaves the list and freeBytes untouched', () => {
      const state: SavedQuestState = {
        list: [saveA],
        selectedTS: null,
        freeBytes: 4096,
      };
      const next = saved(state, {
        type: 'SAVED_QUEST_SELECT',
        ts: 1000,
      } as any);
      expect(next.list).toBe(state.list);
      expect(next.freeBytes).toEqual(4096);
    });

    test('replaces a previous selection', () => {
      const state: SavedQuestState = {
        list: [saveA, saveB],
        selectedTS: 1000,
        freeBytes: null,
      };
      expect(
        saved(state, { type: 'SAVED_QUEST_SELECT', ts: 2000 } as any)
          .selectedTS,
      ).toEqual(2000);
    });
  });

  describe('STORAGE_FREE', () => {
    test('records the free byte count', () => {
      expect(
        saved(undefined, { type: 'STORAGE_FREE', freeBytes: 8192 } as any)
          .freeBytes,
      ).toEqual(8192);
    });

    test('records zero free bytes rather than dropping the falsy value', () => {
      const state: SavedQuestState = {
        list: [],
        selectedTS: null,
        freeBytes: 8192,
      };
      expect(
        saved(state, { type: 'STORAGE_FREE', freeBytes: 0 } as any).freeBytes,
      ).toEqual(0);
    });

    test('leaves the list and selection untouched', () => {
      const state: SavedQuestState = {
        list: [saveA],
        selectedTS: 1000,
        freeBytes: null,
      };
      expect(
        saved(state, { type: 'STORAGE_FREE', freeBytes: 32 } as any),
      ).toEqual({
        list: [saveA],
        selectedTS: 1000,
        freeBytes: 32,
      });
    });
  });
});

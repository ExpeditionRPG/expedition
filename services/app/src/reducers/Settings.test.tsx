import { Expansion } from 'shared/schema/Constants';
import { getStorageJson, getStorageString } from '../LocalStorage';
import { Reducer } from '../Testing';
import { initialSettings, settings } from './Settings';
import { Settings as SettingsFixtures } from './TestData';

describe('Settings reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to initialSettings', () => {
    const state = settings(undefined, { type: '@@INIT' });
    expect(state).toEqual(initialSettings);
    expect(state.difficulty).toEqual('NORMAL');
    expect(state.numLocalPlayers).toEqual(1);
    expect(state.simulator).toEqual(false);
    expect(state.contentSets).toEqual({ horror: null });
  });

  test('ignores unknown actions', () => {
    const state = SettingsFixtures.basic;
    expect(settings(state, { type: 'NOT_A_REAL_ACTION' })).toBe(state);
  });

  describe('CHANGE_SETTINGS', () => {
    test('applies a partial change and leaves the rest of settings alone', () => {
      Reducer(settings)
        .withState(SettingsFixtures.basic)
        .expect({
          type: 'CHANGE_SETTINGS',
          settings: { numLocalPlayers: 5 },
        } as any)
        .toChangeState({
          numLocalPlayers: 5,
          difficulty: 'NORMAL',
          vibration: true,
        });
    });

    test('applies several changes at once', () => {
      const result = settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: { difficulty: 'HARD', audioEnabled: true, timerSeconds: 30 },
      } as any);
      expect(result.difficulty).toEqual('HARD');
      expect(result.audioEnabled).toEqual(true);
      expect(result.timerSeconds).toEqual(30);
      expect(result.numLocalPlayers).toEqual(
        SettingsFixtures.basic.numLocalPlayers,
      );
    });

    test('merges contentSets rather than replacing them', () => {
      const result = settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: { contentSets: { [Expansion.future]: true } },
      } as any);
      expect(result.contentSets).toEqual({
        horror: false,
        future: true,
        scarredlands: false,
      });
    });

    test('can turn a content set back off without dropping the others', () => {
      const enabled = settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: {
          contentSets: { [Expansion.horror]: true, [Expansion.future]: true },
        },
      } as any);
      const result = settings(enabled, {
        type: 'CHANGE_SETTINGS',
        settings: { contentSets: { [Expansion.horror]: false } },
      } as any);
      expect(result.contentSets).toEqual({
        horror: false,
        future: true,
        scarredlands: false,
      });
    });

    test('leaves contentSets untouched when the change does not mention them', () => {
      const result = settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: { vibration: false },
      } as any);
      expect(result.contentSets).toEqual(SettingsFixtures.basic.contentSets);
    });

    test('writes changed values through to local storage', () => {
      settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: { difficulty: 'IMPOSSIBLE', numLocalPlayers: 4 },
      } as any);
      expect(getStorageString('difficulty', 'NORMAL')).toEqual('IMPOSSIBLE');
      expect(getStorageString('numLocalPlayers', '')).toEqual('4');
    });

    test('writes the merged contentSets through to local storage, not just the delta', () => {
      settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: { contentSets: { [Expansion.future]: true } },
      } as any);
      expect(getStorageJson('contentSets', {})).toEqual({
        horror: false,
        future: true,
        scarredlands: false,
      });
    });

    test('does not write settings that were not part of the change', () => {
      settings(SettingsFixtures.basic, {
        type: 'CHANGE_SETTINGS',
        settings: { difficulty: 'EASY' },
      } as any);
      expect(getStorageString('fontSize', 'UNSET')).toEqual('UNSET');
    });

    test('does not mutate the dispatched action', () => {
      const action = {
        type: 'CHANGE_SETTINGS',
        settings: { contentSets: { [Expansion.future]: true } },
      } as any;
      settings(SettingsFixtures.basic, action);
      expect(action.settings.contentSets).toEqual({ future: true });
    });

    test('reducing the same action twice against different states is stable', () => {
      const action = {
        type: 'CHANGE_SETTINGS',
        settings: { contentSets: { [Expansion.future]: true } },
      } as any;
      settings(
        { ...SettingsFixtures.basic, contentSets: { horror: true } },
        action,
      );
      const second = settings(
        { ...SettingsFixtures.basic, contentSets: { scarredlands: true } },
        action,
      );
      expect(second.contentSets).toEqual({ scarredlands: true, future: true });
    });
  });
});

import { AudioDataSetAction } from '../actions/ActionTypes';
import { audioData, initialStaticFiles } from './AudioData';
import { AudioDataState } from './StateTypes';

// Stand-ins for AudioNode / ThemeManager: the reducer only ever moves these
// references around, so real audio objects (and a real AudioContext) aren't needed.
const nodeA = { id: 'nodeA' } as any;
const nodeB = { id: 'nodeB' } as any;
const audioNodes = { 'combat/heavy/horn1': nodeA, 'combat/heavy/horn2': nodeB };
const themeManager = { id: 'themeManager' } as any;

function set(data: Partial<AudioDataState>): AudioDataSetAction {
  return { type: 'AUDIO_DATA_SET', data } as AudioDataSetAction;
}

describe('AudioData reducer', () => {
  describe('initial state', () => {
    test('is returned when state is undefined', () => {
      expect(audioData(undefined, { type: '@@INIT' })).toEqual(
        initialStaticFiles,
      );
    });

    test('holds no audio nodes and no theme manager', () => {
      expect(audioData(undefined, { type: '@@INIT' })).toEqual({
        audioNodes: null,
        themeManager: null,
      });
    });
  });

  describe('unknown actions', () => {
    test('returns the exact same state object', () => {
      const state: AudioDataState = { audioNodes, themeManager };
      expect(audioData(state, { type: 'NOT_AN_AUDIO_DATA_ACTION' })).toBe(
        state,
      );
    });

    test('does not treat AUDIO_SET as its own action', () => {
      const state: AudioDataState = { audioNodes, themeManager };
      expect(audioData(state, { type: 'AUDIO_SET' })).toBe(state);
    });
  });

  describe('AUDIO_DATA_SET', () => {
    test('stores both audioNodes and themeManager when loading completes', () => {
      expect(
        audioData(initialStaticFiles, set({ audioNodes, themeManager })),
      ).toEqual({
        audioNodes,
        themeManager,
      });
    });

    test('keeps the loaded nodes by reference rather than copying them', () => {
      const next = audioData(initialStaticFiles, set({ audioNodes }));
      expect(next.audioNodes).toBe(audioNodes);
      expect((next.audioNodes as any)['combat/heavy/horn1']).toBe(nodeA);
    });

    test('setting only audioNodes preserves an existing themeManager', () => {
      const state: AudioDataState = { audioNodes: null, themeManager };
      expect(audioData(state, set({ audioNodes }))).toEqual({
        audioNodes,
        themeManager,
      });
    });

    test('setting only themeManager preserves existing audioNodes', () => {
      const state: AudioDataState = { audioNodes, themeManager: null };
      expect(audioData(state, set({ themeManager }))).toEqual({
        audioNodes,
        themeManager,
      });
    });

    test('can clear back to null', () => {
      const state: AudioDataState = { audioNodes, themeManager };
      expect(
        audioData(state, set({ audioNodes: null, themeManager: null })),
      ).toEqual({
        audioNodes: null,
        themeManager: null,
      });
    });

    test('does not mutate the previous state', () => {
      const state: AudioDataState = { audioNodes: null, themeManager: null };
      const next = audioData(state, set({ audioNodes }));
      expect(state.audioNodes).toEqual(null);
      expect(next).not.toBe(state);
    });

    test('an empty data payload yields an equal but fresh object', () => {
      const state: AudioDataState = { audioNodes, themeManager };
      const next = audioData(state, set({}));
      expect(next).toEqual(state);
      expect(next).not.toBe(state);
    });
  });
});

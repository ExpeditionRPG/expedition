import { AudioSetAction } from '../actions/ActionTypes';
import { audioSet } from '../actions/Audio';
import { Reducer } from '../Testing';
import { audio, initialAudioState } from './Audio';
import { AudioState } from './StateTypes';

function set(delta: Partial<AudioState>): AudioSetAction {
  return { type: 'AUDIO_SET', delta };
}

describe('Audio reducer', () => {
  describe('initial state', () => {
    test('is returned when state is undefined', () => {
      expect(audio(undefined, { type: '@@INIT' })).toEqual(initialAudioState);
    });

    test('starts unloaded, unpaused, silent and at zero intensity', () => {
      expect(audio(undefined, { type: '@@INIT' })).toEqual({
        intensity: 0,
        loaded: 'UNLOADED',
        paused: false,
        peakIntensity: 0,
        sfx: null,
        timestamp: 0,
      });
    });
  });

  describe('unknown actions', () => {
    test('returns the exact same state object', () => {
      const state: AudioState = {
        ...initialAudioState,
        intensity: 5,
        loaded: 'LOADED',
      };
      expect(audio(state, { type: 'NOT_AN_AUDIO_ACTION' })).toBe(state);
    });

    test('returns the exact same state object for @@INIT on existing state', () => {
      const state: AudioState = { ...initialAudioState, paused: true };
      expect(audio(state, { type: '@@INIT' })).toBe(state);
    });
  });

  describe('AUDIO_SET', () => {
    test('merges the delta over existing state, leaving other keys alone', () => {
      const state: AudioState = {
        intensity: 3,
        loaded: 'LOADED',
        paused: false,
        peakIntensity: 7,
        sfx: null,
        timestamp: 100,
      };
      expect(audio(state, set({ paused: true }))).toEqual({
        intensity: 3,
        loaded: 'LOADED',
        paused: true,
        peakIntensity: 7,
        sfx: null,
        timestamp: 100,
      });
    });

    test('does not mutate the previous state', () => {
      const state: AudioState = { ...initialAudioState, intensity: 1 };
      const next = audio(state, set({ intensity: 9 }));
      expect(state.intensity).toEqual(1);
      expect(next).not.toBe(state);
      expect(next.intensity).toEqual(9);
    });

    test('an empty delta yields an equal but fresh object', () => {
      const state: AudioState = { ...initialAudioState, loaded: 'LOADED' };
      const next = audio(state, set({}));
      expect(next).toEqual(state);
      expect(next).not.toBe(state);
    });

    test('walks the load lifecycle UNLOADED -> LOADING -> LOADED', () => {
      let state = audio(undefined, { type: '@@INIT' });
      expect(state.loaded).toEqual('UNLOADED');
      state = audio(state, set({ loaded: 'LOADING' }));
      expect(state.loaded).toEqual('LOADING');
      state = audio(state, set({ loaded: 'LOADED' }));
      expect(state.loaded).toEqual('LOADED');
    });

    test('can land on the ERROR load branch from LOADING', () => {
      const state = audio(
        { ...initialAudioState, loaded: 'LOADING' },
        set({ loaded: 'ERROR' }),
      );
      expect(state.loaded).toEqual('ERROR');
    });

    test('toggles paused in both directions', () => {
      const paused = audio(initialAudioState, set({ paused: true }));
      expect(paused.paused).toEqual(true);
      expect(audio(paused, set({ paused: false })).paused).toEqual(false);
    });

    test('does not derive peakIntensity from intensity', () => {
      // The reducer is a plain merge - peak tracking is the caller's job.
      const state: AudioState = {
        ...initialAudioState,
        intensity: 2,
        peakIntensity: 5,
      };
      expect(audio(state, set({ intensity: 9 }))).toEqual(
        expect.objectContaining({
          intensity: 9,
          peakIntensity: 5,
        }),
      );
    });

    test('accepts intensity and peakIntensity together', () => {
      const state = audio(
        initialAudioState,
        set({ intensity: 12, peakIntensity: 12 }),
      );
      expect(state.intensity).toEqual(12);
      expect(state.peakIntensity).toEqual(12);
    });

    test('clears a playing sfx when set back to null', () => {
      const playing = audio(initialAudioState, set({ sfx: 'ROLL' }));
      expect(playing.sfx).toEqual('ROLL');
      expect(audio(playing, set({ sfx: null })).sfx).toEqual(null);
    });
  });

  describe('audioSet() action creator', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('defaults sfx to null and stamps the current timestamp', () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 12345);
      Reducer(audio)
        .withState({ ...initialAudioState, sfx: 'ROLL', timestamp: 1 })
        .expect(audioSet({ paused: true }))
        .toChangeState({ paused: true, sfx: null, timestamp: 12345 });
    });

    test('lets an explicit sfx and timestamp win over the defaults', () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 12345);
      Reducer(audio)
        .withState({ ...initialAudioState })
        .expect(audioSet({ sfx: 'ROLL', timestamp: 42 }))
        .toChangeState({ sfx: 'ROLL', timestamp: 42 });
    });
  });
});

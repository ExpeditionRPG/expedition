import { getAllMusicFiles } from '../actions/Audio';
import { AudioNode } from './AudioNode';
import { ThemeManager } from './ThemeManager';

function fakeAudioNode(): AudioNode {
  return {
    playOnce: jest.fn(),
    fadeIn: jest.fn(),
    fadeOut: jest.fn(),
    hasGain: jest.fn(),
    getVolume: jest.fn(),
    isPlaying: jest.fn(),
  };
}

jest.useFakeTimers();

function fakeAudioNodes(): { [file: string]: AudioNode } {
  const result = {};
  for (const path of getAllMusicFiles()) {
    result[path] = fakeAudioNode();
  }
  return result;
}

function fixedRng(): () => number {
  return () => 1;
}

describe('ThemeManager', () => {
  test('starts unpaused', () => {
    const am = new ThemeManager({}, fixedRng());
    expect(am.isPaused()).toEqual(false);
  });

  describe('setIntensity', () => {
    test('low plays light tracks', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.setIntensity(2);
      let activeNodes = 0;
      for (const k of Object.keys(ns)) {
        if (/.*light.*/.test(k)) {
          activeNodes += ns[k].playOnce.mock.calls.length;
        }
      }
      expect(activeNodes).toEqual(5);
    });

    test('high plays heavy tracks', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.setIntensity(20);
      let activeNodes = 0;
      for (const k of Object.keys(ns)) {
        if (/.*heavy.*/.test(k)) {
          activeNodes += ns[k].playOnce.mock.calls.length;
        }
      }
      expect(activeNodes).toEqual(5);
    });

    test('zero plays nothing', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.setIntensity(0);
      let activeNodes = 0;
      for (const k of Object.keys(ns)) {
        activeNodes += ns[k].playOnce.mock.calls.length;
      }
      expect(activeNodes).toEqual(0);
    });
  });

  describe('isPaused', () => {
    test('true when paused', () => {
      const am = new ThemeManager([], fixedRng());
      am.pause();
      expect(am.isPaused()).toEqual(true);
    });
    test('false when not paused', () => {
      const am = new ThemeManager([], fixedRng());
      expect(am.isPaused()).toEqual(false);
      am.pause();
      am.resume();
      expect(am.isPaused()).toEqual(false);
    });
  });

  describe('pause', () => {
    test('pauses playing audio', () => {
      const ns = fakeAudioNodes();
      const playing = Object.keys(ns)[0];
      ns[playing].isPlaying.mockReturnValue(true);
      const am = new ThemeManager(ns, fixedRng());
      am.pause();
      for (const k of Object.keys(ns)) {
        expect(ns[k].fadeOut).toHaveBeenCalledTimes(k === playing ? 1 : 0);
      }
    });
    test('does nothing when already paused', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.pause();
      for (const k of Object.keys(ns)) {
        ns[k].isPlaying.mockClear();
      }
      am.pause();
      for (const k of Object.keys(ns)) {
        expect(ns[k].isPlaying).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('resume', () => {
    test('resumes audio at intensity', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.setIntensity(5);
      am.pause();
      for (const k of Object.keys(ns)) {
        ns[k].playOnce.mockClear();
      }
      am.resume();
      let numCalls = 0;
      for (const k of Object.keys(ns)) {
        numCalls += ns[k].playOnce.mock.calls.length;
      }
      expect(numCalls).toEqual(5);
    });
    test('does nothing when already playing', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.resume();
      for (const k of Object.keys(ns)) {
        expect(ns[k].playOnce).toHaveBeenCalledTimes(0);
      }
    });
  });

  test('sets peak volume', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(5, 0);
    am.setIntensity(5, 1);
    let fades = 0;
    for (const k of Object.keys(ns)) {
      fades += ns[k].fadeIn.mock.calls.length;
    }
    expect(fades).toEqual(1);
  });

  test('adds more audio layers when intensity increases', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(5, 0);
    am.setIntensity(5, 1);
    let fades = 0;
    for (const k of Object.keys(ns)) {
      fades += ns[k].fadeIn.mock.calls.length;
    }
    expect(fades).toEqual(1);
  });

  test('removes audio layers when intensity decreases', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(6);
    am.setIntensity(5);
    let fades = 0;
    for (const k of Object.keys(ns)) {
      fades += ns[k].fadeOut.mock.calls.length;
    }
    expect(fades).toEqual(1);
  });

  test.skip('does not go below 1 playing track when decreasing intensity', () => {
    /* TODO */
  });
  test.skip('does not go above 4 playing tracks when increasing intensity (avoids peak instrument)', () => {
    /* TODO */
  });

  test('changes to heavy music when intensity passes threshold', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(10);
    for (const k of Object.keys(ns)) {
      ns[k].playOnce.mockClear();
    }
    am.setIntensity(36);
    let heavys = 0;
    for (const k of Object.keys(ns)) {
      if (/light/.test(k)) {
        expect(ns[k].playOnce).not.toHaveBeenCalled();
      } else {
        heavys += ns[k].playOnce.mock.calls.length;
      }
    }
    expect(heavys).toEqual(5);
  });

  test('returns to same intensity when paused and resumed', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(40); // heavy
    am.pause();
    for (const k of Object.keys(ns)) {
      ns[k].playOnce.mockClear();
      ns[k].fadeOut.mockClear();
    }

    am.resume();
    let heavys = 0;
    for (const k of Object.keys(ns)) {
      if (/light/.test(k)) {
        expect(ns[k].playOnce).not.toHaveBeenCalled();
      } else {
        heavys += ns[k].playOnce.mock.calls.length;
      }
    }
    expect(heavys).toEqual(5);
  });

  test('stages new loops as current loops expire', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(15);
    for (const k of Object.keys(ns)) {
      ns[k].playOnce.mockClear();
      ns[k].fadeOut.mockClear();
    }
    jest.runOnlyPendingTimers();
    let plays = 0;
    for (const k of Object.keys(ns)) {
      plays += ns[k].playOnce.mock.calls.length;
    }
    expect(plays).toEqual(5);
  });
});

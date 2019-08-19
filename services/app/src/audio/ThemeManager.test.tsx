import {AudioNode} from './AudioNode';
import {ThemeManager} from './ThemeManager';
import {getAllMusicFiles} from '../actions/Audio';

function fakeAudioNode(): AudioNode {
  return {
    playOnce: jasmine.createSpy('playOnce'),
    fadeIn: jasmine.createSpy('fadeIn'),
    fadeOut: jasmine.createSpy('fadeOut'),
    hasGain: jasmine.createSpy('hasGain'),
    getVolume: jasmine.createSpy('getVolume'),
    isPlaying: jasmine.createSpy('isPlaying'),
  };
}

jest.useFakeTimers();

function fakeAudioNodes(): {[file: string]: AudioNode} {
  const result = {}
  for (let path of getAllMusicFiles()) {
    result[path] = fakeAudioNode();
  }
  return result;
}

function fixedRng(): (() => number) {
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
      for (let k of Object.keys(ns)) {
        if (/.*light.*/.test(k)) {
          activeNodes += ns[k].playOnce.calls.count();
        }
      }
      expect(activeNodes).toEqual(5);
    });

    test('high plays heavy tracks', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.setIntensity(20);
      let activeNodes = 0;
      for (let k of Object.keys(ns)) {
        if (/.*heavy.*/.test(k)) {
          activeNodes += ns[k].playOnce.calls.count();
        }
      }
      expect(activeNodes).toEqual(5);
    });

    test('zero plays nothing', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.setIntensity(0);
      let activeNodes = 0;
      for (let k of Object.keys(ns)) {
        activeNodes += ns[k].playOnce.calls.count();
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
  })

  describe('pause', () => {
    test('pauses playing audio', () => {
      const ns = fakeAudioNodes();
      const playing = Object.keys(ns)[0]
      ns[playing].isPlaying.and.returnValue(true);
      const am = new ThemeManager(ns, fixedRng());
      am.pause();
      for(let k of Object.keys(ns)) {
        expect(ns[k].fadeOut).toHaveBeenCalledTimes((k === playing) ? 1 : 0);
      }
    });
    test('does nothing when already paused', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.pause();
      for (let k of Object.keys(ns)) {
        ns[k].isPlaying.calls.reset();
      }
      am.pause();
      for(let k of Object.keys(ns)) {
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
      for(let k of Object.keys(ns)) {
        ns[k].playOnce.calls.reset();
      }
      am.resume()
      let numCalls = 0;
      for(let k of Object.keys(ns)) {
        numCalls += ns[k].playOnce.calls.count();
      }
      expect(numCalls).toEqual(5);
    });
    test('does nothing when already playing', () => {
      const ns = fakeAudioNodes();
      const am = new ThemeManager(ns, fixedRng());
      am.resume();
      for(let k of Object.keys(ns)) {
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
    for(let k of Object.keys(ns)) {
      fades += ns[k].fadeIn.calls.count();
    }
    expect(fades).toEqual(1);
  });

  test('adds more audio layers when intensity increases', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(5, 0);
    am.setIntensity(5, 1);
    let fades = 0;
    for(let k of Object.keys(ns)) {
      fades += ns[k].fadeIn.calls.count();
    }
    expect(fades).toEqual(1);
  });

  test('removes audio layers when intensity decreases', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(6);
    am.setIntensity(5);
    let fades = 0;
    for(let k of Object.keys(ns)) {
      fades += ns[k].fadeOut.calls.count();
    }
    expect(fades).toEqual(1);
  });

  test.skip('does not go below 1 playing track when decreasing intensity', () => { /* TODO */ });
  test.skip('does not go above 4 playing tracks when increasing intensity (avoids peak instrument)', () => { /* TODO */ });

  test('changes to heavy music when intensity passes threshold', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(10);
    for(let k of Object.keys(ns)) {
      ns[k].playOnce.calls.reset();
    }
    am.setIntensity(36);
    let heavys = 0;
    for(let k of Object.keys(ns)) {
      if (/light/.test(k)) {
        expect(ns[k].playOnce).not.toHaveBeenCalled();
      } else {
        heavys += ns[k].playOnce.calls.count();
      }
    }
    expect(heavys).toEqual(5);
  });

  test('returns to same intensity when paused and resumed', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(40); // heavy
    am.pause();
    for(let k of Object.keys(ns)) {
      ns[k].playOnce.calls.reset();
      ns[k].fadeOut.calls.reset();
    }

    am.resume();
    let heavys = 0;
    for(let k of Object.keys(ns)) {
      if (/light/.test(k)) {
        expect(ns[k].playOnce).not.toHaveBeenCalled();
      } else {
        heavys += ns[k].playOnce.calls.count();
      }
    }
    expect(heavys).toEqual(5);
  });

  test('stages new loops as current loops expire', () => {
    const ns = fakeAudioNodes();
    const am = new ThemeManager(ns, fixedRng());
    am.setIntensity(15);
    for(let k of Object.keys(ns)) {
      ns[k].playOnce.calls.reset();
      ns[k].fadeOut.calls.reset();
    }
    jest.runOnlyPendingTimers();
    let plays = 0;
    for(let k of Object.keys(ns)) {
        plays += ns[k].playOnce.calls.count();
    }
    expect(plays).toEqual(5);
  });
});

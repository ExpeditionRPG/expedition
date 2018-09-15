import {configure, shallow} from 'enzyme';
import * as React from 'react';
import Audio, {getAllMusicFiles, ThemeManager, NodeSet, Props} from './Audio';
import {initialAudioState} from '../../reducers/Audio';
import Adapter from 'enzyme-adapter-react-16';
import {INIT_DELAY, AUDIO_COMMAND_DEBOUNCE_MS} from '../../Constants';
configure({ adapter: new Adapter() });

jest.useFakeTimers();

type Env = {props: Props, a: Audio, ns: {[file: string]: NodeSet}};

function fakeNodeSet(): NodeSet {
  return {
    playOnce: jasmine.createSpy('playOnce'),
    fadeIn: jasmine.createSpy('fadeIn'),
    fadeOut: jasmine.createSpy('fadeOut'),
    hasGain: jasmine.createSpy('hasGain'),
    getVolume: jasmine.createSpy('getVolume'),
    isPlaying: jasmine.createSpy('isPlaying'),
  };
}

describe('Audio', () => {
  function waitForLoadChange(props: any, a: any, ns: any): Promise<Env> {
    return new Promise((resolve, reject) => {
      props.onLoadChange.and.callFake((stat: string) => {
        if (stat === 'LOADED') {
          resolve({props, a, ns});
        } else if (stat === 'ERROR') {
          reject(Error(stat));
        }
      });
      jest.runAllTimers();
    });
  }

  // Spy on loadAudioLocalFile
  function setup(overrides?: Partial<Props>, waitForLoad?: boolean): Promise<Env> {
    const ns: {[file: string]: jasmine.Spy} = {};
    const loadAudio = (context: AudioContext, url: string, callback: (err: Error|null, buffer: NodeSet|null) => void) => {
      const s = fakeNodeSet();
      ns[url] = s;
      callback(null, s);
    };
    const props: Props = {
      themeManager: null, // TODO
      audioContext: jasmine.createSpy('audioContext'),
      audio: {...initialAudioState},
      cardName: 'QUEST_CARD';
      cardPhase: 'DRAW_ENEMIES';
      enabled: true;
      disableAudio: jasmine.createSpy('disableAudio'),
      onLoadChange: jasmine.createSpy('onLoadChange'),
      loadAudio,
      ...overrides,
    };
    spyOn(props, 'loadAudio').and.callThrough();
    const result = {props, a: shallow(<Audio {...(props as any as Props)} />, undefined), ns};
    if (waitForLoad === undefined || waitForLoad) {
      result.props.timestamp = AUDIO_COMMAND_DEBOUNCE_MS+1;
      return waitForLoadChange(result.props, result.a, result.ns);
    } else {
      return Promise.resolve(result);
    }
  }

  test('does not load audio on construction if disabled', (done) => {
    setup({enabled: false, themeManager: null}, false).then(({props}) => {
      expect(props.loadAudio).toHaveBeenCalledTimes(0);
      done();
    }).catch(done.fail);
  });

  /*
  test('loads audio on construction if enabled', (done) => {
    setup({themeManager: null}).then(({props}) => {
      expect(props.loadAudio).toHaveBeenCalledTimes(getAllMusicFiles().length);
      done();
    }).catch(done.fail);
  });

  test('loads audio if disabled on construction, then enabled', (done) => {
    setup({enabled: false, themeManager: null}, false).then(({props, a}) => {
      expect(props.loadAudio).toHaveBeenCalledTimes(0);
      props.enabled = true;
      return waitForLoadChange(props, a);
    }).then(({props}) => {
      expect(props.loadAudio).toHaveBeenCalledTimes(getAllMusicFiles().length);
      done();
    }).catch(done.fail);
  });

  function activeProps(audioOverrides?: Partial<AudioState>): Props {
    return {
      audio: {
        ...initialAudioState,
        intensity: 1,
        peakIntensity: 2,
        paused: false,
        timestamp: AUDIO_COMMAND_DEBOUNCE_MS+1,
        ...audioOverrides,
      },
      cardName: 'QUEST_CARD',
      cardPhase: 'DRAW_ENEMIES',
    };
  }
  test.skip('plays audio when in combat node', (done) => {
    return setup().then(({props, a, ns}) => {
      a.setProps(activeProps());
      expect(props.themeManager.setIntensity).toHaveBeenCalledTimes(1);
      done();
    }).catch(done.fail);
  });
  */

  test.skip('mutes audio when exiting combat node', () => { /* TODO */});

  test.skip('mutes audio layers when intensity decreases', () => { /* TODO */ });

  test.skip('handles loading errors', () => { /* TODO */ });

  test.skip('clears loading state when loaded', () => { /* TODO */ });

  test.skip('aborts loading if disabled mid-load', () => { /* TODO */ });

  test.skip('starts playing on disabled -> intensity change -> enabled -> load complete', () => { /* TODO */ });
});

describe('ThemeManager', () => {
  function fakeTracks(): {[file: string]: NodeSet} {
    const result = {}
    for (let path of getAllMusicFiles()) {
      result[path] = fakeNodeSet();
    }
    return result;
  }

  function fixedRng(): (() => number) {
    return () => 1;
  }

  test('starts unpaused', () => {
    const am = new ThemeManager({}, fixedRng());
    expect(am.isPaused()).toEqual(false);
  });

  describe('setIntensity', () => {
    test('low plays light tracks', () => {
      const ns = fakeTracks();
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
      const ns = fakeTracks();
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
      const ns = fakeTracks();
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
      const ns = fakeTracks();
      const playing = Object.keys(ns)[0]
      ns[playing].isPlaying.and.returnValue(true);
      const am = new ThemeManager(ns, fixedRng());
      am.pause();
      for(let k of Object.keys(ns)) {
        expect(ns[k].fadeOut).toHaveBeenCalledTimes((k === playing) ? 1 : 0);
      }
    });
    test('no op when already paused', () => {
      const ns = fakeTracks();
      const am = new ThemeManager(ns, fixedRng());
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
    test.skip('resumes', () => { /* TODO */});
    test.skip('no op when already playing', () => { /* TODO */});
  });

  test.skip('adds more audio layers when intensity increases', () => { /* TODO */ });

  test.skip('stages new loops before current loops expire', () => { /* TODO */ });

  test.skip('changes to high intensity loops when intensity passes threshold', () => { /* TODO */ });

  test.skip('can be disabled while playing', () => { /* TODO */ });

  test.skip('can be paused while playing', () => { /* TODO */ });

  test.skip('can be resumed from a pause where it was playing', () => { /* TODO */ });

  test.skip('keeps track of intensity even while disabled', () => { /* TODO */ });
});

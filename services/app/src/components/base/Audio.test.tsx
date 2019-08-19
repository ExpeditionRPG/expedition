import {configure, shallow} from 'enzyme';
import * as React from 'react';
import Audio, {ThemeManager, Props} from './Audio';
import {initialAudioState} from '../../reducers/Audio';
import Adapter from 'enzyme-adapter-react-16';
import {INIT_DELAY, AUDIO_COMMAND_DEBOUNCE_MS} from '../../Constants';
configure({ adapter: new Adapter() });

jest.useFakeTimers();

type Env = {props: Props, a: Audio};


describe('Audio', () => {
  function fakeThemeManager() {
    return {
      pause: jasmine.createSpy('pause'),
      isPaused: jasmine.createSpy('isPaused'),
      setIntensity: jasmine.createSpy('setIntensity'),
      resume: jasmine.createSpy('resume'),
    };
  }

  function tick(p: Partial<Props>, t: number): Partial<Props> {
    return {...p, audio: {...p.audio, timestamp: t*AUDIO_COMMAND_DEBOUNCE_MS+1}};
  }

  function setup(overrides: Partial<Props> = {}): Env {
    const props: Props = {
      themeManager: fakeThemeManager(),
      audio: {...initialAudioState},
      inCombat: true,
      enabled: true,
      disableAudio: jasmine.createSpy('disableAudio'),
      onLoadChange: jasmine.createSpy('onLoadChange'),
      loadAudio: jasmine.createSpy('loadAudio'),
      timestamp: 0,
      ...overrides,
    };
    return {props, a: shallow(<Audio {...(props as any as Props)} />, undefined)};
  }

  test('does not load audio on construction if disabled', () => {
    const {props} = setup({enabled: false, themeManager: null});
    jest.runAllTimers();
    expect(props.loadAudio).toHaveBeenCalledTimes(0);
  });

  test('loads audio on construction if enabled', (done) => {
    const {props} = setup({
      enabled: true,
      themeManager: null,
      loadAudio: done,
    });
    jest.runAllTimers();
  });
  test('loads audio if disabled on construction, then enabled', () => {
    const {props, a} = setup({enabled: false, themeManager: null});
    jest.runAllTimers();
    a.setProps({enabled: true});
    expect(props.loadAudio).toHaveBeenCalledTimes(1);
  });

  function activeProps(audioOverrides?: Partial<AudioState>): Partial<Props> {
    return {
      audio: {
        ...initialAudioState,
        intensity: 1,
        peakIntensity: 2,
        paused: false,
        timestamp: 0,
        ...audioOverrides,
      },
      inCombat: true,
    };
  }
  test('plays audio when nonzero intensity in combat node', () => {
    const {props, a} = setup();
    a.setProps(tick(activeProps(), 1));
    expect(props.themeManager.setIntensity).toHaveBeenCalledTimes(1);
  });

  test('mutes audio when exiting combat node', () => {
    const {props, a} = setup(activeProps());
    a.setProps(tick({inCombat: false}, 1));
    expect(props.themeManager.pause).toHaveBeenCalledTimes(1);
  });

  test('handles changing intensity', () => {
    const {props, a} = setup(activeProps());
    a.setProps(tick({...props, audio: {...props.audio, intensity: 15}}, 1));
    expect(props.themeManager.setIntensity).toHaveBeenCalledWith(15, 2);
    a.setProps(tick({...props, audio: {...props.audio, intensity: 5}}, 2));
    expect(props.themeManager.setIntensity).toHaveBeenCalledWith(5, 2);
  });

  test.skip('starts playing on disabled -> intensity change -> enabled -> load complete', () => {
    // TODO
    const {props, a} = setup({themeManager: null});
    const ap = activeProps();
    a.setProps(tick({...props, audio: {...ap.audio}}, 1));
    a.setProps(tick({...props, enabled: true}, 2));

    const f = fakeThemeManager();
    a.setProps(tick({...props, enabled: true, themeManager: f}, 3));
    expect(f.setIntensity).toHaveBeenCalledWith(1);
  });
});


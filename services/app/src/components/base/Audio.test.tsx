import {configure, shallow} from 'enzyme';
import * as React from 'react';
import Audio, {Props} from './Audio';
import {initialAudioState} from '../../reducers/Audio';
import Adapter from 'enzyme-adapter-react-16';
import {INIT_DELAY} from '../../Constants';
configure({ adapter: new Adapter() });

describe('Audio', () => {
  let timerCallback: any;
  beforeEach(function() {
    timerCallback = jasmine.createSpy("timerCallback");
    jasmine.clock().install();
  });

  afterEach(function() {
    jasmine.clock().uninstall();
  });

  // Spy on loadAudioLocalFile
  function setup(overrides?: Partial<Props>) {
    const loadedBuffers: jasmine.Spy = [];
    const onLoad = (context: AudioContext, url: string, callback: (err: Error|null, buffer: AudioBuffer|null) => void) => {
      const s = jasmine.createSpy('audiofile://' + url);
      loadedBuffers.push(s);
      return s;
    };
    const props: Props = {
      audioContext: jasmine.createSpy('audioContext'),
      audio: {...initialAudioState},
      cardName: 'QUEST_CARD';
      cardPhase: 'DRAW_ENEMIES';
      enabled: true;
      disableAudio: jasmine.createSpy('disableAudio'),
      onLoadChange: jasmine.createSpy('onLoadChange'),
      onLoad,
      ...overrides,
    };
    spyOn(props, 'onLoad').and.callThrough();
    return {props, a: shallow(<Audio {...(props as any as Props)} />, undefined /*renderOptions*/)};
  }

  test('loads audio on construction if enabled', () => {
    const {props, a} = setup();
    jasmine.clock().tick(INIT_DELAY.LOAD_AUDIO_MILLIS + 1);
    expect(props.onLoad).toHaveBeenCalledTimes(10);
  });

  test.skip('does not load audio on construction if disabled', () => { /* TODO */ });

  test.skip('loads audio if disabled on construction, then enabled', () => { /* TODO */ });

  test.skip('adds more audio layers when intensity increases', () => { /* TODO */ });

  test.skip('mutes audio layers when intensity decreases', () => { /* TODO */ });

  test.skip('stages new loops before current loops expire', () => { /* TODO */ });

  test.skip('changes to high intensity loops when intensity passes threshold', () => { /* TODO */ });

  test.skip('handles loading errors', () => { /* TODO */ });

  test.skip('clears loading state when loaded', () => { /* TODO */ });

  test.skip('aborts loading if disabled mid-load', () => { /* TODO */ });

  test.skip('can be disabled while playing', () => { /* TODO */ });

  test.skip('can be paused while playing', () => { /* TODO */ });

  test.skip('can be resumed from a pause where it was playing', () => { /* TODO */ });

  test.skip('keeps track of intensity even while disabled', () => { /* TODO */ });

  test.skip('starts playing on disabled -> intensity change -> enabled -> load complete', () => { /* TODO */ });
});

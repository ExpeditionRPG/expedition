import { mount, unmountAll } from 'app/Testing';
import * as React from 'react';
import { initialMultiplayer } from '../../reducers/Multiplayer';
import { initialSettings } from '../../reducers/Settings';
import { Multiplayer as m } from '../../reducers/TestData';
import Settings, { Props } from './Settings';

describe('Settings', () => {
  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      settings: initialSettings,
      multiplayer: initialMultiplayer,
      onAudioChange: jest.fn(),
      onAutoRollChange: jest.fn(),
      onDifficultyDelta: jest.fn(),
      onExpansionSelect: jest.fn(),
      onExperimentalChange: jest.fn(),
      onFontSizeDelta: jest.fn(),
      onMultitouchChange: jest.fn(),
      onPlayerChange: jest.fn(),
      onShowHelpChange: jest.fn(),
      onTimerSecondsDelta: jest.fn(),
      onVibrationChange: jest.fn(),
      ...overrides,
    };
    const elem = mount(<Settings {...props} />);
    return { elem, props };
  }

  test.skip('displays with initial settings', () => {
    /* TODO */
  });
  test.skip('displays with timerSeconds = null', () => {
    /* TODO */
  });

  test('changes player count', () => {
    const { elem, props } = setup();
    elem.find('PlayerCount#playerCount').prop('onChange')(1);
    expect(props.onPlayerChange).toHaveBeenCalledWith(1);
  });
  test('shows current locally configured content sets', () => {
    const { elem, props } = setup({
      settings: {
        ...initialSettings,
        contentSets: { horror: true, future: false },
      },
    });
    const text = elem.find('p.expansionLabel').text();
    expect(text).toContain('Horror');
    expect(text).not.toContain('All Devices');
  });
  test('hides non-configured local content sets', () => {
    const { elem, props } = setup({
      settings: {
        ...initialSettings,
        contentSets: { horror: false, future: false },
      },
    });
    const text = elem.find('p.expansionLabel').text();
    expect(text).not.toContain('Horror');
    expect(text).not.toContain('All Devices');
  });
  test('shows multiplayer content sets intersection', () => {
    const { elem, props } = setup({
      settings: {
        ...initialSettings,
        contentSets: { horror: false, future: false },
      },
      multiplayer: m.s2p5,
    });
    const text = elem.find('p.expansionLabel').text();
    expect(text).toContain('All Devices');
  });
  test('changes multitouch', () => {
    const { elem, props } = setup();
    elem.find('Checkbox#multitouch').prop('onChange')(true);
    expect(props.onMultitouchChange).toHaveBeenCalledWith(true);
  });
  test('changes sound', () => {
    const { elem, props } = setup();
    elem.find('Checkbox#sound').prop('onChange')(true);
    expect(props.onAudioChange).toHaveBeenCalledWith(true);
  });
  test('changes help', () => {
    const { elem, props } = setup();
    elem.find('Checkbox#help').prop('onChange')(true);
    expect(props.onShowHelpChange).toHaveBeenCalledWith(true);
  });
  test('changes vibration', () => {
    const { elem, props } = setup();
    elem.find('Checkbox#vibration').prop('onChange')(true);
    expect(props.onVibrationChange).toHaveBeenCalledWith(true);
  });
  test('changes autoroll', () => {
    const { elem, props } = setup();
    elem.find('Checkbox#autoroll').prop('onChange')(true);
    expect(props.onAutoRollChange).toHaveBeenCalledWith(true);
  });
  test('changes experimental', () => {
    const { elem, props } = setup();
    elem.find('Checkbox#experimental').prop('onChange')(true);
    expect(props.onExperimentalChange).toHaveBeenCalledWith(true);
  });
});

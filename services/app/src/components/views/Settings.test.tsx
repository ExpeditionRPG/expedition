import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import Settings, { Props } from './Settings';
import {initialSettings} from '../../reducers/Settings';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {Multiplayer as m} from '../../reducers/TestData';

describe('Settings', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      settings: initialSettings,
      multiplayer: initialMultiplayer,
      onAudioChange: jasmine.createSpy('onAudioChange'),
      onAutoRollChange: jasmine.createSpy('onAutoRollChange'),
      onDifficultyDelta: jasmine.createSpy('onDifficultyDelta'),
      onExpansionSelect: jasmine.createSpy('onExpansionSelect'),
      onExperimentalChange: jasmine.createSpy('onExperimentalChange'),
      onFontSizeDelta: jasmine.createSpy('onFontSizeDelta'),
      onMultitouchChange: jasmine.createSpy('onMultitouchChange'),
      onPlayerDelta: jasmine.createSpy('onPlayerDelta'),
      onShowHelpChange: jasmine.createSpy('onShowHelpChange'),
      onTimerSecondsDelta: jasmine.createSpy('onTimerSecondsDelta'),
      onVibrationChange: jasmine.createSpy('onVibrationChange'),
      ...overrides,
    };
    const elem = mount(<Settings {...props} />);
    return {elem, props};
  }

  test.skip('displays with initial settings', () => { /* TODO */ });
  test.skip('displays with timerSeconds = null', () => { /* TODO */ });

  test('shows count across all devices', () => {
    const {elem, props} = setup({
      multiplayer: {
        ...initialMultiplayer,
        session: {id: 'asdf', secret: 'ghjk'},
        connected: true,
        clientStatus: {
          d: {type: 'STATUS', connected: true, numLocalPlayers: 3},
          e: {type: 'STATUS', connected: true, numLocalPlayers: 2},
        },
      },
    });
    expect(elem.find('Picker#playerCount').text()).toContain('5 across all devices');
  });
  test('hides count across all devices when no multiplayer', () => {
    const {elem, props} = setup({multiplayer: initialMultiplayer});
    expect(elem.find('Picker#playerCount').text()).not.toContain('across all devices');
  });
  test('shows current locally configured content sets', () => {
    const {elem, props} = setup({settings: {...initialSettings, contentSets: {horror: true, future: false}}});
    const text = elem.find('p.expansionLabel').text();
    expect(text).toContain('Horror');
    expect(text).not.toContain('All devices');
  });
  test('hides non-configured local content sets', () => {
    const {elem, props} = setup({settings: {...initialSettings, contentSets: {horror: false, future: false}}});
    const text = elem.find('p.expansionLabel').text();
    expect(text).not.toContain('Horror');
    expect(text).not.toContain('All devices');
  });
  test('shows multiplayer content sets intersection', () => {
    const {elem, props} = setup({settings: {...initialSettings, contentSets: {horror: false, future: false}}, multiplayer: m.s2p5});
    const text = elem.find('p.expansionLabel').text();
    expect(text).toContain('All devices');
  });
});

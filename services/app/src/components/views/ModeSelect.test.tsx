import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import ModeSelect, { Props } from './ModeSelect';
import {initialSettings} from '../../reducers/Settings';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {loggedOutUser} from 'shared/auth/UserState';

describe('ModeSelect', () => {
  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      isLatestAppVersion: true;
      settings: initialSettings;
      multiplayer: initialMultiplayer;
      user: loggedOutUser;
      onPlayerChange: jasmine.createSpy('onPlayerChange'),
      onLocalSelect: jasmine.createSpy('onLocalSelect'),
      onMultiplayerSelect: jasmine.createSpy('onMultiplayerSelect'),
      onMultitouchChange: jasmine.createSpy('onMultitouchChange'),
      ...overrides,
    };
    const elem = mount(<ModeSelect {...props} />);
    return {elem, props};
  }

  test('selects multiplayer', () => {
    const {elem, props} = setup();
    elem.find('Checkbox#multitouch').prop('onChange')(true);
    expect(props.onMultitouchChange).toHaveBeenCalledWith(true);
  });
  test('selects local', () => {
    const {elem, props} = setup();
    elem.find('ExpeditionButton#selectLocal').prop('onClick')();
    expect(props.onLocalSelect).toHaveBeenCalled();
  });
  test('can change multitouch setting', () => {
    const {elem, props} = setup();
    elem.find('ExpeditionButton#selectOnlineMultiplayer').prop('onClick')();
    expect(props.onMultiplayerSelect).toHaveBeenCalled();
  });
  test('disables multiplayer when different app version', () => {
    const {elem, props} = setup({isLatestAppVersion: false});
    expect(elem.find('ExpeditionButton#selectOnlineMultiplayer').prop('disabled')).toEqual(true);
  });
  test('can change player count', () => {
    const {elem, props} = setup();
    elem.find('PlayerCount#playerCount').prop('onChange')(1);
    expect(props.onPlayerChange).toHaveBeenCalledWith(1);
  });
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
    expect(elem.find('PlayerCount#playerCount').text()).toContain('5 across all devices');
  });
  test('hides count across all devices when no multiplayer', () => {
    const {elem, props} = setup({multiplayer: initialMultiplayer});
    expect(elem.find('PlayerCount#playerCount').text()).not.toContain('across all devices');
  });
});

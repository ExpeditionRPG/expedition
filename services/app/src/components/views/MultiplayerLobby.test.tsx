import { mount, unmountAll } from 'app/Testing';
import * as React from 'react';
import { loggedOutUser } from 'shared/auth/UserState';
import { Expansion } from 'shared/schema/Constants';
import { initialMultiplayer } from '../../reducers/Multiplayer';
import { initialSettings } from '../../reducers/Settings';
import MultiplayerLobby, { Props } from './MultiplayerLobby';

describe('Multiplayer lobby', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      phase: 'LOBBY',
      user: loggedOutUser,
      settings: initialSettings,
      multiplayer: initialMultiplayer,
      contentSets: new Set(),
      onConnect: jest.fn(),
      onReconnect: jest.fn(),
      onNewSessionRequest: jest.fn(),
      onStart: jest.fn(),
      onPlayerChange: jest.fn(),
      ...overrides,
    };
    const elem = mount(MultiplayerLobby(props));
    return { elem, props };
  }

  test('shows connection secret', () => {
    const { elem, props } = setup({
      multiplayer: {
        ...initialMultiplayer,
        session: { secret: 'asdf' },
      },
    });
    expect(elem.find('.sessionCode').text()).toEqual('asdf');
  });
  test('shows content set intersection', () => {
    const { elem, props } = setup({
      multiplayer: {
        ...initialMultiplayer,
        connected: true,
        session: { id: 'abc', secret: 'def' },
      },
      contentSets: new Set([Expansion.horror]),
    });
    const result = elem.find('#contentsets').text();
    expect(result).toContain('The Horror');
    expect(result).not.toContain('The Future');
  });
  test('calls onStart when start button clicked', () => {
    const { elem, props } = setup();
    elem.find('ExpeditionButton#start').prop('onClick')();
    expect(props.onStart).toHaveBeenCalled();
  });
  test('disables onStart when too many players', () => {
    const { elem, props } = setup({
      settings: { ...initialSettings, numLocalPlayers: 7 },
    });
    expect(elem.find('ExpeditionButton#start').prop('disabled')).toEqual(true);
  });
});

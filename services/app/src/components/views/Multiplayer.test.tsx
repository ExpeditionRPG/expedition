import {mount, unmountAll} from 'app/Testing';
import * as React from 'react';
import renderLobby, { Props } from './Multiplayer';
import {initialSettings} from '../../reducers/Settings';
import {initialMultiplayer} from '../../reducers/Multiplayer';
import {loggedOutUser} from '../../reducers/User';

describe('Multiplayer lobby', () => {
  afterEach(unmountAll);

  function setup(overrides?: Props) {
    const props: Props = {
      phase: 'LOBBY',
      user: loggedOutUser,
      multiplayer: initialMultiplayer,
      onConnect: jasmine.createSpy('onConnect'),
      onReconnect: jasmine.createSpy('onReconnect'),
      onNewSessionRequest: jasmine.createSpy('onNewSessionRequest'),
      onStart: jasmine.createSpy('onStart'),
      ...overrides,
    };
    const elem = mount(renderLobby(props));
    return {elem, props};
  }

  test('shows connection secret', () => {
    const {elem, props} = setup({
      multiplayer: {
        ...initialMultiplayer,
        session: {secret: 'asdf'},
      },
    });
    expect(elem.find('.sessionCode').text()).toEqual('asdf');
  });
  test('shows content set intersection', () => {
    const {elem, props} = setup({
      multiplayer: {
        ...initialMultiplayer,
        connected: true,
        clientStatus: {
          d: {type: 'STATUS', connected: false, contentSets: []}, // Disconnected clients are not counted
          e: {type: 'STATUS', connected: true, contentSets: ['horror']},
          f: {type: 'STATUS', connected: true, contentSets: ['horror', 'future']},
        },
      },
    });
    const result = elem.find('#contentsets').text();
    expect(result).toContain('The Horror');
    expect(result).not.toContain('The Future');
  });
  test('calls onStart when start button clicked', () => {
    const {elem, props} = setup();
    elem.find('ExpeditionButton#start').prop('onClick')();
    expect(props.onStart).toHaveBeenCalled();
  });

});

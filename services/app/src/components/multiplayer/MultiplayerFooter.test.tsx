import * as React from 'react';
import MultiplayerFooter, {Props} from './MultiplayerFooter';
import {render} from 'app/Testing';
import {MultiplayerState} from '../../reducers/StateTypes';
import {initialMultiplayer} from '../../reducers/Multiplayer';

export const testMultiplayer: MultiplayerState = {
  clientStatus: {
    "a": {connected: true, numPlayers: 3},
    "b": {connected: true, numPlayers: 2},
    "c": {connected: false, numPlayers: 1},
  },
  history: [],
  session: null,
  syncing: false,
};

describe('MultiplayerFooter', () => {
  function setup(overrides?: Partial<Props>) {
    const props: Props = {
      multiplayer: initialMultiplayer,
      cardTheme: 'light',
      questTheme: 'light',
      connected: false,
      setDialog: jasmine.createSpy('onClick'),
      ...overrides,
    };
    return {props, e: render(<MultiplayerFooter {...(props as any as Props)} />)};
  }

  test('shows connected peers', () => {
    const {e} = setup({multiplayer: testMultiplayer, connected: true});
    expect(e.find('.peers svg').length).toEqual(5);
  });
  test('shows adventurers with different styles (i.e colors) grouped by peer', () => {
    const {e} = setup({multiplayer: testMultiplayer, connected: true});
    const icons = e.find('.peers svg');
    const classes: {[string]: number} = {};
    for (let i =  0; i < icons.length; i++) {
      const n = icons.eq(i).attr('class').match(/player(\d)/);
      classes[n] = (classes[n] || 0) + 1;
    }
    expect(Object.values(classes).sort()).toEqual([2,3]);
  });
  test('indicates when disconnected', () => {
    const {e} = setup({connected: false});
    expect(e.find('.noWifi').length).toEqual(1);
  });
  test('indicates when connected', () => {
    const {e} = setup({connected: true});
    expect(e.find('.yesWifi').length).toEqual(1);
  });
});

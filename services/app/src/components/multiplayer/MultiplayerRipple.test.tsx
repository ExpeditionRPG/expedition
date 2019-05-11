import * as React from 'react';
import {mount, mountRoot, unmountAll} from 'app/Testing';
import MultiplayerRipple, {Props} from './MultiplayerRipple';

export const testMultiplayer: MultiplayerState = {
  clientStatus: {
    "a": {connected: true, numLocalPlayers: 3},
    "b": {connected: true, numLocalPlayers: 2},
    "c": {connected: false, numLocalPlayers: 1},
  },
  history: [],
  session: null,
  syncing: false,
};

const TEST_ID = "testripple";

describe('MultiplayerRipple', () => {
  afterEach(unmountAll);

  function setup(overrides?: Partial<Props>, ev: any) {
    const props: Props = {
      id: TEST_ID,
      multiplayer: testMultiplayer,
      setDialog: jasmine.createSpy('onClick'),
      ...overrides,
    };
    const root = mountRoot(<MultiplayerRipple {...(props as any as Props)} />);
    return {props, root};
  }

  test('Creates a ripple on inbound multiplayer event', () => {
    const e = setup().root.find('MultiplayerRipple');
    spyOn(e.instance(), 'start');
    e.find('MultiplayerRipple').instance().handle('a', {event: 'touchstart', positions: [[0, 0]], id: TEST_ID});
    expect(e.instance().start).toHaveBeenCalledTimes(1);
  });
  test('Colors ripple based on originating peer', () => {
    const {root} = setup();
    root.find('MultiplayerRipple').instance().handle('a', {event: 'touchstart', positions: [[0, 0]], id: TEST_ID});
    root.update();
    const r1 = root.find('TouchRipple').prop('classes').child.match(/ripplep(\d)/)[1];
    root.find('MultiplayerRipple').instance().handle('b', {event: 'touchstart', positions: [[0, 0]], id: TEST_ID});
    root.update();
    const r2 = root.find('TouchRipple').prop('classes').child.match(/ripplep(\d)/)[1];
    expect(r1).not.toEqual(r2);
  });
  test('Ignores actions not matching the ripple ID', () => {
    const e = setup().root.find('MultiplayerRipple');
    spyOn(e.instance(), 'start');
    e.instance().handle('a', {event: 'touchstart', positions: [[0, 0]], id: 'otherripple'});
    expect(e.instance().start).toHaveBeenCalledTimes(0);
  });
  test('Handles touchstart with empty position data', () => {
    const {root} = setup();
    spyOn(e.instance(), 'start');
    root.find('MultiplayerRipple').instance().handle('a', {event: 'touchstart', positions: [], id: TEST_ID});
    expect(e.instance().start).toHaveBeenCalledTimes(1);
  });
  test('Ends one ripple event before starting another', () => {
    // TODO
  });
  test.skip('Persists ending ripple event', () => { /* TODO */ });
});

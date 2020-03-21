import * as React from 'react';
import {mountRoot, unmountAll} from 'app/Testing';
import MultiplayerRipple, {Props} from './MultiplayerRipple';

jest.useFakeTimers();

export const testMultiplayer: any = {
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

  function setup(overrides?: Partial<Props>, ev?: any) {
    const props: any = {
      id: TEST_ID,
      multiplayer: testMultiplayer,
      setDialog: jasmine.createSpy('onClick'),
      ...overrides,
    };
    const root = mountRoot(<MultiplayerRipple {...(props as any as Props)} />);
    return {props, root};
  }

  test('Creates a ripple on inbound multiplayer event', () => {
    const e = setup({}, null).root.find('MultiplayerRipple');
    (spyOn as any)(e.instance(), 'start');
    (e.find('MultiplayerRipple').instance() as any).handle('a', {event: 'touchstart', positions: [[0, 0]], id: TEST_ID});
    expect((e.instance() as any).start).toHaveBeenCalledTimes(1);
  });
  test('Colors ripple based on originating peer', () => {
    const {root} = setup({}, null);
    (root.find('MultiplayerRipple').instance() as any).handle('a', {event: 'touchstart', positions: [[0, 0]], id: TEST_ID});
    root.update();
    const r1 = (root.find('TouchRipple').prop('classes') as any).child.match(/ripplep(\d)/)[1];
    (root.find('MultiplayerRipple').instance() as any).handle('b', {event: 'touchstart', positions: [[0, 0]], id: TEST_ID});
    root.update();
    const r2 = (root.find('TouchRipple').prop('classes') as any).child.match(/ripplep(\d)/)[1];
    expect(r1).not.toEqual(r2);
  });
  test('Ignores actions not matching the ripple ID', () => {
    const e = setup({}, null).root.find('MultiplayerRipple');
    (spyOn as any)(e.instance(), 'start');
    (e.instance() as any).handle('a', {event: 'touchstart', positions: [[0, 0]], id: 'otherripple'});
    expect((e.instance() as any).start).toHaveBeenCalledTimes(0);
  });
  test('Handles touchstart with empty position data', () => {
    const {root} = setup({}, null);
    const e = root.find('MultiplayerRipple');
    (spyOn as any)(e.instance(), 'start');
    (root.find('MultiplayerRipple').instance() as any).handle('a', {event: 'touchstart', positions: [], id: TEST_ID});
    expect((e.instance() as any).start).toHaveBeenCalledTimes(1);
  });
  test('Ends one ripple event before starting another', () => {
    const {root} = setup({} as any);
    const e = root.find('MultiplayerRipple');
    (spyOn as any)(e.instance(), 'end').and.callThrough();
    (root.find('MultiplayerRipple').instance() as any).handle('a', {event: 'touchstart', positions: [], id: TEST_ID});
    (root.find('MultiplayerRipple').instance() as any).handle('a', {event: 'touchstart', positions: [], id: TEST_ID});
    expect((e.instance() as any).end).toHaveBeenCalledTimes(1);
  });
  test('Times out ripple after started', () => {
    const {root} = setup({} as any);
    const e = root.find('MultiplayerRipple');
    (spyOn as any)(e.instance(), 'end').and.callThrough();
    (root.find('MultiplayerRipple').instance() as any).handle('a', {event: 'touchstart', positions: [], id: TEST_ID});
    root.update();
    expect((e.instance() as any).end).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect((e.instance() as any).end).toHaveBeenCalledTimes(1);
  });
});

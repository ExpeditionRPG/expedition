import * as React from 'react';
import {
  mountRoot,
  newMockStoreWithInitializedState,
  unmountAll,
} from '../../Testing';
import ModeSelectContainer from './ModeSelectContainer';
import ModeSelect from './ModeSelect';
jest.mock('../../actions/Multiplayer', () => ({
  ...jest.requireActual('../../actions/Multiplayer'),
  loadMultiplayer: jest.fn(() => ({ type: 'TEST_MULTIPLAYER' })),
}));
import { loadMultiplayer } from '../../actions/Multiplayer';

afterEach(unmountAll);
test('maps state and forwards player, touch, and multiplayer choices', () => {
  const state = newMockStoreWithInitializedState().getState();
  const wrapper = mountRoot(<ModeSelectContainer />, state);
  const view = wrapper.find(ModeSelect);
  expect(view.prop('settings')).toEqual(state.settings);
  expect(view.prop('user')).toEqual(state.user);
  expect(view.prop('multiplayer')).toEqual(state.multiplayer);

  view.prop('onMultiplayerSelect')(state.user);
  expect(loadMultiplayer).toHaveBeenCalledWith(state.user);
  view.prop('onPlayerChange')(3);
  view.prop('onMultitouchChange')(true);
  expect(wrapper.prop('store').getActions()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: 'CHANGE_SETTINGS',
        settings: { numLocalPlayers: 3 },
      }),
      expect.objectContaining({
        type: 'CHANGE_SETTINGS',
        settings: { multitouch: true },
      }),
    ]),
  );
});

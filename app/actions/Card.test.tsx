import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'
import {installStore, getStore} from '../Store'
import {toCard, toPrevious} from './Card'
const mockStore = configureStore([thunk]);

declare var window: any;
window.navigator = {vibrate: () => {}};

describe('Card action', () => {
  describe('toCard', () => {
    it('causes vibration if vibration enabled', () => {
      const store = mockStore({settings: {vibration: true}});
      installStore(store);
      spyOn(window.navigator, 'vibrate');

      store.dispatch(toCard('QUEST_CARD'));
      expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    it('does not vibrate if vibration not enabled', () => {
      const store = mockStore({settings: {vibration: false}});
      installStore(store);
      spyOn(window.navigator, 'vibrate');

      store.dispatch(toCard('QUEST_CARD'));
      expect(navigator.vibrate).toHaveBeenCalledTimes(0);
    });

    it('returns a NAVIGATE action', () => {
      expect(toCard('QUEST_CARD')).toEqual(jasmine.objectContaining({'type': 'NAVIGATE'}) as any);
    });
  });

  describe('toPrevious', () => {
    it('returns a RETURN action', () => {
      expect(toPrevious('QUEST_CARD')).toEqual(jasmine.objectContaining({'type': 'RETURN'}) as any);
    });
  });
});

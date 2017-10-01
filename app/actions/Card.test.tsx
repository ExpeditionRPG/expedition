import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'
import {installStore} from '../Store'
import {toCard, toPrevious} from './Card'
import {setNavigator} from '../Globals'
import {RemotePlayClient} from '../RemotePlay'
import {Action} from '../Testing'

describe('Card action', () => {
  let client: any;
  let mockStore: any;
  beforeEach(() => {
    client = new RemotePlayClient();
    mockStore = (initialState: any) => {return configureStore([client.createActionMiddleware()])(initialState)};
  });

  describe('toCard', () => {
    const navigator = {vibrate: () => {}};
    setNavigator(navigator);

    it('causes vibration if vibration enabled', () => {
      const store = mockStore({settings: {vibration: true}});
      installStore(store);
      spyOn(navigator, 'vibrate');
      Action(toCard).execute({name: 'QUEST_CARD'});
      expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    it('does not vibrate if vibration not enabled', () => {
      const store = mockStore({settings: {vibration: false}});
      installStore(store);
      spyOn(navigator, 'vibrate');
      Action(toCard).execute({name: 'QUEST_CARD'});
      expect(navigator.vibrate).toHaveBeenCalledTimes(0);
    });

    it('dispatches a NAVIGATE action', () => {
      const store = mockStore({settings: {vibration: false}});
      installStore(store);
      Action(toCard).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({'type': 'NAVIGATE'}));
    });
  });

  describe('toPrevious', () => {
    it('returns a RETURN action', () => {
      expect(toPrevious('QUEST_CARD')).toEqual(jasmine.objectContaining({'type': 'RETURN'}) as any);
    });
  });
});

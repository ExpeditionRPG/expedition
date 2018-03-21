import configureStore  from 'redux-mock-store'
import {toCard, toPrevious} from './Card'
import {setNavigator} from '../Globals'
import {RemotePlayClient} from '../RemotePlay'
import {Action} from '../Testing'

describe('Card action', () => {
  let client: RemotePlayClient;
  let mockStore: any;
  beforeEach(() => {
    client = new RemotePlayClient();
    mockStore = (initialState: any) => {return configureStore([client.createActionMiddleware()])(initialState)};
  });

  describe('toCard', () => {
    const navigator = {vibrate: () => {}};
    setNavigator(navigator);

    it('causes vibration if vibration enabled', () => {
      spyOn(navigator, 'vibrate');
      Action(toCard, {settings: {vibration: true}}).execute({name: 'QUEST_CARD'});
      expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    it('does not vibrate if vibration not enabled', () => {
      spyOn(navigator, 'vibrate');
      Action(toCard, {settings: {vibration: false}}).execute({name: 'QUEST_CARD'});
      expect(navigator.vibrate).toHaveBeenCalledTimes(0);
    });

    it('dispatches a NAVIGATE action', () => {
      Action(toCard).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({'type': 'NAVIGATE'}));
    });
  });

  describe('toPrevious', () => {
    it('returns a RETURN action', () => {
      Action(toPrevious).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({'type': 'RETURN'}));
    });
  });
});

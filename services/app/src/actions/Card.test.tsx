import {setNavigator} from '../Globals';
import {Action} from '../Testing';
import {toCard, toPrevious} from './Card';

describe('Card action', () => {
  describe('toCard', () => {
    const navigator = {vibrate: () => { /* mock */ }};
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
      Action(toCard).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({type: 'NAVIGATE'}));
    });
  });

  describe('toPrevious', () => {
    it('returns a RETURN action', () => {
      Action(toPrevious).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({type: 'RETURN'}));
    });
  });
});

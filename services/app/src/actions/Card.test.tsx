import {setNavigator} from '../Globals';
import {Action} from '../Testing';
import {toCard, toPrevious, toNavCard} from './Card';
import {NAV_CARD_STORAGE_KEY} from '../Constants';
import {setStorageKeyValue} from '../LocalStorage';

const fetchMock = require('fetch-mock');

describe('Card action', () => {
  describe('toCard', () => {
    const navigator = {vibrate: () => { /* mock */ }};
    setNavigator(navigator);

    test('causes vibration if vibration enabled', () => {
      spyOn(navigator, 'vibrate');
      Action(toCard, {settings: {vibration: true}}).execute({name: 'QUEST_CARD'});
      expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    test('does not vibrate if vibration not enabled', () => {
      spyOn(navigator, 'vibrate');
      Action(toCard, {settings: {vibration: false}}).execute({name: 'QUEST_CARD'});
      expect(navigator.vibrate).toHaveBeenCalledTimes(0);
    });

    test('dispatches a NAVIGATE action', () => {
      Action(toCard).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({type: 'NAVIGATE'}));
    });
  });

  describe('toPrevious', () => {
    test('returns a RETURN action', () => {
      Action(toPrevious).expect({matchFn: (c: any, n: any) => c === 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({type: 'RETURN'}));
    });
  });

  describe('toNavCard', () => {
    afterEach(() => {
      fetchMock.restore();
    });
    test('when specified, navigates to that card', () => {
      Action(toNavCard).expect({name: 'TUTORIAL_QUESTS'}).toDispatch(jasmine.objectContaining({
        type: 'NAVIGATE',
        to: jasmine.objectContaining({name: 'TUTORIAL_QUESTS'})
      }));
    });
    test('if not specified, loads most recent nav card from local storage', () => {
      setStorageKeyValue(NAV_CARD_STORAGE_KEY, 'OFFLINE_QUESTS');
      Action(toNavCard).expect({}).toDispatch(jasmine.objectContaining({
        type: 'NAVIGATE',
        to: jasmine.objectContaining({name: 'OFFLINE_QUESTS'})
      }));
    });
  })
});

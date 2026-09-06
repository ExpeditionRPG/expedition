import { AUTH_SETTINGS, NAV_CARD_STORAGE_KEY } from '../Constants';
import { setNavigator } from '../Globals';
import { setStorageKeyValue } from '../LocalStorage';
import { initialSettings } from '../reducers/Settings';
import { Action } from '../Testing';
import { toCard, toNavCard, toPrevious } from './Card';

const fetchMock = require('fetch-mock');

describe('Card action', () => {
  describe('toCard', () => {
    const navigator = {
      vibrate: () => {
        /* mock */
      },
    };
    setNavigator(navigator);

    // jest.spyOn() on an already-spied method returns the existing spy (call
    // counts and all), unlike jasmine's spyOn() which installed a fresh one per
    // spec. Restore between tests so each spy starts with zero calls.
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('causes vibration if vibration enabled', () => {
      jest.spyOn(navigator, 'vibrate').mockImplementation(() => undefined);
      Action(toCard, { settings: { vibration: true } }).execute({
        name: 'QUEST_CARD',
      });
      expect(navigator.vibrate).toHaveBeenCalledTimes(1);
    });

    test('does not vibrate if vibration not enabled', () => {
      jest.spyOn(navigator, 'vibrate').mockImplementation(() => undefined);
      Action(toCard, { settings: { vibration: false } }).execute({
        name: 'QUEST_CARD',
      });
      expect(navigator.vibrate).toHaveBeenCalledTimes(0);
    });

    test('dispatches a NAVIGATE action', () => {
      Action(toCard)
        .expect({ name: 'QUEST_CARD' })
        .toDispatch(expect.objectContaining({ type: 'NAVIGATE' }));
    });
  });

  describe('toPrevious', () => {
    test('returns a RETURN action', () => {
      Action(toPrevious)
        .expect({ matchFn: (c, n) => c === 'QUEST_CARD' })
        .toDispatch(expect.objectContaining({ type: 'RETURN' }));
    });
  });

  describe('toNavCard', () => {
    afterEach(() => {
      fetchMock.restore();
    });
    test('when specified, navigates to that card', () => {
      Action(toNavCard)
        .expect({ name: 'TUTORIAL_QUESTS' })
        .toDispatch(
          expect.objectContaining({
            type: 'NAVIGATE',
            to: expect.objectContaining({ name: 'TUTORIAL_QUESTS' }),
          }),
        );
    });
    test('if not specified, loads most recent nav card from local storage', () => {
      setStorageKeyValue(NAV_CARD_STORAGE_KEY, 'OFFLINE_QUESTS');
      Action(toNavCard)
        .expect({})
        .toDispatch(
          expect.objectContaining({
            type: 'NAVIGATE',
            to: expect.objectContaining({ name: 'OFFLINE_QUESTS' }),
          }),
        );
    });
  });
});

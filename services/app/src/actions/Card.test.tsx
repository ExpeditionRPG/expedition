import * as fetchMock from 'fetch-mock';
import {AUTH_SETTINGS} from '../Constants';
import {setNavigator} from '../Globals';
import {initialQuestState} from '../reducers/Quest';
import {initialSettings} from '../reducers/Settings';
import {loggedOutUser} from '../reducers/User';
import {Action} from '../Testing';
import {toCard, toPrevious} from './Card';

describe('Card action', () => {
  describe('toCard', () => {
    const navigator = {vibrate: () => { /* mock */ }};
    setNavigator(navigator);

    afterEach(() => {
      fetchMock.restore();
    });

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

    it('Logs the end of the quest to analytics', () => {
      const matcher = AUTH_SETTINGS.URL_BASE + '/analytics/quest/end';
      fetchMock.post(matcher, {});
      Action(toCard, {
        user: loggedOutUser,
        settings: initialSettings,
        quest: {details: initialQuestState},
      }).execute({name: 'QUEST_END'});
      expect(fetchMock.called(matcher)).toEqual(true);
    });
  });

  describe('toPrevious', () => {
    it('returns a RETURN action', () => {
      Action(toPrevious).expect({name: 'QUEST_CARD'}).toDispatch(jasmine.objectContaining({type: 'RETURN'}));
    });
  });
});

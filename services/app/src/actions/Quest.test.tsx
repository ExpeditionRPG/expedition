import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {AUTH_SETTINGS} from '../Constants';
import {initialQuestState} from '../reducers/Quest';
import {initialSettings} from '../reducers/Settings';
import {loggedOutUser} from '../reducers/User';
import {Action} from '../Testing';
import {exitQuest, endQuest, initQuest} from './Quest';
import {fakeConnection} from '../multiplayer/Testing';
import {initialMultiplayer} from '../reducers/Multiplayer';

const cheerio = require('cheerio') as CheerioAPI;
const fetchMock = require('fetch-mock');



describe('Quest actions', () => {
  describe('initQuest', () => {
    test('successfully returns the parsed quest node', () => {
      const questNode = cheerio.load('<quest><roleplay><p>Hello</p></roleplay></quest>')('quest');
      const result = initQuest(initialQuestState.details, questNode, defaultContext());
      expect(result.node.getRootElem().toString()).toEqual('<quest><roleplay><p>Hello</p></roleplay></quest>');
    });
  });

  describe('event', () => {
    test.skip('handles win event', () => { /* TODO */ });

    test.skip('handles lose event', () => { /* TODO */ });

    test.skip('gracefully failes on invalid event', () => { /* TODO */ });
  });

  describe('loadNode', () => {
    test.skip('ends quest on end trigger', () => { /* TODO */ });

    test.skip('dispatches roleplay on roleplay node', () => { /* TODO */ });

    test.skip('dispatches combat on combat node', () => { /* TODO */ });
  });

  describe('endQuest', () => {
    afterEach(() => {
      fetchMock.restore();
    });

    test('Logs the end of the quest to analytics', () => {
      const matcher = AUTH_SETTINGS.URL_BASE + '/analytics/quest/end';
      fetchMock.post(matcher, {});
      Action(endQuest, {
        user: loggedOutUser,
        settings: initialSettings,
        quest: {details: initialQuestState},
      }).execute({});
      expect(fetchMock.called(matcher)).toEqual(true);
    });
  });

  describe('exitQuest', () => {
    test('clears waitingOn', () => {
      const c = fakeConnection();
      const a = Action(exitQuest, {
        multiplayer: {
          ...initialMultiplayer,
          connected: true,
          client: "abc",
          instance: "def",
        },
      }, c).execute();
      expect(c.sendEvent).toHaveBeenCalledWith(jasmine.objectContaining({type: 'STATUS', waitingOn: undefined}), undefined);
    });
  });
});

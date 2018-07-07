import * as fetchMock from 'fetch-mock';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {AUTH_SETTINGS} from '../Constants';
import {initialQuestState} from '../reducers/Quest';
import {initialSettings} from '../reducers/Settings';
import {loggedOutUser} from '../reducers/User';
import {Action} from '../Testing';
import {endQuest, initQuest} from './Quest';

const cheerio = require('cheerio') as CheerioAPI;

describe('Quest actions', () => {
  describe('initQuest', () => {
    it('successfully returns the parsed quest node', () => {
      const questNode = cheerio.load('<quest><roleplay><p>Hello</p></roleplay></quest>')('quest');
      const result = initQuest(initialQuestState.details, questNode, defaultContext());
      expect(result.node.getRootElem().toString()).toEqual('<quest><roleplay><p>Hello</p></roleplay></quest>');
    });
  });

  describe('event', () => {
    it('handles win event');

    it('handles lose event');

    it('gracefully failes on invalid event');
  });

  describe('loadNode', () => {
    it('ends quest on end trigger');

    it('dispatches roleplay on roleplay node');

    it('dispatches combat on combat node');
  });

  describe('endQuest', () => {
    afterEach(() => {
      fetchMock.restore();
    });

    it('Logs the end of the quest to analytics', () => {
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
});

import * as fetchMock from 'fetch-mock';
import {loadQuestXML} from './Web';
import {Action} from '../Testing';
import {AUTH_SETTINGS} from '../Constants';
import {initialQuestState} from '../reducers/Quest';
import {initialSettings} from '../reducers/Settings';
import {loggedOutUser} from '../reducers/User';
import {defaultContext} from '../components/views/quest/cardtemplates/Template';

const cheerio = require('cheerio') as CheerioAPI;
const emptyQuest = cheerio.load('<quest><roleplay></roleplay></quest>')('quest');

describe('Web action', () => {
  describe('fetchQuestXML', () => {
    it('shows snackbar on request error'); // $10
    it('dispatches loaded quest'); // $10
  });

  describe('loadQuestXML', () => {
    afterEach(() => {
      fetchMock.restore();
    });
    it('logs quest play', () => {
      const matcher = AUTH_SETTINGS.URL_BASE + '/analytics/quest/start';
      fetchMock.post(matcher, {});
      Action(loadQuestXML as any, {
        user: loggedOutUser,
        settings: initialSettings,
        quest: {details: initialQuestState},
      }).execute({
        details: initialQuestState,
        questNode: emptyQuest,
        ctx: defaultContext(),
      });
      expect(fetchMock.called(matcher)).toEqual(true);
    });
  });

  describe('search', () => {
    it('shows snackbar on request error');  // $10
    it('dispatches search response'); // $10
  });

  describe('subscribe', () => {
    it('shows snackbar on request error'); // $10
  });

  describe('submitUserFeedback', () => {
    it('shows snackbar on request error'); // $10
    it('clears feedback after submission'); // $10
    it('shows snackbar on successful submission'); // $10
  });
});

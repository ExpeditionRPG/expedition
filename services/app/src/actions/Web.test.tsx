import {defaultContext} from '../components/views/quest/cardtemplates/Template';
import {AUTH_SETTINGS} from '../Constants';
import {initialQuestState} from '../reducers/Quest';
import {initialSettings} from '../reducers/Settings';
import {loggedOutUser} from '../reducers/User';
import {Action} from '../Testing';
import {loadQuestXML} from './Web';

const cheerio = require('cheerio') as CheerioAPI;
const fetchMock = require('fetch-mock');

describe('Web action', () => {

  const emptyQuest = cheerio.load('<quest><roleplay></roleplay></quest>')('quest');

  describe('fetchQuestXML', () => {
    test.skip('shows snackbar on request error', () => { /* TODO */ }); // $10
    test.skip('dispatches loaded quest', () => { /* TODO */ }); // $10
    test.skip('publishes generated seed remotely', () => { /* TODO */ }); // $10
  });

  describe('loadQuestXML', () => {
    afterEach(() => {
      fetchMock.restore();
    });
    test('logs quest play', () => {
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
    test.skip('shows snackbar on request error', () => { /* TODO */ });  // $10
    test.skip('dispatches search response', () => { /* TODO */ }); // $10
  });

  describe('subscribe', () => {
    test.skip('shows snackbar on request error', () => { /* TODO */ }); // $10
  });

  describe('submitUserFeedback', () => {
    test.skip('shows snackbar on request error', () => { /* TODO */ }); // $10
    test.skip('clears feedback after submission', () => { /* TODO */ }); // $10
    test.skip('shows snackbar on successful submission', () => { /* TODO */ }); // $10
    test.skip('adds quest line when in a quest', () => { /* TODO */ });
  });
});

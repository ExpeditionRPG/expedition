import { loggedOutUser } from 'shared/auth/UserState';
import * as requests from 'shared/requests';
import { defaultContext } from '../components/views/quest/cardtemplates/Template';
import { AUTH_SETTINGS } from '../Constants';
import { initialQuestState } from '../reducers/Quest';
import { initialSettings } from '../reducers/Settings';
import { Action } from '../Testing';
import { fetchQuestXML, loadQuestXML } from './Web';

import * as cheerio from 'shared/Cheerio';
const fetchMock = require('fetch-mock');

// The module transform defines exports as non-configurable getters, so
// jest.spyOn() cannot redefine fetchLocal in place. Replace the single export
// via the module registry instead, keeping the rest of the module intact.
jest.mock('shared/requests', () => {
  const actual = jest.requireActual('shared/requests');
  return { ...actual, fetchLocal: jest.fn() };
});

describe('Web action', () => {
  const emptyQuest = cheerio.load('<quest><roleplay></roleplay></quest>')(
    'quest',
  );

  describe('fetchQuestXML', () => {
    test.skip('shows snackbar on request error', () => {
      /* TODO */
    }); // $10
    test.skip('dispatches loaded quest', () => {
      /* TODO */
    }); // $10
    test.skip('publishes generated seed remotely', () => {
      /* TODO */
    }); // $10
    test('resolves promise after quest node dispatched', done => {
      // This is necessary for multiplayer replay.
      (requests.fetchLocal as jest.Mock).mockReturnValue(
        new Promise((a, r) => {
          setTimeout(() => {
            a('<quest><roleplay></roleplay></quest>');
          }, 200);
        }),
      );
      const result = Action(fetchQuestXML, {})
        .execute({
          details: { publishedurl: 'testurl' },
        })
        .then(dispatched => {
          const dispatchedTypes = dispatched.map(r => r.type);
          expect(dispatchedTypes).toContain('QUEST_NODE');
          done();
        })
        .catch(done);
    });
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
        quest: { details: initialQuestState },
      }).execute({
        details: initialQuestState,
        questNode: emptyQuest,
        ctx: defaultContext(),
      });
      expect(fetchMock.called(matcher)).toEqual(true);
    });
  });

  describe('search', () => {
    test.skip('shows snackbar on request error', () => {
      /* TODO */
    }); // $10
    test.skip('dispatches search response', () => {
      /* TODO */
    }); // $10
  });

  describe('subscribe', () => {
    test.skip('shows snackbar on request error', () => {
      /* TODO */
    }); // $10
  });

  describe('submitUserFeedback', () => {
    test.skip('shows snackbar on request error', () => {
      /* TODO */
    }); // $10
    test.skip('clears feedback after submission', () => {
      /* TODO */
    }); // $10
    test.skip('shows snackbar on successful submission', () => {
      /* TODO */
    }); // $10
    test.skip('adds quest line when in a quest', () => {
      /* TODO */
    });
  });
});

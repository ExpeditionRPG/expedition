import { AUTH_SETTINGS, TUTORIAL_QUESTS } from '../Constants';
import { initialSearch, search } from '../reducers/Search';
import { initialSettings } from '../reducers/Settings';
import { newMockStore } from '../Testing';
import {
  fetchSearchResults,
  searchAndPlayInternal,
  searchInternal,
} from './Search';
const fetchMock = require('fetch-mock');

describe('Search actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe('Search', () => {
    test('calls fetchSearchResults with provided params, players and settings', done => {
      const fr = jest.fn(() => {
        return Promise.resolve({ error: null, hasMore: false, quests: [] });
      });
      const store = newMockStore({});
      searchInternal(
        {
          params: initialSearch.params,
          players: 3,
          settings: initialSettings,
        },
        store.dispatch,
        fr,
      )
        .promise.then(() => {
          expect(fr).toHaveBeenCalledWith({
            ...initialSearch.params,
            players: 3,
          });
          expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: 'SEARCH_RESPONSE' }),
          );
          done();
        })
        .catch(done);
    });
    test.skip('calls getSearchResults with expansion enabled', () => {
      /* TODO */
    });

    // SEARCH_REQUEST sets `searching: true`; only SEARCH_ERROR or
    // SEARCH_RESPONSE clears it again. Dispatching the snackbar alone left the
    // search card rendering "Loading" forever.
    test('dispatches SEARCH_ERROR (not just a snackbar) when the fetch fails', done => {
      const fr = jest.fn(() => Promise.reject(new Error('network down')));
      const store = newMockStore({});
      searchInternal(
        {
          params: initialSearch.params,
          players: 3,
          settings: initialSettings,
        },
        store.dispatch,
        fr,
      )
        .promise.then(() => {
          const actions = store.getActions();
          expect(actions).toContainEqual(
            expect.objectContaining({ type: 'SEARCH_ERROR' }),
          );
          expect(actions).toContainEqual(
            expect.objectContaining({ type: 'SNACKBAR_OPEN' }),
          );
          expect(actions).not.toContainEqual(
            expect.objectContaining({ type: 'SEARCH_RESPONSE' }),
          );
          // Replaying the dispatched actions through the real reducer must
          // leave the view out of its loading state.
          const state = actions.reduce(
            (s, a) => search(s, a),
            search(undefined, { type: '@@INIT' }),
          );
          expect(state.searching).toEqual(false);
          done();
        })
        .catch(done);
    });
  });

  describe('searchAndPlay', () => {
    test('searches for and previews a specific quest', done => {
      const fr = jest.fn(() => {
        return Promise.resolve({
          error: null,
          hasMore: false,
          quests: [TUTORIAL_QUESTS[0]],
        });
      });
      const store = newMockStore({});
      searchAndPlayInternal('test', store.dispatch, fr)
        .promise.then(() => {
          expect(fr).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test' }),
          );
          const actions = store.getActions();
          expect(actions).toContainEqual(
            expect.objectContaining({ type: 'PREVIEW_QUEST' }),
          );
          done();
        })
        .catch(done);
    });

    test('dispatches SEARCH_ERROR when the fetch fails', done => {
      const fr = jest.fn(() => Promise.reject(new Error('network down')));
      const store = newMockStore({});
      searchAndPlayInternal('not-a-tutorial-quest', store.dispatch, fr)
        .promise.then(() => {
          expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: 'SEARCH_ERROR' }),
          );
          done();
        })
        .catch(done);
    });
  });

  describe('fetchSearchResults', () => {
    test.skip('credentials are included', () => {
      /* TODO */
    });

    test('formats result', done => {
      const matcher = AUTH_SETTINGS.URL_BASE + '/quests';
      const req = {
        error: null,
        hasMore: false,
        quests: TUTORIAL_QUESTS,
      };
      // The payload is complete, so nothing falls back to a schema default.
      // Date fields go over the wire as strings but Quest.create() re-parses
      // them, so they come back as the same Dates that went in.
      const want = {
        ...req,
        quests: req.quests.map(r => {
          r.setDefaults = [];
          return r;
        }),
      };
      fetchMock.post(matcher, req);
      fetchSearchResults(initialSearch.params)
        .then(r => {
          expect(r).toEqual(want);
          done();
        })
        .catch(done);
    });
  });
});

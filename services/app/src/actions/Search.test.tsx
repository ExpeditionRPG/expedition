import {newMockStore} from '../Testing'
import {fetchSearchResults, searchInternal, searchAndPlayInternal} from './Search'
import {initialSearch} from '../reducers/Search';
import {initialSettings} from '../reducers/Settings';
import {AUTH_SETTINGS, TUTORIAL_QUESTS} from '../Constants';
const fetchMock = require('fetch-mock');

describe('Search actions', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe('Search', () => {
    test('calls fetchSearchResults with provided params, players and settings', (done) => {
      const fr = jest.fn(() => {
        return Promise.resolve({error: null, hasMore: false, quests: []});
      });
      const store = newMockStore({});
      searchInternal({
        params: initialSearch.params,
        players: 3,
        settings: initialSettings,
      }, store.dispatch, fr).promise.then(() => {
        expect(fr).toHaveBeenCalledWith({
          ...initialSearch.params,
          players: 3,
        });
        expect(store.getActions()).toContainEqual(jasmine.objectContaining({type: 'SEARCH_RESPONSE'}));
        done();
      }).catch(done.fail);
    });
    test.skip('calls getSearchResults with expansion enabled', () => { /* TODO */ });
  });

  describe('searchAndPlay', () => {
    test('searches for and previews a specific quest', (done) => {
      const fr = jest.fn(() => {
        return Promise.resolve({error: null, hasMore: false, quests: [TUTORIAL_QUESTS[0]]});
      });
      const store = newMockStore({});
      searchAndPlayInternal('test', store.dispatch, fr).promise.then(() => {
        expect(fr).toHaveBeenCalledWith(jasmine.objectContaining({id: 'test'}));
        const actions = store.getActions()
        expect(actions).toContainEqual(jasmine.objectContaining({type: 'PREVIEW_QUEST'}));
        done();
      }).catch(done.fail);
    });
  });

  describe('fetchSearchResults', () => {
    test.skip('credentials are included', () => { /* TODO */ });

    test('formats result', (done) => {
      const matcher = AUTH_SETTINGS.URL_BASE + '/quests';
      const req = {
        error: null,
        hasMore: false,
        quests: TUTORIAL_QUESTS,
      };
      // Stringify dates, unset defaults
      const want = {...req, quests: req.quests.map((r) => {
        r.tombstone = r.tombstone.toString();
        r.created = r.created.toString();
        r.published = r.published.toString();
        r.setDefaults = [];
        return r;
      })};
      fetchMock.post(matcher, req);
      fetchSearchResults(initialSearch.params).then((r) => {
        expect(r).toEqual(want);
        done();
      }).catch(done.fail);
    });
  });
});

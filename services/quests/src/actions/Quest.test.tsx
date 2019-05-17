import {loadQuest} from './Quest';
import {API_HOST} from 'shared/schema/Constants';
import {loggedOutUser} from '../reducers/User';
import {Action} from '../Testing';

const fetchMock = require('fetch-mock');
const nodeFetch = require('node-fetch');
nodeFetch.default = fetchMock;

describe('quest actions', () => {
  window.gapi = {
    client: {
      load: jasmine.createSpy('gapi.client.load'),
    },
  };

  afterEach(() => {
    fetchMock.restore();
  });

  describe('newQuest', () => {
    test.skip('calls out to Drive API to create file', () => { /* TODO */ });

    test.skip('grants file discovery to Fabricate', () => { /* TODO */ });

    test.skip('uploads example quest to API', () => { /* TODO */ });

    test.skip('begins quest load after new quest created', () => { /* TODO */ });
  });

  describe('saveQuest', () => {
    test.skip('converts md to xml', () => { /* TODO */ });

    test.skip('passes xml through', () => { /* TODO */ });

    test.skip('dispatches on request', () => { /* TODO */ });

    test.skip('dispatches on response', () => { /* TODO */ });

    test.skip('runs cb() after successful save', () => { /* TODO */ });

    test.skip('does not run cb() if save failed', () => { /* TODO */ });

    test.skip('sends data, notes, and metadata to API server', () => { /* TODO */ });
  });

  describe('loadQuest', () => {
    const LOAD_RESULT = {data: 'quest data', notes: 'quest notes', metadata: {genre: 'DRAMA'}};

    function validateReceiveQuestLoad(results: any[]) {
      expect(results).toContainEqual(jasmine.objectContaining({
        type: 'RECEIVE_QUEST_LOAD',
      }));
      for (const r of results) {
        if (r.type !== 'RECEIVE_QUEST_LOAD') {
          continue;
        }
        expect(r.quest).toEqual(jasmine.objectContaining({
          genre: 'DRAMA',
        }));
        expect(r.quest.mdRealtime.getValue()).toEqual(LOAD_RESULT.data);
        expect(r.quest.notesRealtime.getValue()).toEqual(LOAD_RESULT.notes);
        expect(r.quest.metadataRealtime.getValue()).toEqual(LOAD_RESULT.metadata);
      }
    }

    test('loads from API', (done) => {
      const qid = 'testquestid';
      const edittime = new Date();
      const matcher = `${API_HOST}/qdl/${qid}/${edittime.getTime()}`;
      fetchMock.get(matcher, JSON.stringify({...LOAD_RESULT, edittime}));
      fetchMock.post(/.*/, {});
      Action(loadQuest, {}).execute(loggedOutUser, qid, edittime).then((results) => {
        expect(fetchMock.called(matcher)).toEqual(true);
        validateReceiveQuestLoad(results);
        done();
      }).catch(done.fail);
    });
  });

  describe('publishQuest', () => {
    test.skip('throws error(s) with default metadata', () => { /* TODO */ });

    test.skip('does not throw errors with changed metadata', () => { /* TODO */ });
  });

  describe('questMetadataChange', () => {
    test.skip('updates realtime object', () => { /* TODO */ });

    test.skip('creates action / updates store', () => { /* TODO */ });
  });
});


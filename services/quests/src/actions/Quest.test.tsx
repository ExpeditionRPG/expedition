import { EditableString } from '../Editable';
import { QuestType } from '../reducers/StateTypes';
import { API_HOST } from 'shared/schema/Constants';
import { loggedOutUser } from '../reducers/User';
import { Action } from '../Testing';
import {
  loadQuest,
  LoadResult,
  publishQuest,
  QUEST_NOTES_HEADER,
} from './Quest';

const fetchMock = require('fetch-mock');
const nodeFetch = require('node-fetch');
nodeFetch.default = fetchMock;

describe('quest actions', () => {
  window.gapi = {
    client: {
      load: jest.fn(),
      // ensureToken() (actions/User.tsx) short-circuits when gapi already holds
      // an OAuth token. Without this the Drive fallback below dies inside
      // ensureToken() before it ever reaches gapi.client.request().
      getToken: () => 'fake-oauth-token',
    },
  };

  afterEach(() => {
    fetchMock.restore();
  });

  describe('newQuest', () => {
    test.skip('calls out to Drive API to create file', () => {
      /* TODO */
    });

    test.skip('grants file discovery to Fabricate', () => {
      /* TODO */
    });

    test.skip('uploads example quest to API', () => {
      /* TODO */
    });

    test.skip('begins quest load after new quest created', () => {
      /* TODO */
    });
  });

  describe('saveQuest', () => {
    test.skip('converts md to xml', () => {
      /* TODO */
    });

    test.skip('passes xml through', () => {
      /* TODO */
    });

    test.skip('dispatches on request', () => {
      /* TODO */
    });

    test.skip('dispatches on response', () => {
      /* TODO */
    });

    test.skip('runs cb() after successful save', () => {
      /* TODO */
    });

    test.skip('does not run cb() if save failed', () => {
      /* TODO */
    });

    test.skip('sends data, notes, and metadata to API server', () => {
      /* TODO */
    });
  });

  describe('loadQuest', () => {
    const qid = 'testquestid';
    const edittime = new Date();
    const LOAD_RESULT = {
      data: '#title\n\nquest data',
      notes: 'quest notes',
      metadata: { genre: 'DRAMA' },
      edittime,
    };
    const testUser = {
      ...loggedOutUser,
      name: 'Test User',
      email: 'testuser@test.com',
    };

    function validateReceiveQuestLoad(results: any[], cb: () => any) {
      expect(results).toContainEqual(
        expect.objectContaining({
          type: 'RECEIVE_QUEST_LOAD',
        }),
      );
      for (const r of results) {
        if (r.type !== 'RECEIVE_QUEST_LOAD') {
          continue;
        }
        cb(r);
        break;
      }
    }

    test('loads from API', done => {
      const matcher = `${API_HOST}/qdl/${qid}/${edittime.getTime()}`;
      fetchMock.get(matcher, JSON.stringify({ ...LOAD_RESULT, edittime }));
      fetchMock.post(/.*/, {});
      Action(loadQuest, {})
        .execute(testUser, qid, edittime)
        .then(results => {
          expect(fetchMock.called(matcher)).toEqual(true);
          validateReceiveQuestLoad(results, r => {
            expect(r.quest).toEqual(
              expect.objectContaining({
                genre: 'DRAMA',
              }),
            );
            expect(r.quest.mdRealtime.getValue()).toEqual(LOAD_RESULT.data);
            expect(r.quest.notesRealtime.getValue()).toEqual(LOAD_RESULT.notes);
            expect(r.quest.metadataRealtime.getValue()).toEqual(
              LOAD_RESULT.metadata,
            );
          });
          done();
        })
        .catch(done);
    });

    test('falls back to Drive API & published metadata', done => {
      const apiMatcher = `${API_HOST}/qdl/${qid}/${edittime.getTime()}`;
      const driveMatcher = `https://www.googleapis.com/drive/v2/files/${qid}?alt=media`;
      const metaMatcher = `${API_HOST}/quests`;
      fetchMock.get(apiMatcher, 500);
      window.gapi.client.request = (args: any) => fetch(args.path);
      fetchMock.get(driveMatcher, {
        body: LOAD_RESULT.data + QUEST_NOTES_HEADER + '// ' + LOAD_RESULT.notes,
      });
      fetchMock.post(metaMatcher, { quests: [LOAD_RESULT.metadata] });
      Action(loadQuest, {})
        .execute(testUser, qid, edittime)
        .then(results => {
          expect(fetchMock.called(apiMatcher)).toEqual(true);
          expect(fetchMock.called(driveMatcher)).toEqual(true);
          validateReceiveQuestLoad(results, r => {
            expect(r.quest.mdRealtime.getValue()).toEqual(LOAD_RESULT.data);
            expect(r.quest.notesRealtime.getValue()).toEqual(LOAD_RESULT.notes);
            expect(r.quest.metadataRealtime.getValue()).toEqual(
              LOAD_RESULT.metadata,
            );
          });
          done();
        })
        .catch(done);
    });
  });

  describe('publishQuest', () => {
    test.each([false, true])(
      'sends encoded publish metadata (private: %s)',
      privatePublish => {
        const request = {
          done: jest.fn().mockReturnThis(),
          fail: jest.fn().mockReturnThis(),
        };
        const ajax = jest.fn().mockReturnValue(request);
        const previousDollar = Object.getOwnPropertyDescriptor(globalThis, '$');
        Object.defineProperty(globalThis, '$', {
          value: { ajax },
          configurable: true,
        });
        try {
          const quest: QuestType = {
            id: 'qa-quest',
            title: 'A & B?',
            author: 'QA Author',
            mdRealtime: new EditableString(
              'quest',
              '# Test Quest\n\nHello adventurer.',
            ),
          };
          publishQuest(quest, true, privatePublish)(jest.fn());
          const options = ajax.mock.calls[0][0];
          const url = new URL(options.url);
          expect(url.pathname).toBe('/publish/qa-quest');
          expect(url.searchParams.get('title')).toBe('A & B?');
          expect(url.searchParams.get('author')).toBe('QA Author');
          expect(url.searchParams.get('majorRelease')).toBe('true');
          expect(url.searchParams.get('partition')).toBe(
            privatePublish ? 'expedition-private' : 'expedition-public',
          );
          expect(options.type).toBe('POST');
          expect(options.data).toContain('<quest');
        } finally {
          if (previousDollar) {
            Object.defineProperty(globalThis, '$', previousDollar);
          } else {
            Reflect.deleteProperty(globalThis, '$');
          }
        }
      },
    );
    test.skip('throws error(s) with default metadata', () => {
      /* TODO */
    });

    test.skip('does not throw errors with changed metadata', () => {
      /* TODO */
    });
  });

  describe('questMetadataChange', () => {
    test.skip('updates realtime object', () => {
      /* TODO */
    });

    test.skip('creates action / updates store', () => {
      /* TODO */
    });
  });
});

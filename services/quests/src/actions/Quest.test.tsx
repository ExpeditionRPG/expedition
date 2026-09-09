import { EditableString, EditableMap, EditableModel } from '../Editable';
import { QuestType } from '../reducers/StateTypes';
import { API_HOST } from 'shared/schema/Constants';
import { loggedOutUser } from 'shared/auth/UserState';
import { Action } from '../Testing';
import {
  loadQuest,
  newQuest,
  saveQuest,
  questMetadataChange,
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
    test('creates and shares a Drive file, uploads the template, then loads the new quest', async () => {
      const insert = jest
        .fn()
        .mockReturnValue({ execute: (cb: any) => cb({ id: 'new-id' }) });
      window.gapi.client.load = jest.fn((_api: any, _version: any, cb: any) =>
        cb(),
      );
      window.gapi.client.drive = { files: { insert } };
      window.gapi.client.request = jest.fn().mockResolvedValue({});
      fetchMock.post(API_HOST + '/save/quest/new-id', {});
      const dispatch = jest.fn();
      await newQuest(loggedOutUser)(dispatch);
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          resource: expect.objectContaining({ mimeType: 'text/plain' }),
        }),
      );
      expect(window.gapi.client.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/drive/v3/files/new-id/permissions',
          body: expect.objectContaining({
            allowFileDiscovery: true,
            domain: 'Fabricate.io',
          }),
        }),
      );
      expect(fetchMock.called(API_HOST + '/save/quest/new-id')).toBe(true);
      expect(
        JSON.parse(fetchMock.lastOptions(API_HOST + '/save/quest/new-id').body)
          .data,
      ).toContain('#');
      expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });
  describe('saveQuest', () => {
    function fixture() {
      return {
        id: 'save-id',
        edittime: new Date(1000),
        mdRealtime: new EditableString(
          'md',
          '# Test Quest\n\nHello.\n\n**end**',
        ),
        notesRealtime: new EditableString('notes', 'Secret\nSecond line'),
        metadataRealtime: new EditableMap('metadata', { author: 'Tester' }),
      };
    }
    test('saves source, notes and metadata, renders XML and resolves after success', async () => {
      window.gapi.client.request = jest.fn().mockResolvedValue({});
      fetchMock.post(API_HOST + '/save/quest/save-id', {});
      const dispatch = jest.fn();
      const q = fixture();
      const done = jest.fn();
      const pending = saveQuest(q)(dispatch).then(done);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'REQUEST_QUEST_SAVE',
        quest: q,
      });
      await pending;
      expect(done).toHaveBeenCalledTimes(1);
      expect(JSON.parse(fetchMock.lastOptions().body)).toEqual({
        data: q.mdRealtime.getText(),
        notes: q.notesRealtime.getText(),
        metadata: { author: 'Tester' },
        edittime: 1000,
      });
      const render = dispatch.mock.calls
        .map(c => c[0])
        .find(a => a.type === 'QUEST_RENDER');
      expect(render.qdl.getResult().toString()).toContain('<quest');
      expect(dispatch).toHaveBeenCalledWith({
        type: 'RECEIVE_QUEST_SAVE',
        meta: expect.objectContaining({ title: 'Test Quest' }),
      });
      const drive = window.gapi.client.request.mock.calls[0][0];
      expect(drive.method).toBe('PUT');
      expect(drive.body).toContain('Test Quest.quest');
    });
    test('reports Drive failure without hanging or claiming a successful save', async () => {
      window.gapi.client.request = jest.fn().mockRejectedValue({
        result: { error: new Error('Drive unavailable') },
      });
      const dispatch = jest.fn();
      await saveQuest(fixture())(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'RECEIVE_QUEST_SAVE_ERR',
        err: 'Error: Drive unavailable',
      });
      expect(
        dispatch.mock.calls.some(c => c[0].type === 'RECEIVE_QUEST_SAVE'),
      ).toBe(false);
      expect(fetchMock.calls()).toHaveLength(0);
    });
    test('reports API failure after Drive has saved', async () => {
      window.gapi.client.request = jest.fn().mockResolvedValue({});
      fetchMock.post(API_HOST + '/save/quest/save-id', {
        status: 500,
        body: 'API unavailable',
      });
      const dispatch = jest.fn();
      await saveQuest(fixture())(dispatch);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'RECEIVE_QUEST_SAVE_ERR',
        err: 'Error: API unavailable',
      });
    });
    // Saving persists QDL; XML conversion belongs to the preview/publication renderer.
    // The former save callback is replaced by the returned Promise and Redux result.
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
    // Metadata validation now belongs to DialogsContainer, covered there.
  });
  describe('questMetadataChange', () => {
    test('updates the realtime map in a non-undoable transaction and dispatches metadata/autosave', () => {
      const metadataRealtime = new EditableMap('metadata', { title: 'Old' });
      const realtimeModel = {
        beginCompoundOperation: jest.fn(),
        endCompoundOperation: jest.fn(),
      };
      const dispatch = jest.fn();
      const delta = { title: 'New', minplayers: 2 };
      questMetadataChange({ metadataRealtime, realtimeModel }, delta)(dispatch);
      expect(metadataRealtime.getValue()).toEqual(delta);
      expect(realtimeModel.beginCompoundOperation).toHaveBeenCalledWith(
        '',
        false,
      );
      expect(realtimeModel.endCompoundOperation).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith({
        type: 'QUEST_METADATA_CHANGE',
        delta,
      });
      expect(dispatch).toHaveBeenLastCalledWith(expect.any(Function));
    });
  });
});

test('saving after losing Drive authorization reports a save error without an unhandled rejection', async () => {
  const previousGapi = window.gapi;
  window.gapi = { client: { getToken: () => null } };
  const dispatch = jest.fn();
  try {
    await saveQuest({
      id: 'quest',
      mdRealtime: new EditableString('quest', '# Test Quest'),
      notesRealtime: new EditableString('notes', ''),
      metadataRealtime: new EditableMap('metadata', {}),
    })(dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'RECEIVE_QUEST_SAVE_ERR',
        err: expect.stringContaining('Connect Google Drive'),
      }),
    );
  } finally {
    window.gapi = previousGapi;
  }
});

describe('new quest failures', () => {
  const previousGapi = window.gapi;
  afterEach(() => {
    window.gapi = previousGapi;
    fetchMock.restore();
  });
  test.each([
    'token',
    'load rejection',
    'load callback',
    'load throw',
    'insert missing id',
    'insert error',
    'insert throw',
    'upload',
    'template upload',
    'API save',
  ])('reports %s errors instead of leaving creation loading', async stage => {
    const dispatch = jest.fn();
    const insert = jest.fn(() => ({
      execute: (callback: any) => callback({ id: 'new-id' }),
    }));
    window.gapi = {
      client: {
        getToken: () => (stage === 'token' ? null : { access_token: 'token' }),
        load: (_api: any, _version: any, callback: any) => callback(),
        drive: { files: { insert } },
        request: jest.fn().mockResolvedValue({}),
      },
    };
    if (stage === 'load rejection')
      window.gapi.client.load = () =>
        Promise.reject(new Error('load rejected'));
    if (stage === 'load callback')
      window.gapi.client.load = (_api: any, _version: any, callback: any) =>
        callback({ error: { message: 'load failed' } });
    if (stage === 'load throw')
      window.gapi.client.load = () => {
        throw new Error('load threw');
      };
    if (stage === 'insert missing id')
      insert.mockReturnValue({ execute: callback => callback({}) });
    if (stage === 'insert error')
      insert.mockReturnValue({
        execute: callback =>
          callback({ error: { message: 'Drive quota exceeded' } }),
      });
    if (stage === 'insert throw')
      insert.mockImplementation(() => {
        throw new Error('insert threw');
      });
    if (stage === 'upload')
      window.gapi.client.request.mockRejectedValue({
        result: { error: { message: 'Upload failed' } },
      });
    // Count PUTs instead of inspecting the template's title.
    if (stage === 'template upload') {
      let uploads = 0;
      window.gapi.client.request.mockImplementation(args =>
        args.method === 'PUT' && ++uploads === 2
          ? Promise.reject({
              result: { error: { message: 'Template failed' } },
            })
          : Promise.resolve({}),
      );
    }
    fetchMock.post(
      API_HOST + '/save/quest/new-id',
      stage === 'API save' ? 500 : {},
    );
    await newQuest(loggedOutUser)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'SET_FATAL',
        error: expect.stringContaining('Failed to create new quest:'),
      }),
    );
    expect(
      dispatch.mock.calls.some(call => typeof call[0] === 'function'),
    ).toBe(false);
    if (stage.startsWith('insert'))
      expect(window.gapi.client.request).not.toHaveBeenCalled();
  });
  test('optional publisher sharing failure still opens the saved quest', async () => {
    window.gapi = {
      client: {
        getToken: () => ({ access_token: 'token' }),
        load: (_api: any, _version: any, callback: any) => callback(),
        drive: {
          files: {
            insert: () => ({
              execute: (callback: any) => callback({ id: 'new-id' }),
            }),
          },
        },
        request: jest.fn(args =>
          args.method === 'POST'
            ? Promise.reject(new Error('sharing disabled'))
            : Promise.resolve({}),
        ),
      },
    };
    fetchMock.post(API_HOST + '/save/quest/new-id', {});
    const dispatch = jest.fn();
    await newQuest(loggedOutUser)(dispatch);
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(dispatch.mock.calls.some(call => call[0].type === 'SET_FATAL')).toBe(
      false,
    );
  });
});

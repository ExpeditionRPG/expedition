import { TEST_USER_STATE } from './TestData';
import {
  checkForLogin,
  getAuthorizationToken,
  loadGapi,
  registerUserAndIdToken,
} from './Web';

const fetchMock = require('fetch-mock');

// This suite used to cover loginWeb()/silentLoginWeb() and a five-argument
// loadGapi() built on gapi.auth2. All of that was deleted in "Auth migration -
// Sign In With Google" (4d767026) when the app moved to Google Identity
// Services; the test file was not updated at the time, so it referenced
// exports that no longer exist. It now covers the module as it stands.

const URL_BASE = 'http://localhost:8081';

// What the API returns from /auth/session and /auth/google.
const SESSION_RESPONSE = {
  email: TEST_USER_STATE.email,
  id: 'testId',
  image: TEST_USER_STATE.image,
  name: TEST_USER_STATE.name,
  lastLogin: '2023-04-15T13:36:20.000Z',
  loginCount: 7,
  lootPoints: 12,
};

const EXPECTED_USER_STATE = {
  ...SESSION_RESPONSE,
  lastLogin: new Date(SESSION_RESPONSE.lastLogin),
  loggedIn: true,
};

function fakeGapi() {
  return {
    load: jest.fn((modules: string, callback: () => any) => callback()),
    client: {
      init: jest.fn(() => Promise.resolve()),
      setApiKey: jest.fn(),
    },
  };
}

// Stands in for the Google Identity Services library. `outcome` decides whether
// requestAccessToken() ends up invoking the success callback or error_callback.
function fakeGoogle(outcome: 'granted' | 'denied') {
  const requestAccessToken = jest.fn();
  const initTokenClient = jest.fn((config: any) => {
    requestAccessToken.mockImplementation(() => {
      if (outcome === 'granted') {
        config.callback({ access_token: 'testAccessToken' });
      } else {
        config.error_callback(new Error('popup_closed'));
      }
    });
    return { requestAccessToken };
  });
  return {
    accounts: { oauth2: { initTokenClient } },
    initTokenClient,
    requestAccessToken,
  };
}

describe('Web Auth', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  describe('loadGapi', () => {
    test('rejects if gapi was never put on the page', () => {
      return loadGapi(null, 'testkey', false).then(
        () => {
          throw new Error('expected loadGapi to reject');
        },
        (e: Error) => {
          expect(e.message).toEqual('gapi not loaded');
        },
      );
    });

    test('uses the already-loaded gapi on subsequent calls', () => {
      const fg = fakeGapi();
      return loadGapi(fg, 'testkey', true).then((r: any) => {
        expect(r).toBe(fg);
        expect(fg.load).not.toHaveBeenCalled();
        expect(fg.client.setApiKey).not.toHaveBeenCalled();
      });
    });

    test('loads the client on first call and applies the API key', () => {
      const fg = fakeGapi();
      return loadGapi(fg, 'testkey', false).then((r: any) => {
        expect(fg.load).toHaveBeenCalledWith(
          'client,drive-share',
          expect.any(Function),
        );
        expect(fg.client.init).toHaveBeenCalled();
        expect(fg.client.setApiKey).toHaveBeenCalledWith('testkey');
        expect(r).toBe(fg);
      });
    });
  });

  describe('getAuthorizationToken', () => {
    test('throws if the GIS library is not loaded', () => {
      expect(() =>
        getAuthorizationToken(null, URL_BASE, 'testclient', 'test scopes'),
      ).toThrow('google GIS not loaded');
    });

    test('resolves with the token response handed to the GIS callback', () => {
      const g = fakeGoogle('granted');
      return getAuthorizationToken(
        g,
        URL_BASE,
        'testclient',
        'test scopes',
      ).then((r: any) => {
        expect(g.initTokenClient).toHaveBeenCalledWith(
          expect.objectContaining({
            client_id: 'testclient',
            scope: 'test scopes',
          }),
        );
        expect(g.requestAccessToken).toHaveBeenCalled();
        expect(r).toEqual({ access_token: 'testAccessToken' });
      });
    });

    test('rejects when the user denies authorization', () => {
      const g = fakeGoogle('denied');
      return getAuthorizationToken(
        g,
        URL_BASE,
        'testclient',
        'test scopes',
      ).then(
        () => {
          throw new Error('expected getAuthorizationToken to reject');
        },
        (e: Error) => {
          expect(e.message).toEqual('popup_closed');
        },
      );
    });
  });

  describe('checkForLogin', () => {
    test('resolves the user state described by an active session', () => {
      fetchMock.get(`${URL_BASE}/auth/session`, SESSION_RESPONSE);
      return checkForLogin(URL_BASE).then(r => {
        expect(r).toEqual(EXPECTED_USER_STATE);
      });
    });

    test('resolves null when the session endpoint says unauthorized', () => {
      fetchMock.get(`${URL_BASE}/auth/session`, 401);
      return checkForLogin(URL_BASE).then(r => {
        expect(r).toEqual(null);
      });
    });

    test('resolves null when the request cannot be made at all', () => {
      // A rejected promise rather than fetch-mock's `throws:` option, which
      // throws synchronously - real fetch() always rejects instead.
      fetchMock.get(`${URL_BASE}/auth/session`, () =>
        Promise.reject(new Error('offline')),
      );
      return checkForLogin(URL_BASE).then(r => {
        expect(r).toEqual(null);
      });
    });
  });

  describe('registerUserAndIdToken', () => {
    test('posts the id token and resolves the registered user state', () => {
      fetchMock.post(`${URL_BASE}/auth/google`, SESSION_RESPONSE);
      return registerUserAndIdToken(URL_BASE, TEST_USER_STATE.idToken).then(
        r => {
          expect(JSON.parse(fetchMock.lastOptions().body)).toEqual({
            id_token: TEST_USER_STATE.idToken,
          });
          expect(r).toEqual(EXPECTED_USER_STATE);
        },
      );
    });

    test('rejects when the API refuses the id token', () => {
      fetchMock.post(`${URL_BASE}/auth/google`, 401);
      return registerUserAndIdToken(URL_BASE, 'not-a-real-token').then(
        () => {
          throw new Error('expected registerUserAndIdToken to reject');
        },
        (e: Error) => {
          expect(e.message).toEqual('Error authenticating.');
        },
      );
    });
  });
});

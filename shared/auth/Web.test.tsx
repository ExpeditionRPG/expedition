import {loadGapi, loginWeb, silentLoginWeb} from './Web'
import {TEST_USER_STATE} from './TestData'

const FAKE_USER = {
  getAuthResponse: () => {
    return {id_token: TEST_USER_STATE.idToken};
  },
  getBasicProfile: () => {
    return {
      getEmail: () => TEST_USER_STATE.email,
      getImageUrl: () => TEST_USER_STATE.image,
      getName: () => TEST_USER_STATE.name,
    };
  },
};

function fakeAuthInstance(isSignedIn = false) {
  return {
    signIn: jest.fn(() => Promise.resolve(FAKE_USER)),
    isSignedIn: {get: () => isSignedIn},
    currentUser: {get: () => (isSignedIn) ? FAKE_USER : null},
  };
}

function fakeGapiAuth2(isSignedIn = false) {
  const authInstanceSpy = fakeAuthInstance(isSignedIn);
  return {
    load: jest.fn((stuff: string, opts: {callback: ()=>any, onerror: ()=>any}) => {
      opts.callback();
    }),
    client: {setApiKey: jest.fn()},
    auth2: {
      init: jest.fn(),
      authInstanceSpy,
      getAuthInstance: () => authInstanceSpy,
    },
  };
}

describe('Web Auth', () => {
  describe('loadGapi', () => {
    test('loads auth2 on first call and indicates async', (done) => {
      const fg = fakeGapiAuth2();
      loadGapi(fg, 'testkey', 'testclient', 'test scopes', false).then((r) => {
        expect(r.async).toEqual(true);
        expect(fg.load).toHaveBeenCalledWith('client:auth2', jasmine.any(Object));
        expect(fg.auth2.init).toHaveBeenCalled();
        done();
      }).catch(done.fail);
    });

    test('uses loaded gapi on subsequent calls and indicates sync', (done) => {
      const fg = fakeGapiAuth2();
      loadGapi(fg, 'testkey', 'testclient', 'test scopes', true).then((r) => {
        expect(r).toEqual({gapi: fg, async: false});
        expect(fg.load).not.toHaveBeenCalled();
        expect(fg.auth2.init).not.toHaveBeenCalled();
        done();
      }).catch(done.fail);
    });
  });

  describe('loginWeb', () => {
    test('tries silent login if gapi async-loaded', (done) => {
      const fg = fakeGapiAuth2(true);
      const load = jest.fn(() => Promise.resolve({gapi: fg, async: true}));
      loginWeb(fg, "any", "any", "any", load).then((r) => {
        expect(fg.auth2.authInstanceSpy.signIn).not.toHaveBeenCalled();
        expect(r).toEqual(TEST_USER_STATE);
        done();
      }).catch(done.fail);
    });

    test('does full login if gapi already loaded', (done) => {
      const fg = fakeGapiAuth2(true);
      const load = jest.fn(() => Promise.resolve({gapi: fg, async: false}));
      loginWeb(fg, "any", "any", "any", load).then((r) => {
        expect(fg.auth2.authInstanceSpy.signIn).toHaveBeenCalled();
        expect(r).toEqual(TEST_USER_STATE);
        done();
      }).catch(done.fail);
    });
  });

  describe('silentLoginWeb', () => {
    test('fails if not authenticated', (done) => {
      const fg = fakeGapiAuth2(false);
      const load = jest.fn(() => Promise.resolve({gapi: fg, async: false}));
      silentLoginWeb(fg, "any", "any", "any", load).then((r) => {
        done.fail('did not fail');
      }).catch(() => done());
    });

    test('succeeds if authenticated', (done) => {
      const fg = fakeGapiAuth2(true);
      const load = jest.fn(() => Promise.resolve({gapi: fg, async: false}));
      silentLoginWeb(fg, "any", "any", "any", load).then((r) => {
        expect(r).toEqual(TEST_USER_STATE);
        done();
      }).catch(done.fail);
    });
  });

});

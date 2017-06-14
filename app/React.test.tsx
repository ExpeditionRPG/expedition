import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'
import {init, getDevicePlatform, getAppVersion, ReactWindow, Document, setWindowPropertyForTest} from './React'
import {installStore} from './Store'

//setWindowPropertyForTest(window, 'test', true);

function dummyDOM(): Document {
  const doc = document.implementation.createHTMLDocument('testdoc');
  let result = document.createElement('div');
  result.id = 'react-app';
  doc.body.appendChild(result);
  return doc;
}

function dummyGAPI(): any {
  return {
    load: (lib: string, cb: () => any) => {cb()},
    client: {
      setApiKey: (key: string) => {},
    },
    auth2: {
      init: (settings: any) => {
        return {
          then: (fn: () => any) => {fn();}
        };
      },
    },
  };
}

const mockStore = configureStore([thunk]);

fdescribe('React', () => {
  describe('init', () => {
    it('sets up tap events');
    it('loads google APIs');
    it('sets up event logging');
    it('uses dummy logging if Firebase not loaded');
    it('sets up hot reload');
    it('handles no hot reloading');

    describe('deviceready event', () => {
      it('triggers silent login', () => {
        const store = mockStore({});
        installStore(store);
        init(window, dummyDOM(), dummyGAPI());

      });
      it('adds backbutton listener');
      it('keeps screen on');
      it('patches android browser scrolling');
      it('hides android system ui');
    });
  });

  describe('logEvent', () => {
    it('logs to firebase');
    it('logs to google analytics if GA set up');
  })

  describe('getPlatform', () => {
    it('reports web if no device inititialized', () => {
      // No initialization at all
      expect(getDevicePlatform()).toEqual('web');
    });

    it('defaults to web on unexpected device', () => {
      setWindowPropertyForTest('device', {platform: 'zune'});
      expect(getDevicePlatform()).toEqual('web');
    });

    it('reports ios if ios device initialized', () => {
      setWindowPropertyForTest('device', {platform: 'ios'});
      expect(getDevicePlatform()).toEqual('ios');
    });

    it('reports android if android device initialized', () => {
      setWindowPropertyForTest('device', {platform: 'android'});
      expect(getDevicePlatform()).toEqual('android');
    });
  });

  describe('getVersion', () => {
    it('gets a version string', () => {
      expect(getAppVersion()).toMatch(/[0-9]+\.[0-9]+\.[0-9]+/);
    });
  });
});

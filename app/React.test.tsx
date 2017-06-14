import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'
import {init, getDevicePlatform, getAppVersion} from './React'
import {installStore} from './Store'
import {setDocument, setWindow, setDevice} from './Globals'

function dummyDOM(): Document {
  const doc = document.implementation.createHTMLDocument('testdoc');
  let result = document.createElement('div');
  result.id = 'react-app';
  doc.body.appendChild(result);

  // PhantomJS has no custom event trigger setup. we must add our own.
  const evtListeners: {[e:string]: ((event: any)=>any)[]} = {};
  (doc as any).addEventListener = (e: string, f: ()=>any, useCapture?: boolean) => {
    if (!evtListeners[e]) {
      evtListeners[e] = [];
    }
    evtListeners[e].push(f);
  };
  doc.dispatchEvent = (e: Event) => {
    if (!evtListeners[e.type]) {
      return false;
    }
    for (let f of evtListeners[e.type]) {
      f(e);
    }
    return true;
  }

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

describe('React', () => {
  describe('init', () => {
    it('sets up tap events');
    it('loads google APIs');
    it('sets up event logging');
    it('uses dummy logging if Firebase not loaded');
    it('sets up hot reload');
    it('handles no hot reloading');

    describe('deviceready event', () => {
      it('triggers silent login'); // Holding off on testing this one until we propagate window state better.
      it('adds backbutton listener', () => {
        const fakeStore = mockStore();
        installStore(fakeStore);
        const doc = dummyDOM();
        (window as any).plugins = {
          insomnia: {
            keepAwake: jasmine.createSpy('keepAwake'),
          },
        };
        setWindow(window);
        setDocument(doc);

        init();

        doc.dispatchEvent(new CustomEvent('deviceready', null));
        doc.dispatchEvent(new CustomEvent('backbutton', null));

        const actions = fakeStore.getActions();
        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual(jasmine.objectContaining({type:'RETURN'}));
      });
      it('keeps screen on');
      it('sets device style');
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
      setDevice({platform: 'zune'});
      expect(getDevicePlatform()).toEqual('web');
    });

    it('reports ios if ios device initialized', () => {
      setDevice({platform: 'ios'});
      expect(getDevicePlatform()).toEqual('ios');
    });

    it('reports android if android device initialized', () => {
      setDevice({platform: 'android'});
      expect(getDevicePlatform()).toEqual('android');
    });
  });

  describe('getVersion', () => {
    it('gets a version string', () => {
      expect(getAppVersion()).toMatch(/[0-9]+\.[0-9]+\.[0-9]+/);
    });
  });
});

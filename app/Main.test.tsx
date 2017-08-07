import configureStore  from 'redux-mock-store'
import thunk from 'redux-thunk'
import {init} from './Main'
import {installStore} from './Store'
import {setDocument, setWindow} from './Globals'

function dummyDOM(): Document {
  const doc = document.implementation.createHTMLDocument('testdoc');
  const result = document.createElement('div');
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
    for (const f of evtListeners[e.type]) {
      f(e);
    }
    return true;
  }

  return doc;
}

const mockStore = configureStore([thunk]);

describe('React', () => {
  describe('init', () => {
    it('sets up tap events');  // $10
    it('loads google APIs');  // $10
    it('sets up event logging'); // $10
    it('uses dummy logging if Firebase not loaded'); // $10
    it('sets up hot reload'); // $12
    it('handles no hot reloading');  // $10

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
    it('logs to firebase if firebase set up'); // $10
    it('logs to google analytics if GA set up'); // $10
  })

});

import * as Redux from 'redux';
import {setDocument, setWindow} from './Globals';
import {init} from './Init';
import {AppStateWithHistory} from './reducers/StateTypes';
import {installStore} from './Store';
import {newMockStoreWithInitializedState} from './Testing';

function dummyDOM(): Document {
  const doc = document.implementation.createHTMLDocument('testdoc');
  const result = document.createElement('div');
  result.id = 'react-app';
  doc.body.appendChild(result);

  // PhantomJS has no custom event trigger setup. we must add our own.
  const evtListeners: {[e: string]: Array<(event: any) => any>} = {};
  (doc as any).addEventListener = (e: string, f: () => any, useCapture?: boolean) => {
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
  };

  return doc;
}

describe('React', () => {
  describe('init', () => {
    it('loads google APIs');  // $10
    it('sets up event logging'); // $10
    it('sets up hot reload'); // $12
    it('handles no hot reloading');  // $10
    it('does not show game content dialog if all content sets defined');
    it('shows game content dialog if settings undefined');
    it('shows game content dialog if any content sets undefined');
    it('checks for announcements and new versions');

    describe('deviceready event', () => {
      it('triggers silent login'); // Holding off on testing this one until we propagate window state better.
      it('adds backbutton listener', () => {
        const fakeStore = newMockStoreWithInitializedState();
        installStore(fakeStore as any as Redux.Store<AppStateWithHistory>);
        const doc = dummyDOM();
        (window as any).plugins = {
          insomnia: {
            keepAwake: jasmine.createSpy('keepAwake'),
          },
        };
        setWindow(window);
        setDocument(doc);

        init();

        doc.dispatchEvent(new CustomEvent('deviceready'));
        fakeStore.clearActions();

        doc.dispatchEvent(new CustomEvent('backbutton'));
        const actions = fakeStore.getActions();
        expect(actions.length).toEqual(1);
        // Action 0 is expansion select dialog
        expect(actions[0]).toEqual(jasmine.objectContaining({type: 'RETURN'}));
      });
      it('keeps screen on');
      it('sets device style');
      it('patches android browser scrolling');
      it('hides android system ui');
      it('pauses music on window pause event');
      it('resumes music on window resume event');
    });
  });
});

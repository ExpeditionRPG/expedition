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
  // TODO rip this out now that we're on Chrome Headless
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
    test.skip('loads google APIs', () => { /* TODO */ });  // $10
    test.skip('sets up event logging', () => { /* TODO */ }); // $10
    test.skip('sets up hot reload', () => { /* TODO */ }); // $12
    test.skip('handles no hot reloading', () => { /* TODO */ });  // $10
    test.skip('does not show game content dialog if all content sets defined', () => { /* TODO */ });
    test.skip('shows game content dialog if settings undefined', () => { /* TODO */ });
    test.skip('shows game content dialog if any content sets undefined', () => { /* TODO */ });
    test.skip('checks for announcements and new versions', () => { /* TODO */ });

    describe('deviceready event', () => {
      test.skip('triggers silent login', () => { /* TODO */ }); // Holding off on testing this one until we propagate window state better.

      // TODO this should be done with puppeteer instead of window mocking nonsense
      test.skip('adds backbutton listener', () => {
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
      test.skip('keeps screen on', () => { /* TODO */ });
      test.skip('sets device style', () => { /* TODO */ });
      test.skip('patches android browser scrolling', () => { /* TODO */ });
      test.skip('hides android system ui', () => { /* TODO */ });
      test.skip('pauses music on window pause event', () => { /* TODO */ });
      test.skip('resumes music on window resume event', () => { /* TODO */ });
    });
  });
});

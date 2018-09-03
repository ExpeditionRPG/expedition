import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import * as Redux from 'redux';
import theme from 'shared/Theme';
import {renderAndPlay} from './actions/Editor';
import {questLoading, saveQuest} from './actions/Quest';
import {setSnackbar} from './actions/Snackbar';
import {loginUser} from './actions/User';
import MainContainer from './components/MainContainer';
import {VERSION} from './Constants';
import {store} from './Store';

declare var require: any;
declare var window: any;
declare var unescape: any;

const Typo = require('typo-js');

// This is necessary to prevent compiler errors until/unless we fix the rest of
// the repo to reference custom-defined action types (similar to how redux-thunk does things)
// TODO: Fix redux types
/* tslint:disable */
export type ThunkAction<R, S = {}, E = {}, A extends Redux.Action<any> = Redux.AnyAction> = (
  dispatch: Redux.Dispatch<A>,
  getState: () => S,
  extraArgument: E
) => R;
declare module 'redux' {
  export interface Dispatch<A extends Redux.Action<any> = Redux.AnyAction> {
    <R, E>(asyncAction: ThunkAction<R, {}, E, A>): R;
  }
}
/* tslint:enable */

window.onerror = (message: string, source: string, line: number) => {
  console.error(message, source, line);
  store.dispatch(setSnackbar(true, 'Error! ' + message));
  return true; // prevents the firing of the default event handler
};

const ReactGA = require('react-ga');
ReactGA.initialize('UA-47408800-7');

let questId: string = '';
if (!window.location.hash && window.location.search.indexOf('ids') !== -1) {
  // Try to parse from google drive menu action, e.g.
  // ?state=%7B"ids":%5B"0BzrQOdaJcH9MeDhic2ctdFNSdjg"%5D,"action":"open","userId":"106667818352266772866"%7D
  try {
    questId = JSON.parse(unescape(window.location.search).match(/\?state=(.*)/)[1]).ids[0];
    window.location.href = '/#' + questId;
  } catch (e) {
    ReactGA.event({
      action: 'Failed to parse anticipated Drive open URI',
      category: 'Error',
      label: window.location.search,
    });
  }
} else if (window.location.hash || window.location.href.endsWith('#')) {
  questId = window.location.hash.slice(1);
}

if (questId !== '') {
  store.dispatch(questLoading());
  ReactGA.pageview('/quest');
} else {
  ReactGA.pageview('/');
}

// Try silently logging in
// 10/10/2017: Also avoids popup blockers by making future login attempts
// Trigger directly from the user action, rather than needing to load files
if (window.gapi) {
  window.gapi.load('client,drive-realtime,drive-share', () => {
    store.dispatch(loginUser(false, questId));
  });
}

// alert user if they try to close the page with unsaved changes
window.onbeforeunload = () => {
  if (store.getState().dirty === true) {
    return false;
  }
  return null;
};

// Ctrl + <hotkey>
window.addEventListener('keydown', (event: any) => {
  if (event.ctrlKey || event.metaKey) {
    const state = store.getState();
    switch (String.fromCharCode(event.which).toLowerCase()) {
      case 's': // ctrl + s to save
        event.preventDefault();
        if (state.editor.dirty) {
          store.dispatch(saveQuest(state.quest));
        }
        break;
      case '\n':
      case '\r':
        if (state.quest.mdRealtime) {
          store.dispatch(renderAndPlay(state.quest, state.quest.mdRealtime.getText(), state.editor.line.number, state.editor.worker));
        }
        break;
      default:
        // Do nothing
        break;
    }
  }
});

window.onOlarkLoad = () => {
  window.olark('api.chat.onBeginConversation', () => {
    // Invisible to user
    window.olark('api.chat.sendNotificationToOperator', {
      body: 'Quest name: ' + store.getState().quest.title,
    });
  });
};

(() => {
  // load spellcheck dictionary asynchronously after waiting 1s for rest of the page to load
  const affPath = '/dictionaries/en_US_aff.txt';
  const dicPath = '/dictionaries/en_US_dic.txt';
  setTimeout(() => {
    $.get(dicPath, (dicData) => {
      $.get(affPath, (affData) => {
        window.dictionary = new Typo('en_US', affData, dicData);
      });
    });
  }, 1000);

  // every 12 hours, check for the latest version
  setInterval(() => {
    $.ajax({
      dataType: 'json',
      success: (data: any) => {
        if (data && data.version) {
          const newVersion = data.version.split('.').map(Number);
          const oldVersion = VERSION.split('.').map(Number);
          if (newVersion[0] > oldVersion[0] || newVersion[1] > oldVersion[1] || newVersion[2] > oldVersion[2]) {
            store.dispatch(setSnackbar(true,
              'There\'s a new version of the Quest Creator available!',
              (event: any) => { location.reload(); },
              'reload',
              true
            ));
          }
        }
      },
      url: 'https://raw.githubusercontent.com/ExpeditionRPG/expedition/master/services/quests/package.json',
      xhrFields: { withCredentials: false },
    });
  }, 12 * 60 * 60 * 1000);

  // Alert user if cookies disabled
  // Based on https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js
  try {
    document.cookie = 'cookietest=1';
    const ret = document.cookie.indexOf('cookietest=') !== -1;
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    if (!ret) {
      throw new Error('Cookies disabled');
    }
  } catch (err) {
    setTimeout(() => {
      store.dispatch(setSnackbar(true,
        'Please enable cookies for the Quest Creator to function properly.',
        (event: any) => { store.dispatch(setSnackbar(false)); },
        'X',
        true
      ));
  }, 0);
  }
})();

// Pass credentials to API server despite cross-origin
$.ajaxSetup({
  xhrFields: {
    withCredentials: true,
  },
});

render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <MainContainer></MainContainer>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);

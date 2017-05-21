// <reference path="../typings/custom/custom.d.ts" />

import * as React from 'react'
import {render} from 'react-dom'

// For hot reload
declare var require: any;
declare var module: any;

// For dev tools extension
declare var window:any;

// For URL parsing
declare var unescape: any;

// Material UI theming libs
import theme from './theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

const ReactGA = require('react-ga') as any;
const Typo: any = require('typo-js');

// Needed for onTouchTap
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

// Redux libraries
import {Provider} from 'react-redux'

// Custom components
import MainContainer from './components/MainContainer'
import {loginUser, setProfileMeta} from './actions/user'
import {saveQuest} from './actions/quest'
import {setSnackbar} from './actions/snackbar'
import {store} from './store'
import {VERSION} from './constants'

let isQuest = false;

if (!window.location.hash && window.location.search.indexOf('ids') !== -1) {
  // Try to parse from google drive menu action, e.g.
  // ?state=%7B"ids":%5B"0BzrQOdaJcH9MeDhic2ctdFNSdjg"%5D,"action":"open","userId":"106667818352266772866"%7D
  try {
    let doc_json = JSON.parse(unescape(window.location.search).match(/\?state=(.*)/)[1]);
    window.location.href = '/#' + doc_json.ids[0];
    isQuest = true;
  } catch (e) {
    console.log('Failed to parse anticipated Drive open URI: ' + window.location.search);
  }
}

ReactGA.initialize('UA-47408800-7');
if (isQuest) {
  ReactGA.pageview('/quest');
} else {
  ReactGA.pageview('/');
}

// alert user if they try to close the page with unsaved changes
window.onbeforeunload = function () {
  if (store.getState().dirty === true) {
    return false;
  }
  return null;
}

// Ctrl + <hotkey>
window.addEventListener('keydown', function checkForCtrlS (event: any) {
  if (event.ctrlKey || event.metaKey) {
    switch (String.fromCharCode(event.which).toLowerCase()) {
      case 's': // ctrl + s to save
        event.preventDefault();
        const state = store.getState();
        if (state.editor.dirty) {
          store.dispatch(saveQuest(state.quest));
        }
        break;
      default:
        // Do nothing
        break;
    }
  }
});

// override app analytics - don't report while dev'ing
window.FirebasePlugin = {
  logEvent: console.log,
};

window.gapi.load('client,drive-realtime,drive-share', () => {
  window.gapi.client.load('drive', 'v2', () => {
    if (window.location.hash) {
      store.dispatch(loginUser(false));
    } else {
      store.dispatch(setProfileMeta({
        loggedIn: false
      }));
    }
  });
});

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
    $.getJSON('https://raw.githubusercontent.com/ExpeditionRPG/expedition-quest-creator/master/package.json', (data) => {
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
    });
  }, 12 * 60 * 60 * 1000);
})();

render(
  <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
    <Provider store={store}>
      <MainContainer></MainContainer>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);

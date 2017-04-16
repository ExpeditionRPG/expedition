// <reference path="../typings/custom/custom.d.ts" />

import * as React from 'react'
import {render} from 'react-dom'

import {saveQuest} from './actions/quest'

// For hot reload
declare var require: any;
declare var module: any;

// For dev tools extension
declare var window:any;

// For URL parsing
declare var unescape: any;

const Typo: any = require('typo-js');

// Material UI theming libs
import theme from './theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const Typo: any = require('typo-js');

// Needed for onTouchTap
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

// Redux libraries
import {Provider} from 'react-redux';

// Custom components
import MainContainer from './components/MainContainer';
import {loginUser} from './actions/user';

import {store} from './store'

if (!window.location.hash && window.location.search.indexOf('ids') !== -1) {
  // Try to parse from google drive menu action, e.g.
  // ?state=%7B"ids":%5B"0BzrQOdaJcH9MeDhic2ctdFNSdjg"%5D,"action":"open","userId":"106667818352266772866"%7D
  try {
    let doc_json = JSON.parse(unescape(window.location.search).match(/\?state=(.*)/)[1]);
    window.location.href = '/#' + doc_json.ids[0];
  } catch (e) {
    console.log('Failed to parse anticipated Drive open URI: ' + window.location.search);
  }
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

// override analytics / don't report while dev'ing
window.FirebasePlugin = {
  logEvent: function(name: string, args: any) { console.log(name, args); },
};

window.gapi.load('client,client:auth2,drive-realtime,drive-share', function() {
  window.gapi.client.load('drive', 'v2', function() {
    store.dispatch(loginUser(false));
  });
});

// load spellcheck dictionary asynchronously, wait 1s for rest of the page to load
(() => {
  const affPath = '/dictionaries/en_US_aff.txt';
  const dicPath = '/dictionaries/en_US_dic.txt';
  setTimeout(() => {
    $.get(dicPath, function(dicData) {
      $.get(affPath, function(affData) {
        window.dictionary = new Typo('en_US', affData, dicData);
      });
    });
  }, 1000);
})();

render(
  <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
    <Provider store={store}>
      <MainContainer></MainContainer>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);

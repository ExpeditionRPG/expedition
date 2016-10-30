/// <reference path="../typings/redux/redux.d.ts" />
/// <reference path="../typings/redux-thunk/redux-thunk.d.ts" />
/// <reference path="../typings/react-redux/react-redux.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
/// <reference path="../typings/react/react-router.d.ts" />
/// <reference path="../typings/material-ui/material-ui.d.ts" />
/// <reference path="../typings/react-tap-event-plugin/react-tap-event-plugin.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-shim/es6-shim.d.ts" />

/// <reference path="../typings/custom/require.d.ts" />
/// <reference path="../typings/custom/react-ace.d.ts" />
/// <reference path="../typings/custom/brace.d.ts" />

// TODO: Investigate removing tests from the compilation path
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/expect/expect.d.ts" />


import * as React from 'react';
import {render} from 'react-dom';

import {saveQuest} from './actions/quest';

// So we can hot reload
declare var require: any;
declare var module: any;

// For dev tools extension
declare var window:any;

declare var unescape: any;

// Material UI theming libs
import theme from './theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Needed for onTouchTap
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

// Redux libraries
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';

// Custom components
import MainContainer from './components/MainContainer';
import questIDEApp from './reducers/CombinedReducers';
import {loginUser} from './actions/user';

let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
let middleware = applyMiddleware(thunk);
const store: any = middleware(devtools(createStore))(questIDEApp, {});

if (!window.location.hash && window.location.search.indexOf('ids') !== -1) {
  // Try to parse from google drive menu action, e.g.
  //?state=%7B"ids":%5B"0BzrQOdaJcH9MeDhic2ctdFNSdjg"%5D,"action":"open","userId":"106667818352266772866"%7D
  try {
    var doc_json = JSON.parse(unescape(window.location.search).match(/\?state=(.*)/)[1]);
  } catch (e) {
    console.log("Failed to parse anticipated Drive open URI: " + window.location.search);
  }
  window.location.href = "/#" + doc_json.ids[0];
}

// alert user if they try to close the page with unsaved changes
window.onbeforeunload = function () {
  if (store.getState().dirty === true) {
    return false;
  }
  return null;
}

// Ctrl + S to save
window.addEventListener('keydown', function checkForCtrlS (event: any) {
  if (event.ctrlKey || event.metaKey) {
    switch (String.fromCharCode(event.which).toLowerCase()) {
      case 's':
        event.preventDefault();
        const state = store.getState();
        if (state.dirty) {
          store.dispatch(saveQuest(state.quest));
        }
        break;
    }
  }
});

window.gapi.load('client,client:auth2,drive-realtime,drive-share', function() {
  window.gapi.client.load('drive', 'v2', function() {
    store.dispatch(loginUser(false));
  });
});

if (module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    console.log("Updating reducers");
    let updated = require('./reducers/CombinedReducers');
    store.replaceReducer(updated);
  });
}

render(
  <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
    <Provider store={store}>
      <MainContainer></MainContainer>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);

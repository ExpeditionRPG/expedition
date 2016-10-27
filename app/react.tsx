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

// So we can hot reload
declare var require: any;
declare var module: any;

// For dev tools extension
declare var window:any;

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

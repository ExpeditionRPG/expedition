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
import {Router, Route, Link, hashHistory} from 'react-router';

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
import DialogsContainer from './components/DialogsContainer';
import SplashContainer from './components/SplashContainer';
import QuestAppBarContainer from './components/QuestAppBarContainer';
import QuestDrawerContainer from './components/QuestDrawerContainer';
import QuestIDEContainer from './components/QuestIDEContainer';
import questIDEApp from './reducers/CombinedReducers';

// Initialize the global redux store
var initialStateElem = document.getElementById("initial-state");
let auth = (initialStateElem) ? JSON.parse(initialStateElem.textContent) : {};
let initialState: Object = {
  user: {
    id: auth.id,
    displayName: auth.name,
    image: auth.image
  },
};

let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
let middleware = applyMiddleware(thunk);
const store: any = middleware(devtools(createStore))(questIDEApp, initialState);

declare var gapi: any;
function initAuth(): void {
  gapi.client.setApiKey("AIzaSyCgvf8qiaVoPE-F6ZGqX6LzukBftZ6fJr8");
  gapi.auth2.init({
    client_id: "545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com",
    scope: "profile"
  }).then(function() {
    // Render the components, picking up where react left off on the server
    render(
      <Router history={hashHistory}>
        <Route path="/" component={SplashPage}></Route>
        <Route path="/app" component={AppPage} onEnter={requireAuth}></Route>
      </Router>,
      document.getElementById('react-app')
    );
  });
}
gapi.load('client:auth2', initAuth);


function requireAuth(nextState: any, replace: any): void {
  if (gapi.auth2 == null || !gapi.auth2.getAuthInstance().isSignedIn.get()) {
    replace({
      pathname: '/',
      state: { nextPathname: nextState.location.pathname }
    });
  }
}


if (module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    console.log("Updating reducers");
    let updated = require('./reducers/CombinedReducers');
    console.log(updated)
    store.replaceReducer(updated);
  });
}


const AppPage = React.createClass({
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <Provider store={store}>
          <div style={{width: "100%", height: "100%"}}>
            <QuestAppBarContainer/>
            <QuestIDEContainer/>
            <QuestDrawerContainer/>
            <DialogsContainer/>
          </div>
        </Provider>
      </MuiThemeProvider>
    )
  }
});

const SplashPage = React.createClass({
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <Provider store={store}>
          <div style={{width: "100%", height: "100%"}}>
            <SplashContainer/>
          </div>
        </Provider>
      </MuiThemeProvider>
    )
  }
});
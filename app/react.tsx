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

// For google realtime API
declare var utils: any;

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

var realtimeUtils: any = new utils.RealtimeUtils({
  clientId: "545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com",
  mimeType: 'application/vnd.google-apps.document',
});

function authorize() {
  // Attempt to authorize
  realtimeUtils.authorize(function(response: any){
    if(response.error){
      // Authorization failed because this is the first time the user has used your application,
      // show the authorize button to prompt them to authorize manually.
      alert("Auth failed: " + response.error)
      realtimeUtils.authorize(function(response: any){
        start();
      }, true);
    } else {
      start();
    }
  }, false);
}


authorize();

function start() {
  // With auth taken care of, load a file, or create one if there
  // is not an id in the URL.
  var id = realtimeUtils.getParam('id');
  if (id) {
    // Load the document id from the URL
    realtimeUtils.load(id.replace('/', ''), onFileLoaded, onFileInitialize);
  } else {
    // Create a new document, add it to the URL
    realtimeUtils.createRealtimeFile('New Quickstart File', function(createResponse: any) {
      window.history.pushState(null, null, '?id=' + createResponse.id);
      realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
    });
  }
}

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model: any) {
  console.log("INITIALIZED");
  var string = model.createString();
  string.setText('Welcome to the Quickstart App!');
  model.getRoot().set('demo_string', string);
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc: any) {
  console.log(doc);
  /*
  var collaborativeString = doc.getModel().getRoot().get('demo_string');
  gapi.drive.realtime.databinding.bindString(collaborativeString, textArea1);
  gapi.drive.realtime.databinding.bindString(collaborativeString, textArea2);
  */
}

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
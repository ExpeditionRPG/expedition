/// <reference path="../typings/redux/redux.d.ts" />
/// <reference path="../typings/redux-thunk/redux-thunk.d.ts" />
/// <reference path="../typings/react-redux/react-redux.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
/// <reference path="../typings/material-ui/material-ui.d.ts" />
/// <reference path="../typings/react-tap-event-plugin/react-tap-event-plugin.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/custom/custom.d.ts" />

// TODO: Investigate removing tests from the compilation path
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/expect/expect.d.ts" />

import * as React from 'react'
import * as ReactDOM from 'react-dom'

// So we can hot reload
declare var require: any;
declare var module: any;

// Cordova device
declare var device: any;
declare var window:any;

// For gapi login
declare var gapi: any;


// Material UI theming libs
import theme from './theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

// Needed for onTouchTap
var injectTapEventPlugin = require('react-tap-event-plugin');
try {
  injectTapEventPlugin();
} catch (e) {
  console.log("Already injected tap event plugin");
}

// Custom components
import {authSettings} from './constants'
import {toPrevious} from './actions/card'
import {getStore} from './store'

// Wait for device API libraries to load
document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
function onDeviceReady() {
  var p = device.platform.toLowerCase();
  if (/android/i.test(p)) {
    window.platform = "android";
    document.body.className += " android";
  } else if (/iphone|ipad|ipod/i.test(p)) {
    window.platform = "ios";
    document.body.className += " ios";
  }

  document.addEventListener("backbutton", function() {
    getStore().dispatch(toPrevious());
  }, false);
}

// TODO: API Auth
gapi.load('client:auth2', function() {
  gapi.client.setApiKey(authSettings.apiKey);
  gapi.auth2.init({
      client_id: authSettings.clientId,
      scope: authSettings.scopes,
  }).then(function() {
    console.log(gapi.auth2.getAuthInstance().isSignedIn);
  });
});

let render = () => {
  var Main = require('./components/base/Main').default;
  var base = document.getElementById('react-app');
  ReactDOM.unmountComponentAtNode(base);
  ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
      <Main/>
    </MuiThemeProvider>,
    base
  );
}
render();

if (module.hot) {
  module.hot.accept();
  module.hot.accept('./components/base/Main', () => {
    setTimeout(render);
  });
}
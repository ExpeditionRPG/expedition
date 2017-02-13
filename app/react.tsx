import * as React from 'react'
import * as ReactDOM from 'react-dom'

// So we can hot reload
declare var require: any;
declare var module: any;

// Cordova device
declare var device: any;
declare var window: any;

// For gapi login
declare var gapi: any;


// Material UI theming libs
import theme from './theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

// Needed for onTouchTap
const injectTapEventPlugin = require('react-tap-event-plugin');
try {
  injectTapEventPlugin();
} catch (e) {
  console.log('Already injected tap event plugin');
}

// Custom components
import {authSettings} from './constants'
import {toPrevious} from './actions/card'
import {silentLogin} from './actions/user'
import {getStore} from './store'

// Wait for device API libraries to load
document.addEventListener('deviceready', onDeviceReady, false);

// device APIs are available
window.platform = 'web';
function onDeviceReady() {
  var p = device.platform.toLowerCase();
  if (/android/i.test(p)) {
    window.platform = 'android';
    document.body.className += ' android';
  } else if (/iphone|ipad|ipod|ios/i.test(p)) {
    window.platform = 'ios';
    document.body.className += ' ios';
  }
  document.addEventListener('backbutton', function() {
    getStore().dispatch(toPrevious());
  }, false);
  window.plugins.insomnia.keepAwake(); // keep screen on while app is open
  // silent login here triggers for cordova plugin
  getStore().dispatch(silentLogin(function() {
    // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
    console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
  }));
}

// TODO: API Auth
gapi.load('client:auth2', function() {
  gapi.client.setApiKey(authSettings.apiKey);
  gapi.auth2.init({
    client_id: authSettings.clientId,
    scope: authSettings.scopes,
    cookie_policy: 'none',
  }).then(function() {
    // silent login here triggers for web
    getStore().dispatch(silentLogin(function() {
      // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
      console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
    }));
  });
});

// Load Firebase
if (window.FirebasePlugin) {
  window.FirebasePlugin.onTokenRefresh(function(token: string) {
    // TODO save this server-side and use it to push notifications to this device
  }, function(error: string) {
    console.error(error);
  });
} else {
  window.FirebasePlugin = {
    logEvent: function(name: string, args: any) { console.log(name, args); },
  };
}

// DOM ready
$(function() {
  // patch for Android browser not properly scrolling to input when keyboard appears
  $('body').on('focusin', 'input, textarea', function(event) {
    if (navigator.userAgent.indexOf('Android') !== -1) {
      var scroll = $(this).offset().top;
      $('.base_card').scrollTop(scroll);
    }
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

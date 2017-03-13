import * as React from 'react'
import * as ReactDOM from 'react-dom'

const PACKAGE = require('../package.json');
window.APP_VERSION = PACKAGE.version;

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
  document.addEventListener('backbutton', () => {
    getStore().dispatch(toPrevious());
  }, false);
  window.plugins.insomnia.keepAwake(); // keep screen on while app is open
  // silent login here triggers for cordova plugin
  getStore().dispatch(silentLogin(() => {
    // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
    console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
  }));
  // Hide system UI and keep it hidden (Android 4.4+ only)
  window.AndroidFullScreen.immersiveMode(() => { console.log('Immersive mode'); },
    () => { console.log('Immersive mode failed'); });
}

// TODO: API Auth
gapi.load('client:auth2', () => {
  gapi.client.setApiKey(authSettings.apiKey);
  gapi.auth2.init({
    client_id: authSettings.clientId,
    scope: authSettings.scopes,
    cookie_policy: 'none',
  }).then(() => {
    // silent login here triggers for web
    getStore().dispatch(silentLogin(() => {
      // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
      console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
    }));
  });
});

// Load Firebase - currently only works on cordova apps
// TODO once logging working on web too, don't send analytics when window.location.hostname === 'localhost'
// window.FirebasePlugin.logEvent = (name: string, args: any) => { console.log(name, args); }
if (window.FirebasePlugin) {
  window.FirebasePlugin.onTokenRefresh((token: string) => {
    // TODO save this server-side and use it to push notifications to this device
  }, (error: string) => {
    console.error(error);
  });
} else {
  window.FirebasePlugin = {
    logEvent: (name: string, args: any) => { console.log(name, args); },
  };
}

// DOM ready
$(() => {
  // patch for Android browser not properly scrolling to input when keyboard appears
  $('body').on('focusin', 'input, textarea', (event) => {
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

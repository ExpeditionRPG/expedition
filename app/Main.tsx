declare var require: any;
declare var module: any;

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import theme from './Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import {authSettings} from './Constants'
import {fetchAnnouncements} from './actions/Announcement'
import {audioPause, audioResume} from './actions/Audio'
import {toPrevious} from './actions/Card'
import {setDialog} from './actions/Dialog'
import {openSnackbar} from './actions/Snackbar'
import {silentLogin} from './actions/User'
import {handleRemotePlayEvent} from './actions/RemotePlay'
import {getStore} from './Store'
import {getAppVersion, getWindow, getGA, getDevicePlatform, getDocument, setGA, setupPolyfills} from './Globals'
import {getRemotePlayClient} from './RemotePlay'
import {UserState} from './reducers/StateTypes'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'

// Thunk is unused, but necessary to prevent compiler errors
// until types are fixed for remote play.
// TODO: Fix redux types
import thunk from 'redux-thunk'

const injectTapEventPlugin = require('react-tap-event-plugin');
const ReactGA = require('react-ga');

function setupTapEvents() {
  try {
    injectTapEventPlugin();
  } catch (e) {
    console.log('Already injected tap event plugin');
  }
}

function setupRemotePlay() {
  getRemotePlayClient().subscribe((e: RemotePlayEvent) => {
    getStore().dispatch(handleRemotePlayEvent(e));
  });
}

// TODO record modal views as users navigate: ReactGA.modalview('/about/contact-us');
// likely as a separate logView or logNavigate or something
export function logEvent(name: string, argsInput: any): void {
  const ga = getGA();
  if (ga) {
    ga.event({
      category: name,
      action: argsInput.action || '',
      label: argsInput.label || '',
      value: argsInput.value || undefined,
    });
  }

  const fbp = getWindow().FirebasePlugin;
  if (fbp) {
    const FIREBASE_MAX_NAME_LENGTH = 40;
    const FIREBASE_MAX_VALUE_LENGTH = 100;
    name = (name || '').slice(0, FIREBASE_MAX_VALUE_LENGTH);
    const args = {} as any;
    Object.keys(argsInput).forEach((key: string) => {
      args[(key || '').toString().slice(0, FIREBASE_MAX_NAME_LENGTH)] = (argsInput[key] || '').toString().slice(0, FIREBASE_MAX_VALUE_LENGTH);
    });
    fbp.logEvent(name, args);
  }
}

function setupDevice() {
  const window = getWindow();

  // Apply class-specific styling
  const platform = getDevicePlatform();
  document.body.className += ' ' + platform;

  if (platform === 'android') {

    // Hide system UI and keep it hidden (Android 4.4+ only)
    window.AndroidFullScreen.immersiveMode(() => {
      console.log('Immersive mode enabled');
    }, () => {
      console.log('Immersive mode failed');
    });

    // Patch for Android browser not properly scrolling to input when keyboard appears
    // https://stackoverflow.com/a/43502958/1332186
    if(/Android/.test(navigator.appVersion)) {
      window.addEventListener('resize', () => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
          document.activeElement.scrollIntoView();
        }
      })
    }
  }

  getDocument().addEventListener('backbutton', () => {
    getStore().dispatch(toPrevious({}));
  }, false);

  getDocument().addEventListener('pause', () => {
    getStore().dispatch(audioPause());
  }, false);

  getDocument().addEventListener('resume', () => {
    getStore().dispatch(audioResume());
  }, false);

  window.plugins.insomnia.keepAwake(); // keep screen on while app is open

  // silent login here triggers for cordova plugin
  getStore().dispatch(silentLogin({callback: (user: UserState) => { console.log(user); }}));
}

function setupEventLogging() {
  const window = getWindow();
  if (window.FirebasePlugin) { // Load Firebase - only works on cordova apps
    window.FirebasePlugin.onTokenRefresh((token: string) => {
      // TODO save this server-side and use it to push notifications to this device
    }, (error: string) => {
      console.error(error);
    });
  } else {
    window.FirebasePlugin = {
      logEvent: (name: string, args: any) => { console.info('Firebase log skipped: ', name, args); },
    };
  }
}

function setupHotReload() {
  if (module.hot) {
    module.hot.accept();
    module.hot.accept('./components/base/AppContainer', () => {
      setTimeout(() => {render();});
    });
  }
}

// disabled during local dev
declare var ga: any;
function setupGoogleAnalytics() {
  if (window.location.hostname === 'localhost') {
    setGA({
      set: (): void => null,
      event: (): void => null,
    });
    return console.log('Google Analytics disabled during local dev.');
  }
  ReactGA.initialize('UA-47408800-9', {
    titleCase: false,
    gaOptions: {
      appVersion: getAppVersion(),
      appName: getDevicePlatform(),
    },
  });
  ReactGA.pageview('/');
  setGA(ReactGA);
}

export function init() {
  const window = getWindow();
  const document = getDocument();

  // Catch and display + log all errors
  window.onerror = function(message: string, source: string, line: number) {
    const quest = getStore().getState().quest;
    if (quest && quest.details && quest.details.id) {
      message = `Quest: ${quest.details.title}. Error: ${message}.`;
    }
    const label = (source) ? `${source} line ${line}` : null;
    console.error(message, label);
    logEvent('APP_ERROR', {action: message, label});
    // Dispatch the snackbar change after resolving intermediate state.
    // Otherwise, redux handlers may perform strange actions like calling
    // setState inside of a render() cycle.
    setTimeout(() => {
      getStore().dispatch(openSnackbar('Error! Please send feedback.', message + ' Source: ' + label));
    }, 0);
    return true;
  };

  // Alert user if cookies disabled
  // Based on https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cookies.js
  try {
    document.cookie = 'cookietest=1';
    const ret = document.cookie.indexOf('cookietest=') !== -1;
    document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
    if (!ret) {
      throw 'Cookies disabled';
    }
  } catch (err) {
    setTimeout(() => {
      getStore().dispatch(openSnackbar('Please enable cookies for the app to function properly.'));
    }, 0);
  }

  // Setup as web platform as default; we might find out later we're an app
  window.platform = 'web';
  window.onpopstate = function(e) {
    getStore().dispatch(toPrevious({}));
    e.preventDefault();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      getStore().dispatch(audioPause());
    } else if (document.visibilityState === 'visible') {
      getStore().dispatch(audioResume());
    }
  }, false);

  // Only triggers on app builds
  document.addEventListener('deviceready', setupDevice, false);
  // For non-app builds
  setTimeout(() => {
    getStore().dispatch(silentLogin({callback: (user: UserState) => { console.log(user); }}));
  }, 2000);

  setupPolyfills();
  setupTapEvents();
  setupGoogleAnalytics(); // before anything else that might log in the user
  setupEventLogging();
  setupHotReload();
  setupRemotePlay();

  render();

  // Wait to process settings & dispatch additional UI until render complete
  getStore().dispatch(fetchAnnouncements());
  const settings = getStore().getState().settings;
  if (settings) {
    const contentSets = (settings || {}).contentSets;
    for (const set in contentSets) {
      if (contentSets[set] === null) {
        getStore().dispatch(setDialog('EXPANSION_SELECT'));
        break;
      }
    }
  } else {
    getStore().dispatch(setDialog('EXPANSION_SELECT'));
  }
}

function render() {
  // Require is done INSIDE this function to reload app changes.
  const AppContainer = require('./components/base/AppContainer').default;
  const base = getDocument().getElementById('react-app');
  ReactDOM.unmountComponentAtNode(base);
  ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
      <AppContainer/>
    </MuiThemeProvider>,
    base
  );
}

// doInit is defined in index.html, but not in tests.
// This lets us setup the environment before initializing, or not init at all.
declare var doInit: boolean;
if (typeof doInit !== 'undefined') {
  init();
}

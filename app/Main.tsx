declare var require: any;
declare var module: any;

// Before we even import other modules, first hook into
// console logging so we can pass details along with error reports.
import {logToBuffer} from './Console'

const logHook = function(f: Function, objects: any[]) {
  try {
    logToBuffer(objects.map((o: any) => {
      if (o === null) {
        return 'null';
      }
      if (o === undefined) {
        return 'undefined';
      }
      if (o.stack) {
        return o.toString() + '<<<' + o.stack + '>>>';
      }
      const str = o.toString();
      if (str === '[object Object]') {
        try {
          return JSON.stringify(o).substr(0, 512);
        } catch (e) {
          return '<un-stringifiable Object>';
        }
      }
      return o.toString();
    }).join(' '));
    return f(...objects);
  } catch (e) {
    f(e);
  }
};
{
  const oldLog = console.log;
  console.log = (...objs: any[]) => {return logHook(oldLog, objs);};

  const oldWarn = console.warn;
  console.warn = (...objs: any[]) => {return logHook(oldWarn, objs);};

  const oldError = console.error;
  console.error = (...objs: any[]) => {return logHook(oldError, objs);};
}

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Raven from 'raven-js'
import theme from './Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import {authSettings, NODE_ENV, UNSUPPORTED_BROWSERS} from './Constants'
import {fetchAnnouncements, setAnnouncement} from './actions/Announcement'
import {audioPause, audioResume} from './actions/Audio'
import {toPrevious} from './actions/Card'
import {setDialog} from './actions/Dialog'
import {searchAndPlay} from './actions/Search'
import {openSnackbar} from './actions/Snackbar'
import {silentLogin} from './actions/User'
import {getStore} from './Store'
import {getAppVersion, getWindow, getGA, getDevicePlatform, getDocument, getNavigator, setGA, setupPolyfills} from './Globals'
import {getRemotePlayClient} from './RemotePlay'
import {UserState} from './reducers/StateTypes'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'

// Thunk is unused, but necessary to prevent compiler errors
// until types are fixed for remote play.
// TODO: Fix redux types
import thunk from 'redux-thunk'

const injectTapEventPlugin = require('react-tap-event-plugin');
const ReactGA = require('react-ga');

Raven.config(authSettings.raven, {
    release: getAppVersion(),
    environment: NODE_ENV,
    shouldSendCallback(data) {
      return !UNSUPPORTED_BROWSERS.test(getNavigator().userAgent);
    }
  }).install();

function setupTapEvents() {
  try {
    injectTapEventPlugin();
  } catch (e) {
    console.log('Already injected tap event plugin');
  }
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
    if (window.AndroidFullScreen) {
      window.AndroidFullScreen.immersiveMode(() => {
        console.log('Immersive mode enabled');
      }, () => {
        console.error('Immersive mode failed');
      });
    } else {
      console.warn('Immersive mode not supported on this device');
    }

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

  if (window.plugins !== undefined && window.plugins.insomnia !== undefined) {
    window.plugins.insomnia.keepAwake(); // keep screen on while app is open
  } else {
    console.warn('Insomnia plugin not found');
  }

  // silent login here triggers for cordova plugin
  getStore().dispatch(silentLogin({callback: (user: UserState) => { console.log(user); }}));
}

function setupEventLogging() {
  const window = getWindow();
  if (window.FirebasePlugin !== undefined) { // Load Firebase - only works on cordova apps
    window.FirebasePlugin.onTokenRefresh((token: string) => {
      // TODO save this server-side and use it to push notifications to this device
    }, (error: string) => {
      console.error(error);
    });
  } else {
    window.FirebasePlugin = {
      onTokenRefresh: (cb: (token: string) => void) => {},
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
  if (window.location.hostname === 'localhost' || NODE_ENV === 'dev') {
    setGA({
      set: (): void => {},
      event: (): void => {},
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

// URL hashes link directly to a quest, so download it and start playing immediately
function handleUrlHash() {
  const hash = (window.location.hash || '#').substring(1);
  if (hash.length > 10) {
    getStore().dispatch(searchAndPlay(hash));
  }
}

export function init() {
  const window = getWindow();
  const document = getDocument();

  // Catch and display + log all errors
  Raven.context(() => {
    window.onerror = function(message: string, source: string, line: number) {
      const state = getStore().getState();
      const quest = state.quest || {};
      const questNode = quest.node && quest.node.elem && quest.node.elem[0];
      Raven.setExtraContext({
        card: state.card.key,
        questName: quest.details.title,
        questId: quest.details.id,
        questCardTitle: (questNode) ? questNode.attribs.title : '',
        questLine: (questNode) ? questNode.attribs['data-line'] : '',
        settings: JSON.stringify(state.settings),
      });
      Raven.captureException(new Error(message));
      if (quest.details.id) {
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
    handleUrlHash();

    render();

    // Wait to process settings & dispatch additional UI until render complete
    if (UNSUPPORTED_BROWSERS.test(getNavigator().userAgent)) {
      getStore().dispatch(setAnnouncement(true, 'Unknown browser. Please use a standard browser like Chrome or Firefox for the best experience.'));
    } else {
      getStore().dispatch(fetchAnnouncements());
    }
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
  });
}

function render() {
  // Require is done INSIDE this function to reload app changes.
  const AppContainer = require('./components/base/AppContainer').default;
  const base = getDocument().getElementById('react-app');
  if (!base) {
    throw new Error('Could not find react-app element');
  }
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

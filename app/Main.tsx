declare var require: any;
declare var module: any;

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import theme from './Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {authSettings} from './Constants'
import {fetchAnnouncements} from './actions/Announcement'
import {toPrevious} from './actions/Card'
import {setDialog} from './actions/Dialog'
import {openSnackbar} from './actions/Snackbar'
import {silentLogin} from './actions/User'
import {handleRemotePlayEvent} from './actions/RemotePlay'
import {getStore} from './Store'
import {getWindow, getGapi, getGA, getDevicePlatform, getDocument, setGA, setupPolyfills} from './Globals'
import {getRemotePlayClient} from './RemotePlay'
import {RemotePlayEvent} from 'expedition-qdl/lib/remote/Events'


const injectTapEventPlugin = require('react-tap-event-plugin');

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

export function logEvent(name: string, args: any): void {
  const fbp = getWindow().FirebasePlugin;
  if (fbp) {
    fbp.logEvent(name, args);
  }

  const ga = getGA();
  if (ga) {
    ga('send', 'event', name, args.action || '', args.label || '', args.value || null);
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
    getStore().dispatch(toPrevious());
  }, false);

  window.plugins.insomnia.keepAwake(); // keep screen on while app is open

  // silent login here triggers for cordova plugin, if gapi is loaded
  const gapi = getGapi();
  if (!gapi) {
    return;
  }
  getStore().dispatch(silentLogin({callback: () => {
    // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
    console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
  }}));
}

function setupGoogleAPIs() {
  const gapi = getGapi();
  if (!gapi) {
    return;
  }

  gapi.load('client:auth2', () => {
    gapi.client.setApiKey(authSettings.apiKey);
    gapi.auth2.init({
      client_id: authSettings.clientId,
      scope: authSettings.scopes,
      cookie_policy: 'none',
    }).then(() => {
      // silent login here triggers for web
      getStore().dispatch(silentLogin({callback: () => {
        // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
        console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
      }}));
    });
  });
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
      logEvent: (name: string, args: any) => { console.log(name, args); },
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

declare var ga: any;
function setupGoogleAnalytics() {
  const window = getWindow();
  const document = getDocument();
  // Enable Google Analytics if we're not dev'ing locally
  if (window.location.hostname === 'localhost') {
    return;
  }

  (function(i: any,s: any,o: any,g: any,r: any,a: any,m: any){
    i['GoogleAnalyticsObject']=r;
    i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)
    },
    i[r].l=1*(new Date() as any);
    a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];
    a.async=1;
    a.src=g;
    m.parentNode.insertBefore(a,m);
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga',null, null);

  if (typeof ga === 'undefined') {
    console.log('Could not load GA');
    return;
  }
  setGA(ga);
  ga('create', 'UA-47408800-9', 'auto');
  ga('send', 'pageview');
}

export function init() {
  const window = getWindow();

  // Catch and display + log all errors
  window.onerror = function(message: string, source: string, line: number) {
    const quest = getStore().getState().quest;
    if (quest && quest.details && quest.details.id) {
      message = `Quest: ${quest.details.id} - ${quest.details.title}. Error: ${message}`;
    }
    const label = (source) ? `${source} line ${line}` : null;
    console.error(message, label);
    logEvent('APP_ERROR', {action: message, label});
    getStore().dispatch(openSnackbar('Error! Please send feedback.'));
    return true;
  };

  // Setup as web platform as default; we might find out later we're an app
  window.platform = 'web';
  window.onpopstate = function(e) {
    getStore().dispatch(toPrevious());
    e.preventDefault();
  };

  // Only triggers on app builds
  getDocument().addEventListener('deviceready', () => {
    setupDevice();
  }, false);

  setupPolyfills();

  setupTapEvents();
  setupGoogleAPIs();
  setupEventLogging();
  setupHotReload();
  setupGoogleAnalytics();
  setupRemotePlay();
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

  render();
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

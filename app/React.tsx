declare var require: any;
declare var module: any;
declare var device: any;
declare var gapi: any;
declare var ga: any;

export interface Document {
  body: {className: string};
  addEventListener: (e: string, f: ()=>any, useCapture?: boolean) => void;
  getElementById: (id: string) => Element;
}

export interface ReactWindow extends Window {
  platform?: string;
  APP_VERSION?: string;
  AndroidFullScreen?: {
    immersiveMode: (success: () => any, failure: () => any) => void,
  };
  FirebasePlugin?: {
    onTokenRefresh?: (success: (token: string) => any, failure: (error: string) => any) => void,
    logEvent: (name: string, args: any) => any,
  };
  plugins?: {
    insomnia: {keepAwake: ()=>void},
  };
  test?: boolean;
  device?: {platform: string};
}
declare var window: ReactWindow;

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import theme from './Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {authSettings} from './Constants'
import {toPrevious} from './actions/Card'
import {silentLogin} from './actions/User'
import {getStore} from './Store'

const PACKAGE = require('../package.json');
const injectTapEventPlugin = require('react-tap-event-plugin');

export function getAppVersion(): string {
  return PACKAGE.version;
}

export function setWindowPropertyForTest(prop: string, val: any): void {
  (window as any)[prop] = val;
}

function setupTapEvents() {
  try {
    injectTapEventPlugin();
  } catch (e) {
    console.log('Already injected tap event plugin');
  }
}

export function getDevicePlatform(): 'android' | 'ios' | 'web' {
  if (window.device === undefined) {
    return 'web';
  }

  var p = (device.platform || '').toLowerCase();
  if (/android/i.test(p)) {
    return 'android';
  } else if (/iphone|ipad|ipod|ios/i.test(p)) {
    return 'ios';
  } else {
    return 'web';
  }
}

export function logEvent(name: string, args: any): void {
  window.FirebasePlugin.logEvent(name, args);

  if (typeof ga !== 'undefined') {
    ga('send', 'event', name);
  }
}

function setupDevice(window: ReactWindow, device: any) {
  // This is used to mutate device properties for tests
  window.device = device;

  var platform = getDevicePlatform();

  window.platform = platform; // TODO: remove this and have everyone use getPlatform().
  document.body.className += ' ' + platform;

  if (platform === 'android') {

    // Hide system UI and keep it hidden (Android 4.4+ only)
    window.AndroidFullScreen.immersiveMode(() => {
      console.log('Immersive mode enabled');
    }, () => {
      console.log('Immersive mode failed');
    });

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
}

function setupGoogleAPIs(gapi: any) {
  if (typeof gapi === 'undefined') {
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
      getStore().dispatch(silentLogin(() => {
        // TODO have silentLogin return if successful or not, since will vary btwn cordova and web
        console.log('Silent login: ', gapi.auth2.getAuthInstance().isSignedIn);
      }));
    });
  });
}

function setupEventLogging(window: ReactWindow) {
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

function render(document: Document) {
  // Require is done INSIDE this function to reload app changes.
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

function setupHotReload(document: Document) {
  if (module.hot) {
    module.hot.accept();
    module.hot.accept('./components/base/Main', () => {
      setTimeout(() => {render(document);});
    });
  }
}

function setupGoogleAnalytics(window: ReactWindow, document: Document) {
  // Enable Google Analytics if we're on the web & not dev'ing locally
  // And monkeypatch it into exisitng Firebase event for a consistent API for rest of code

  //if (window.platform === 'web') { //&& window.location.hostname !== 'localhost') {
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

  ga('create', 'UA-47408800-9', 'auto');
  ga('send', 'pageview');
}

export function init(window: ReactWindow, document: Document, gapi: any) {
  // TODO: remove these and have everyone use getPlatform()/getVersion().
  window.platform = 'web';
  window.APP_VERSION = getAppVersion();

  document.addEventListener('deviceready', () => {
    setupDevice(window, device);
  }, false);

  setupTapEvents();
  setupGoogleAPIs(gapi);
  setupEventLogging(window);
  setupHotReload(document);
  setupGoogleAnalytics(window, document);

  render(document);
}

if (require.main === module) {
  console.log('Starting as main');
  init(window, document, gapi);
}

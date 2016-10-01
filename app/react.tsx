/// <reference path="../typings/redux/redux.d.ts" />
/// <reference path="../typings/redux-thunk/redux-thunk.d.ts" />
/// <reference path="../typings/react-redux/react-redux.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
/// <reference path="../typings/material-ui/material-ui.d.ts" />
/// <reference path="../typings/react-tap-event-plugin/react-tap-event-plugin.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/es6-shim/es6-shim.d.ts" />

/// <reference path="../typings/custom/require.d.ts" />

// TODO: Investigate removing tests from the compilation path
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/expect/expect.d.ts" />

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// So we can hot reload
declare var require: any;
declare var module: any;

// For dev tools extension
declare var window:any;

// Cordova device
declare var device: any;

// Material UI theming libs
import theme from './theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Needed for onTouchTap
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

// Redux libraries
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

// Custom components
import Main from './components/base/Main';
import expeditionApp from './reducers/CombinedReducers';

let devtools: any = window['devToolsExtension'] ? window['devToolsExtension']() : (f:any)=>f;
let middleware = applyMiddleware(thunk);
const store: any = middleware(devtools(createStore))(expeditionApp, {});
console.log(store);

// Wait for device API libraries to load
//
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
}

// TODO: API Auth

/*
if (module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () => {
    console.log("Updating reducers");
    let updated = require('./reducers/CombinedReducers');
    console.log(updated)
    store.replaceReducer(updated);
  });
}
*/

//<ExpeditionCard title="Test Card">Hello World</ExpeditionCard>

// Render the components, picking up where react left off on the server
ReactDOM.render(
  <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
    <Provider store={store}>
        <Main store={store}/>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);


/*
(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  var app = document.querySelector('#app');
  // TODO: Capture "Home" click.
  app.ready = function() {
    this.lastRoute = [];
    this.isWeb = (typeof device === 'undefined');
    this.isAndroid = (/android/i.test(navigator.userAgent));
    this.isIos = (/iphone|ipad|ipod/i.test(navigator.userAgent));
    this.isMobile = this.isAndroid || this.isIos;
    document.addEventListener("backbutton", app.onBackKeyDown, false);

    //ExpeditionAPI._silentLoginCordova();
  };
  app.onBackKeyDown = function() {
    // This is neither elegant nor efficient, but it works well. When native
    // back button is pressed, loop through all expedition-card elements and
    // manually trigger a "return" event from the first expedition-card found
    // that's "visible".

    // Using querySelectorAll globally like this doesn't work on mobile (returns empty list)
    // but it works just fine on Android, which is the only time this code will be called.
    var cards = document.querySelectorAll("expedition-card, #splash");
    for (var i = 0; i < cards.length; i++) {
      var style = getComputedStyle(cards[i]);
      var isVisible = (style.display !== 'none' && style.visibility !== 'hidden' &&
        style.opacity !== 0 && (cards[i].offsetWidth !== 0 || cards[i].offsetHeight !== 0));

      if (isVisible) {
        // If we hit back on the splash screen, close the app.
        if (cards[i].id === "splash") {
          navigator.app.exitApp();
          return;
        }

        cards[i].fire("return");
        return;
      }
    }
  };
  app.getcards = function() {
    if (window.platform === 'android' || window.platform === 'ios') {
      window.open('http://expeditionrpg.com/', '_system');
    } else {
      window.location='http://cards.expeditiongame.com/';
    }
  };
  app.next = function(e) {
    this.$.pages.next(e.currentTarget.dataset.target, e.currentTarget.dataset.anim);
  };
  app.showSelect = function(e) {
    this.$.pages.prev("_select");
    e.stopPropagation();
  };
  app.showSplash = function(e) {
    this.$.pages.prev("splash");
    e.stopPropagation();
  };
  app.showSetup = function(e) {
    this.$.pages.prev("setup");
    e.stopPropagation();
  };
  app.onPublicQuestChoice = function(e, detail) {
    this._loadQuest(JSON.parse(detail));
    e.stopPropagation();
  };
  app.onFeaturedQuestChoice = function(e) {
    this._loadQuest({
      xml_url: e.currentTarget.dataset.url
    });
    e.stopPropagation();
  };
  app.onQuestURLLoad = function(e, detail) {
    this._loadQuest({
      xml_url: detail
    });
  };
  app._loadQuest = function(quest) {
    console.log("Loading quest");
    this.quest = quest;
    this.$.pages.next("quest");
    this.$.globalQuest.ready();
  };
  app.onQuestFileLoad = function(e, detail) {
    console.log("File load");
    this.$.pages.next("quest");
    this.$.globalQuest.ready(detail);
    e.stopPropagation();
  };
})(document);
*/
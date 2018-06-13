import * as React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {silentLogin, setProfileMeta} from './actions/User'
import {queryView} from './actions/View'
import {setSnackbar} from './actions/Snackbar'
import MainContainer from './components/MainContainer'
import {store} from './Store'
import {VERSION} from './Constants'
import {UserState} from './reducers/StateTypes'

// Material UI theming
import theme from './Theme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

// For hot reload
declare var require: any;
declare var module: any;

// For dev tools extension
declare var window:any;

// For URL parsing
declare var unescape: any;

window.onerror = (message: string, source: string, line: number) => {
  console.error(message, source, line);
  store.dispatch(setSnackbar(true, 'Error! ' + message));
  return true; // prevents the firing of the default event handler
};

// Needed for onTouchTap
const injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

const ReactGA = require('react-ga') as any;
ReactGA.initialize('UA-47408800-7');

// Pass credentials to API server despite cross-origin
$.ajaxSetup({
  xhrFields: {
    withCredentials: true
  }
});

// Try silently logging in
window.gapi.load('client,drive-realtime,drive-share', () => {
  store.dispatch(silentLogin((user: UserState) => {
    store.dispatch(setProfileMeta(user));
    store.dispatch(queryView('USERS'));
    store.dispatch(queryView('QUESTS'));
    store.dispatch(queryView('FEEDBACK'));
  }));
});

// alert user if they try to close the page with unsaved changes
window.onbeforeunload = function () {
  if (store.getState().dirty === true) {
    return false;
  }
  return null;
}

// override app analytics - don't report while dev'ing
window.FirebasePlugin = {
  logEvent: console.log,
};


render(
  <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
    <Provider store={store}>
      <MainContainer></MainContainer>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);

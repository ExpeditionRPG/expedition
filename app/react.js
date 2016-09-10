import React from 'react';
import ReactDOM from 'react-dom';

// Material UI theming libs
import theme from './components/theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Redux libraries
import thunkMiddleware from 'redux-thunk';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';

// Custom components
import QuestAppBarContainer from './components/QuestAppBarContainer';
import QuestListContainer from './components/QuestListContainer';
import QuestIDEContainer from './components/QuestIDEContainer';
import DialogsContainer from './components/DialogsContainer';
import { questIDEApp } from './reducers/CombinedReducers';

// Initialize the global redux store
var initialState = document.getElementById("initial-state");
console.log(initialState);
let auth = (initialState) ? JSON.parse(initialState.textContent) : {};
let store = createStore(questIDEApp, {
    user: {
      profile: auth.profile,
      login: auth.login,
      logout: auth.logout
    }
  },
  compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

if (module.hot) {
  module.hot.accept('./reducers/CombinedReducers', () =>
    store.replaceReducer(require('./reducers/CombinedReducers')/*.default if you use Babel 6+ */)
  );
}

// Render the components, picking up where react left off on the server
ReactDOM.render(
  <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
    <Provider store={store}>
      <div style={{width: "100%", height: "100%"}}>
        <QuestAppBarContainer />
        <QuestIDEContainer />
        <QuestListContainer />
        <DialogsContainer />
      </div>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);
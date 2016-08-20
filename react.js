import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import QuestIDE from './components/QuestIDE';

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Snag the initial state that was passed from the server side
var initialState = JSON.parse(document.getElementById('initial-state').innerHTML)

// Render the components, picking up where react left off on the server
ReactDOM.render(
  <MuiThemeProvider>
    <QuestIDE initial={initialState}/>
  </MuiThemeProvider>,
  document.getElementById('react-app')
);
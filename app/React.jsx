import React from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import {getStore} from './Store.jsx'
import Main from './components/Main.jsx'

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin();

const App = () => (
  <MuiThemeProvider>
    <Main />
  </MuiThemeProvider>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

getStore().dispatch({type: 'CARDS_REQUEST'});

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'

import {downloadCards} from './actions/Cards'
import {loadFiltersFromUrl} from './actions/Filters'
import MainContainer from './components/MainContainer'
import {getStore} from './Store'
import theme from './Theme'

// So we can hot reload
declare var require: any;
declare var module: any;

const store = getStore();

store.dispatch(loadFiltersFromUrl());
store.dispatch(downloadCards());

let render = () => {
  const base = document.getElementById('app');
  if (!base) {
    throw new Error('Could not find react-app element');
  }
  ReactDOM.unmountComponentAtNode(base);
  ReactDOM.render(
    <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <MainContainer />
    </MuiThemeProvider>
    </Provider>,
    base
  );
}
render();

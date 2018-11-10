declare var require: any;
declare var module: any;

import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as Redux from 'redux';

import theme from 'shared/Theme';
import {downloadCards} from './actions/Cards';
import {loadFiltersFromUrl} from './actions/Filters';
import {getStore} from './Store';

// This is necessary to prevent compiler errors until/unless we fix the rest of
// the repo to reference custom-defined action types (similar to how redux-thunk does things)
// TODO: Fix redux types
/* tslint:disable */
export type ThunkAction<R, S = {}, E = {}, A extends Redux.Action<any> = Redux.AnyAction> = (
  dispatch: Redux.Dispatch<A>,
  getState: () => S,
  extraArgument: E
) => R;
declare module 'redux' {
  export interface Dispatch<A extends Redux.Action<any> = Redux.AnyAction> {
    <R, E>(asyncAction: ThunkAction<R, {}, E, A>): R;
  }
}
/* tslint:enable */

const store = getStore();

store.dispatch(loadFiltersFromUrl());
store.dispatch(downloadCards());

// Ctrl + <hotkey>
window.addEventListener('keydown', (event: any) => {
  if (event.ctrlKey || event.metaKey) {
    switch (String.fromCharCode(event.which).toLowerCase()) {
      case 'p': // ctrl + p to print
        store.dispatch({type: 'LAYOUT_PRINTING', printing: true});
        setTimeout(() => {
          store.dispatch({type: 'LAYOUT_PRINTING', printing: false});
        }, 10000);
        return false;
      default:
        // Do nothing
        break;
    }
  }
});

const setupHotReload = () => {
  if (module.hot) {
    module.hot.accept();
    module.hot.accept('./components/Main', () => {
      setTimeout(() => {render(); });
    });
  }
};

const render = () => {
  // Require is done INSIDE this function to reload app changes.
  const MainContainer = require('./components/MainContainer').default;
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
};

setupHotReload();
render();

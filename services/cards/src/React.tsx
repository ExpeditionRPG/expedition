import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import * as Redux from 'redux';

import theme from 'shared/Theme';
import {downloadCards} from './actions/Cards';
import {loadFiltersFromUrl} from './actions/Filters';
import MainContainer from './components/MainContainer';
import {getStore} from './Store';

// So we can hot reload
declare var require: any;
declare var module: any;

// This is necessary to prevent compiler errors until/unless we fix the rest of
// the repo to reference custom-defined action types (similar to how redux-thunk does things)
// TODO: Fix redux types
export type ThunkAction<R, S = {}, E = {}, A extends Redux.Action<any> = Redux.AnyAction> = (
  dispatch: Redux.Dispatch<A>,
  getState: () => S,
  extraArgument: E
) => R;
declare module 'redux' {
  export type Dispatch<A extends Redux.Action<any> = Redux.AnyAction> = <R, E>(asyncAction: ThunkAction<R, {}, E, A>) => R;
}

const store = getStore();

store.dispatch(loadFiltersFromUrl());
store.dispatch(downloadCards());

const render = () => {
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
render();

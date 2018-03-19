import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'

import DialogsContainer from './DialogsContainer'
import SplashContainer from './SplashContainer'
import TopBarContainer from './TopBarContainer'
import {SnackbarState} from '../reducers/StateTypes'

export interface MainStateProps {
  loggedIn: boolean;
  snackbar: SnackbarState;
};

export interface MainDispatchProps {
  onSnackbarClose: () => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.loggedIn === false) {
    return (
      <SplashContainer/>
    );
  }

  return (
    <div className="main">
      <TopBarContainer/>
      <DialogsContainer/>
      <div className="contents">
        TODO contents here
      </div>
      <Snackbar
        className="editor_snackbar"
        open={props.snackbar.open}
        message={props.snackbar.message || ''}
        action={props.snackbar.actionLabel}
        autoHideDuration={(props.snackbar.persist) ? undefined : 4000}
        onActionTouchTap={props.snackbar.action}
        onRequestClose={props.onSnackbarClose}
      />
    </div>
  );
}

export default Main;

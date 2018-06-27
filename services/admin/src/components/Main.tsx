import * as React from 'react'
import Snackbar from '@material-ui/core/Snackbar'
import Drawer from '@material-ui/core/Drawer'
import MenuItem from '@material-ui/core/MenuItem'
import DialogsContainer from './DialogsContainer'
import SplashContainer from './SplashContainer'
import TopBarContainer from './TopBarContainer'
import FeedbackViewContainer from './views/FeedbackViewContainer'
import QuestsViewContainer from './views/QuestsViewContainer'
import UsersViewContainer from './views/UsersViewContainer'
import {SnackbarState, ViewType} from '../reducers/StateTypes'

export interface MainStateProps {
  loggedIn: boolean;
  snackbar: SnackbarState;
  view: ViewType;
};

export interface MainDispatchProps {
  onSnackbarClose: () => void;
  onViewChange: (view: ViewType) => void;
}

interface MainProps extends MainStateProps, MainDispatchProps {}

const Main = (props: MainProps): JSX.Element => {
  if (props.loggedIn === false) {
    return (
      <SplashContainer/>
    );
  }

  let view: JSX.Element;
  switch(props.view) {
    case 'USERS':
      view = <UsersViewContainer/>;
      break;
    case 'QUESTS':
      view = <QuestsViewContainer/>;
      break;
    case 'FEEDBACK':
      view = <FeedbackViewContainer/>;
      break;
    default:
      throw new Error('Unimplemented view ' + props.view);
  }

  return (
    <div className="main">
      <TopBarContainer/>
      <DialogsContainer/>
      <Drawer variant="permanent">
        <MenuItem onClick={() => props.onViewChange('USERS')}>Users</MenuItem>
        <MenuItem onClick={() => props.onViewChange('QUESTS')}>Quests</MenuItem>
        <MenuItem onClick={() => props.onViewChange('FEEDBACK')}>Feedback</MenuItem>
      </Drawer>
      <div className="contents">
        {view}
      </div>
      <Snackbar
        className="editor_snackbar"
        open={props.snackbar.open}
        message={props.snackbar.message}
        action={props.snackbar.actions}
        autoHideDuration={(props.snackbar.persist) ? undefined : 4000}
        onClose={props.onSnackbarClose}
      />
    </div>
  );
}

export default Main;

import * as React from 'react'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
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
  drawer: boolean;
  view: ViewType;
};

export interface MainDispatchProps {
  onSnackbarClose: () => void;
  onDrawerClose: () => void;
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
      <Drawer open={props.drawer} docked={false} onRequestChange={(open) => props.onDrawerClose()}>
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
        message={props.snackbar.message || ''}
        action={props.snackbar.actionLabel}
        autoHideDuration={(props.snackbar.persist) ? undefined : 4000}
        onActionClick={props.snackbar.action}
        onRequestClose={props.onSnackbarClose}
      />
    </div>
  );
}

export default Main;

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import {UserState} from '../reducers/StateTypes';

export interface StateProps {
  user: UserState;
}

export interface DispatchProps {
  onLogin: (position: string) => void;
}

interface Props extends StateProps, DispatchProps {}

const Splash = (props: Props): JSX.Element => {
  return (
    <div className="main splash">
      <div className="splash_app_bar">
        <AppBar>
          <Toolbar>
            <Typography variant="title">
              Expedition Admin Dashboard
            </Typography>
            <div>
              {props.user.loggedIn && <div className="login">
                <span className="email">{props.user.email}</span>
              </div>}
              {!props.user.loggedIn && <div className="login">
                <Button onClick={() => props.onLogin('appbar')}>Log In</Button>
              </div>}
            </div>
          </Toolbar>
        </AppBar>
      </div>
      <div className="body">
        TODO: Splash Page
      </div>
    </div>
  );
};

export default Splash;

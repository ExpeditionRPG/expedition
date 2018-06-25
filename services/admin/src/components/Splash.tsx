import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

export interface SplashDispatchProps {
  onLogin: (position: string) => void;
}

const Splash = (props: any): JSX.Element => {
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
                <a href="https://expeditiongame.com/loot" target="_blank" className="lootPoints">
                  {props.user.lootPoints} <img className="inline_icon" src="images/loot_white_small.svg" />
                </a>
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

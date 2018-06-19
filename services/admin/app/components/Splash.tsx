import * as React from 'react'

import loginUser from '../actions/User'
import {UserState} from '../reducers/StateTypes'

import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'

export interface SplashDispatchProps {
  onLogin: (position: string) => void;
}

const Splash = (props: any): JSX.Element => {
  return (
    <div className="main splash">
      <div className="splash_app_bar">
        <AppBar
          title="Expedition Admin Dashboard"
          showMenuIconButton={false}
          iconElementRight={
            <div className="appBarRight">
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
          }
        />
      </div>
      <div className="body">
        TODO: Splash Page
      </div>
    </div>
  );
};

export default Splash;

import * as React from 'react'

import loginUser from '../actions/User'
import {UserState} from '../reducers/StateTypes'

import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'

export interface SplashDispatchProps {
  onLogin: (position: string) => void;
}

const Splash = (props: any): JSX.Element => {
  return (
    <div className="main splash">
      <div className="splash_app_bar">
        <AppBar
          title="Expedition Quest Creator"
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
                <FlatButton
                  label="Log In"
                  onTouchTap={() => props.onLogin('appbar')}
                />
              </div>}
            </div>
          }
        />
      </div>
      <div className="body">
        Splash page!
      </div>
    </div>
  );
};

export default Splash;

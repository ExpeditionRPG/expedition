import * as React from 'react'

import loginUser from '../actions/user'
import {UserState} from '../reducers/StateTypes'

import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'


export interface SplashDispatchProps {
  onLogin: (user: UserState)=>void;
}

const Splash = (props: any): JSX.Element => {
  return (
    <div className="splash">
      <AppBar
        title="Expedition Quest Creator"
        showMenuIconButton={false}
        iconElementRight={
          <FlatButton
            label="Log In"
            onTouchTap={() => props.onLogin()}
          />
        }
      />
      <div className="body">
        <h1>Write your adventure and share it with the world</h1>
        <RaisedButton
          label="Get Started"
          primary={true}
          onTouchTap={() => props.onLogin()}
        />
        <div className="learnMore">
          <a href="https://github.com/Fabricate-IO/expedition-quest-ide/blob/master/docs/markdown_guide.md" target="_blank">
            learn more
          </a>
        </div>
        <iframe
          className="previewVideo"
          src="https://www.youtube.com/embed/12y1NhQUXvs?autoplay=1&fs=0&loop=1&modestbranding=1&playlist=12y1NhQUXvs"
          frameborder="0">
        </iframe>
      </div>
    </div>
  );
};

export default Splash;

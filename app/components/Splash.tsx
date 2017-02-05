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
      <div className="quest_app_bar">
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
      </div>
      <div className="body">
        <iframe
          className="previewVideo"
          src="https://www.youtube.com/embed/12y1NhQUXvs?autoplay=1&fs=0&loop=1&modestbranding=1&playlist=12y1NhQUXvs"
          frameborder="0">
        </iframe>
        <h1>Write your adventure and share it with the world!</h1>
        <RaisedButton
          label="Get Started"
          primary={true}
          onTouchTap={() => props.onLogin()}
        />
        <RaisedButton 
          label="Learn More" 
          primary={true} 
          onTouchTap={() => {window.open("https://github.com/Fabricate-IO/expedition-quest-creator/blob/master/docs/index.md");}} 
        />
        
      </div>
    </div>
  );
};

export default Splash;

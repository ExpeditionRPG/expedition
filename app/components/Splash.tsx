import * as React from 'react'

import loginUser from '../actions/user'
import {UserState} from '../reducers/StateTypes'

import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import Button from 'expedition-app/app/components/base/Button'


export interface SplashDispatchProps {
  onLogin: (user: UserState)=>void;
}

const Splash = (props: any): JSX.Element => {
  return (
    <div className="main splash">
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
        <div>
          <h1><span>Share your <strong>Story</strong></span> <span>with the <strong>World</strong>.</span></h1>
          <div className="worldMap">
            <img alt="Countries with Expedition adventurers - Jan-April 2017" src="/assets/img/worldmap.png"></img>
          </div>
          <div className="imageText">Countries with Expedition adventurers - Jan-April 2017</div>
          <h3>
            <span>The Quest Creator lets you</span> <span>write adventures for <a target="_blank" rel="nofollow" href="https://expeditiongame.com">Expedition</a>.</span>
          </h3>
          <div className="buttonBox">
            <Button onTouchTap={() => props.onLogin()}>
              Get Started
            </Button>
          </div>
        </div>
        <div>
          <h1>Built for <strong>Authors</strong></h1>
          <h3>
            <span>Everything you need to write, test,</span> <span>and publish your own quest.</span>
          </h3>
          <div className="showcase">
            <div>
              <iframe
                className="previewVideo"
                src="https://www.youtube.com/embed/12y1NhQUXvs?autoplay=1&fs=0&loop=1&modestbranding=1&playlist=12y1NhQUXvs">
              </iframe>
            </div>
            <div>
              <p>
                Our quest writing environment stays out of the way when you're in the zone, but still has a rich set
                of features to help you from concept to epic story.
              </p>
              <h3>Highlights:</h3>
              <ul>
                <li>Syntax checking</li>
                <li>Google Drive integration</li>
                <li>In-browser preview</li>
                <li>Single-click publish</li>
                <li>Extensive <a target="_blank" rel="nofollow" href="https://github.com/ExpeditionRPG/expedition-quest-creator/blob/master/docs/index.md">documentation</a></li>
                <li>Fully <a target="_blank" rel="nofollow" href="https://github.com/expeditionrpg/expedition-quest-creator">open-source</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h1><span>As complex as</span> <span><strong>You</strong> make it</span></h1>
          <h3>
            <span>A language designed</span> <span>for accessibility and power.</span>
          </h3>

          <div className="showcase">
            <div><img src="assets/img/code_example.png"></img></div>
            <div>
              <p>
                If you've never written code before, you don't have to.
              </p>
              <p>
                If you're a veteran programmer,
                you can use integrated <a target="_blank" rel="nofollow" href="https://mathjs.org">MathJS</a> to weave intricate storylines.
              </p>
              <h3>Features:</h3>
              <ul>
                <li>Simple, <a href="https://daringfireball.net/projects/markdown/syntax">Markdown</a>-inspired syntax</li>
                <li>Branching choices</li>
                <li>Jump to parts of your story</li>
                <li>Templates for repetitive actions</li>
                <li>Variables &amp; programmatic text</li>
                <li>Contextual Showing/hiding of user actions</li>
              </ul>
            </div>
          </div>

          <div className="buttonBox">
            <Button onTouchTap={() => props.onLogin()}>
              Get Started
            </Button>
            <Button onTouchTap={() => {window.location.href='http://expeditiongame.com';}}>
              Expedition Home Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;

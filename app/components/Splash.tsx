import * as React from 'react'

import loginUser from '../actions/User'
import {UserState} from '../reducers/StateTypes'

import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import Button from 'expedition-app/app/components/base/Button'


export interface SplashDispatchProps {
  onLogin: (position: string) => void;
}

const Splash = (props: any): JSX.Element => {
  return (
    <div className="main splash">
      <div className="quest_app_bar">
        <AppBar
          title="Expedition Quest Creator"
          showMenuIconButton={false}
          iconElementRight={
            <div className="login">
              <FlatButton
                label="Log In"
                onTouchTap={() => props.onLogin('appbar')}
              />
            </div>
          }
        />
      </div>
      <div className="body">
        <div>
          <h1><span>Share your <strong>Stories</strong></span> <span>with the <strong>World</strong></span></h1>
          <div className="worldMap">
            <img alt="Countries with Expedition adventurers - Jan-April 2017" src="/assets/img/worldmap.png"></img>
          </div>
          <div className="imageText">Countries with Expedition adventurers - Jan-April 2017</div>
          <h3>Write adventures for <a target="_blank" href="https://expeditiongame.com">Expedition: The Roleplaying Card Game</a></h3>
          <h3>Build a following of thousands of gamers across the globe</h3>
          <h3>Earn tips and donations from your followers</h3>
          <div className="buttonBox login">
            <Button onTouchTap={() => props.onLogin('main')}>Get Started</Button>
          </div>
          <h3 className="mobileOnly">
            <strong>Visit this page on a desktop browser to get started.</strong>
          </h3>
        </div>
        <div>
          <h1>Built for <strong>Authors</strong></h1>
          <h3>
            <span>Everything you need to write, test,</span> <span>and publish your own quests.</span>
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
                The quest creator only takes a few minutes to learn, yet has powerful tools to help you build epic, interactive adventures.
              </p>
              <h3>Highlights:</h3>
              <ul>
                <li>Syntax checking</li>
                <li>Google Drive integration</li>
                <li>Collaborate editing</li>
                <li>In-browser preview</li>
                <li>Single-click publish</li>
                <li>Extensive <a target="_blank" rel="nofollow" href="https://github.com/ExpeditionRPG/expedition-quest-creator/blob/master/docs/index.md">documentation</a></li>
                <li>Fully <a target="_blank" rel="nofollow" href="https://github.com/expeditionrpg/expedition-quest-creator">open-source</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div>
          <h1><span>Interactive storytelling</span> <span>for <strong>everyone</strong></span></h1>
          <h3>
            <span>Join the bleeding edge of storytelling,</span> <span>no experience required.</span>
          </h3>

          <div className="showcase">
            <div><img src="assets/img/code_example.png"></img></div>
            <div>
              <p>
                If you've never written code before, you don't have to.
              </p>
              <p>
                If you're a veteran programmer,
                you can use integrated <a target="_blank" rel="nofollow" href="https://mathjs.org">MathJS</a> to weave intricate storylines and puzzles.
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

          <div className="buttonBox login">
            <Button onTouchTap={() => props.onLogin('bottom')}>
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

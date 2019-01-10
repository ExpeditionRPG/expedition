import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ExpeditionButton from 'app/components/base/Button';
import * as React from 'react';
import {UserState} from 'shared/auth/UserState';
import {AnnouncementState} from '../reducers/StateTypes';

export interface StateProps {
  announcement: AnnouncementState;
  user: UserState;
}

export interface DispatchProps {
  onLinkTap: (link: string) => void;
  onLogin: (position: string) => void;
  onNewQuest: (user: UserState) => void;
}

interface Props extends StateProps, DispatchProps {}

const Splash = (props: Props): JSX.Element => {
  const announcementVisible = (props.announcement && props.announcement.open && props.announcement.message !== '');

  return (
    <div className="main splash">
      <AppBar className="splash_app_bar">
        {announcementVisible &&
          <Toolbar className="announcement_bar">
            <Button className="announcement" onClick={() => props.onLinkTap(props.announcement.link)}>
              {props.announcement.message} {props.announcement.link && <img className="inline_icon" src="/images/new_window_white.svg" />}
            </Button>
          </Toolbar>
        }
        <Toolbar>
          <Typography variant="title">
            Expedition Quest Creator
          </Typography>
          {props.user.loggedIn && <div className="login">
            <a href="https://expeditiongame.com/loot" target="_blank" className="lootPoints">
              {props.user.lootPoints} <img className="inline_icon" src="images/loot_white_small.svg" />
            </a>
            <span className="email">{props.user.email}</span>
            <Button onClick={() => props.onNewQuest(props.user)}>New Quest</Button>
          </div>}
          {!props.user.loggedIn && <div className="login">
            <Button onClick={() => props.onLogin('appbar')}>Log In</Button>
          </div>}
        </Toolbar>
      </AppBar>
      <div className={`body ${announcementVisible && 'announcing'}`}>
        <div>
          <h1><span>Share your <strong>Stories</strong></span> <span>with the <strong>World</strong></span></h1>
          <div className="worldMap">
            <img alt="Countries with Expedition adventurers - Jan-April 2017" src="/images/worldmap.png"></img>
          </div>
          <div className="imageText">Adventurers waiting for your next story</div>
          <h3>Build an international fanbase</h3>
          <h3>Write on the bleeding edge of interactive storytelling</h3>
          <h3>Earn money through <a target="_blank" href="https://expeditiongame.com/writing-contests">monthly writing contests</a></h3>
          <div className="buttonBox login">
            <ExpeditionButton onClick={() => props.user.loggedIn ? props.onNewQuest(props.user) : props.onLogin('main')}>Get Started</ExpeditionButton>
          </div>
          <p>Learn more about <a target="_blank" href="https://expeditiongame.com">Expedition: The Roleplaying Card Game</a></p>

          <div className="mobileOnly alert">
            <h3>Looks like you're on mobile! Visit this page on a desktop browser to get started: <strong><a href="https://Quests.ExpeditionGame.com">Quests.ExpeditionGame.com</a></strong></h3>
          </div>
        </div>

        <div>
          <h1>Built for <strong>Authors</strong></h1>
          <h3>
            <span>Everything you need to write</span> <span>and publish your own quests.</span>
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
                <li>Extensive <a target="_blank" rel="nofollow" href="https://github.com/ExpeditionRPG/expedition/blob/master/services/quest-creator/docs/index.md">documentation</a></li>
                <li>Fully <a target="_blank" rel="nofollow" href="https://github.com/expeditionRPG/expedition">open-source</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h1><span>Interactive storytelling</span> <span>for <strong>everyone</strong></span></h1>
          <h3>Join the bleeding edge of storytelling technology, no experience required.</h3>

          <div className="showcase">
            <div><img src="/images/code_example.png"></img></div>
            <div>
              <p>
                If you've never written code before, you don't have to.
              </p>
              <p>
                If you're a veteran programmer,
                you can use integrated <a target="_blank" rel="nofollow" href="https://mathjs.org">MathJS</a>
                to weave intricate storylines and puzzles.
              </p>
              <h3>Features:</h3>
              <ul>
                <li>Simple, <a href="https://daringfireball.net/projects/markdown/syntax">Markdown</a>-inspired syntax</li>
                <li>Branching choices</li>
                <li>Jump to parts of your story</li>
                <li>Templates for repetitive actions</li>
                <li>Variables &amp; programmatic text</li>
                <li>Contextual showing/hiding of user actions</li>
              </ul>
            </div>
          </div>

          <div className="buttonBox login">
            <ExpeditionButton onClick={() => props.onLogin('bottom')}>
              Get Started
            </ExpeditionButton>
            <ExpeditionButton onClick={() => {window.location.href = 'http://expeditiongame.com'; }}>
              Expedition Home Page
            </ExpeditionButton>
          </div>
        </div>

        <div>
          <h1>Frequently Asked Questions</h1>
          <h4>Will I still own my work?</h4>
          <p>
            <strong>YES!</strong> By publishing your quest on the Expedition Quest Creator, you agree
            to grant Fabricate, LLC a non-exclusive, royalty-free, worldwide, perpetual license to your work
            for the purposes of board and video gaming. But, you still own the core intellectual property
            and can use it however you see fit. In fact, we encourage you to port your Expedition quests
            to other mediums to capitalize on the fanbase you'll build here!
          </p>
          <h4>Can I write in any genre?</h4>
          <p>
            <strong>YES!</strong> You can select the genre and age level of your quest before publishing,
            so you can publishing anything from a kid-friendly comedy to an adults-only murder mystery.
            Note that we reserve the right to remove offensive and pornographic material, and provide tools
            to users to report quests that violate our community and quality standards.
          </p>

          <footer>
            <p>© 2015-2017 Fabricate, LLC. Powered by <a target="_blank" href="https://expeditiongame.com">Expedition: The Tabletop Roleplaying Game</a></p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Splash;

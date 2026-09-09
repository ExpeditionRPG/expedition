import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import ExpeditionButton from 'app/components/base/Button';
import * as React from 'react';
import LoginButton from 'shared/auth/LoginButton';
import { UserState } from 'shared/auth/UserState';
import { AUTH_SETTINGS } from 'shared/schema/Constants';
import { AnnouncementState } from '../reducers/StateTypes';

export interface StateProps {
  announcement: AnnouncementState;
  user: UserState;
  pendingQuestId?: string;
}

export interface DispatchProps {
  onLinkTap: (link: string) => void;
  onLogin: (jwt: string) => Promise<void>;
  onNewQuest: (user: UserState) => Promise<void>;
  onOpenQuest?: (user: UserState, id: string) => Promise<void>;
}

interface Props extends StateProps, DispatchProps {}

class Splash extends React.Component<
  Props,
  { pending: boolean; error: string; operation: string }
> {
  public state = { pending: false, error: '', operation: '' };
  private run = (
    action: () => Promise<void>,
    operation = 'Connecting Google Drive…',
  ) => {
    if (this.state.pending) return;
    this.setState({ pending: true, error: '', operation });
    const failed = (error: any) =>
      this.setState({
        error: error.message || 'Unable to continue. Please try again.',
      });
    // Invoke synchronously: Drive authorization needs the original click.
    try {
      Promise.resolve(action())
        .catch(failed)
        .then(() => this.setState({ pending: false }));
    } catch (error) {
      failed(error);
      this.setState({ pending: false });
    }
  };
  public render(): JSX.Element {
    const props = this.props;
    const { pendingQuestId, onOpenQuest } = props;
    const { pending, error, operation } = this.state;
    const run = this.run;
    const announcementVisible =
      props.announcement &&
      props.announcement.open &&
      props.announcement.message !== '';

    return (
      <div className="main splash">
        <AppBar className="splash_app_bar" position="static">
          {announcementVisible && (
            <Toolbar className="announcement_bar">
              <Button
                className="announcement"
                onClick={() => props.onLinkTap(props.announcement.link)}
              >
                {props.announcement.message}{' '}
                {props.announcement.link && (
                  <img
                    className="inline_icon"
                    src="/images/new_window_white.svg"
                  />
                )}
              </Button>
            </Toolbar>
          )}
          <Toolbar className="splash_header">
            <Typography variant="title">Expedition Quest Creator</Typography>
            {props.user.loggedIn && (
              <div className="splash_account">
                <a
                  href="https://expeditiongame.com/loot"
                  target="_blank"
                  className="lootPoints"
                >
                  {props.user.lootPoints}{' '}
                  <img
                    className="inline_icon"
                    src="images/loot_white_small.svg"
                  />
                </a>
                <span className="email">{props.user.email}</span>
              </div>
            )}
          </Toolbar>
        </AppBar>
        <div className={`body ${announcementVisible && 'announcing'}`}>
          <div className="quest_home_intro">
            <section
              className="quest_hero"
              aria-label={props.user.loggedIn ? 'Quest actions' : undefined}
              aria-labelledby={
                props.user.loggedIn ? undefined : 'quest-hero-title'
              }
            >
              {!props.user.loggedIn && (
                <>
                  <h1 id="quest-hero-title">Create your next adventure</h1>
                  <p className="quest_hero_summary">
                    Write, preview, and publish an Expedition quest. Save your
                    work in Google Drive.
                  </p>
                </>
              )}
              <div
                className={
                  props.user.loggedIn ? undefined : 'quest_action_panel'
                }
                aria-busy={pending}
              >
                {!props.user.loggedIn ? (
                  <>
                    <h2>
                      {pendingQuestId
                        ? 'Open or create a quest'
                        : 'Create a quest'}
                    </h2>
                    <p>
                      {pendingQuestId
                        ? 'Sign in with Google to open your quest or start a new one.'
                        : 'First, sign in with Google. Then create your quest and connect Google Drive.'}
                    </p>
                    <fieldset className="quest_signin" disabled={pending}>
                      <LoginButton
                        clientId={AUTH_SETTINGS.CLIENT_ID}
                        onLogin={jwt =>
                          run(() => props.onLogin(jwt), 'Signing in…')
                        }
                      />
                    </fieldset>
                  </>
                ) : (
                  <>
                    <div className="quest_actions">
                      {pendingQuestId && onOpenQuest && (
                        <Button
                          className="quest_primary"
                          variant="contained"
                          disabled={pending}
                          onClick={() =>
                            run(() => onOpenQuest(props.user, pendingQuestId))
                          }
                        >
                          Open your quest
                        </Button>
                      )}
                      <Button
                        className={
                          pendingQuestId && onOpenQuest
                            ? 'quest_secondary'
                            : 'quest_primary'
                        }
                        variant={
                          pendingQuestId && onOpenQuest
                            ? 'outlined'
                            : 'contained'
                        }
                        disabled={pending}
                        onClick={() => run(() => props.onNewQuest(props.user))}
                      >
                        Create a quest
                      </Button>
                    </div>
                  </>
                )}
                {error && (
                  <p className="quest_error" role="alert">
                    {error}
                  </p>
                )}
                {pending && <p role="status">{operation}</p>}
                {!props.user.loggedIn && (
                  <p className="quest_desktop_advice">
                    For the best writing experience, use a desktop browser.
                  </p>
                )}
              </div>
            </section>
            <div className="worldMap">
              <img
                alt="Countries with Expedition adventurers - Jan-April 2017"
                src="/images/worldmap.png"
              ></img>
            </div>
            <div className="imageText">
              Adventurers waiting for your next story
            </div>
            <h3>Build an international fanbase</h3>
            <h3>Write on the bleeding edge of interactive storytelling</h3>
            <h3>
              Earn money through player tips{' '}
              <a target="_blank" href="https://app.expeditiongame.com">
                in the app
              </a>
            </h3>
            <p>
              Learn more about{' '}
              <a target="_blank" href="https://expeditiongame.com">
                Expedition: The Roleplaying Card Game
              </a>
            </p>
          </div>

          <div>
            <h1>
              Built for <strong>Authors</strong>
            </h1>
            <h3>
              <span>Everything you need to write</span>{' '}
              <span>and publish your own quests.</span>
            </h3>
            <div className="showcase">
              <div>
                <iframe
                  className="previewVideo"
                  src="https://www.youtube.com/embed/12y1NhQUXvs?autoplay=1&fs=0&loop=1&modestbranding=1&playlist=12y1NhQUXvs"
                ></iframe>
              </div>
              <div>
                <p>
                  The quest creator only takes a few minutes to learn, yet has
                  powerful tools to help you build epic, interactive adventures.
                </p>
                <h3>Highlights:</h3>
                <ul>
                  <li>Syntax checking</li>
                  <li>Google Drive integration</li>
                  <li>Collaborate editing</li>
                  <li>In-browser preview</li>
                  <li>Single-click publish</li>
                  <li>
                    Extensive{' '}
                    <a
                      target="_blank"
                      rel="nofollow"
                      href="https://github.com/ExpeditionRPG/expedition/blob/master/services/quests/docs/index.md"
                    >
                      documentation
                    </a>
                  </li>
                  <li>
                    Fully{' '}
                    <a
                      target="_blank"
                      rel="nofollow"
                      href="https://github.com/expeditionRPG/expedition"
                    >
                      open-source
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h1>
              <span>Interactive storytelling</span>{' '}
              <span>
                for <strong>everyone</strong>
              </span>
            </h1>
            <h3>
              Join the bleeding edge of storytelling technology, no experience
              required.
            </h3>

            <div className="showcase">
              <div>
                <img src="/images/code_example.png"></img>
              </div>
              <div>
                <p>If you've never written code before, you don't have to.</p>
                <p>
                  If you're a veteran programmer, you can use integrated{' '}
                  <a target="_blank" rel="nofollow" href="https://mathjs.org">
                    MathJS
                  </a>
                  to weave intricate storylines and puzzles.
                </p>
                <h3>Features:</h3>
                <ul>
                  <li>
                    Simple,{' '}
                    <a href="https://daringfireball.net/projects/markdown/syntax">
                      Markdown
                    </a>
                    -inspired syntax
                  </li>
                  <li>Branching choices</li>
                  <li>Jump to parts of your story</li>
                  <li>Templates for repetitive actions</li>
                  <li>Variables &amp; programmatic text</li>
                  <li>Contextual showing/hiding of user actions</li>
                </ul>
              </div>
            </div>

            <div className="buttonBox login">
              <ExpeditionButton
                onClick={() => {
                  window.location.href = 'http://expeditiongame.com';
                }}
              >
                Expedition Home Page
              </ExpeditionButton>
            </div>
          </div>

          <div>
            <h1>Frequently Asked Questions</h1>
            <h4>Will I still own my work?</h4>
            <p>
              <strong>YES!</strong> By publishing your quest on the Expedition
              Quest Creator, you agree to grant Fabricate, LLC a non-exclusive,
              royalty-free, worldwide, perpetual license to your work for the
              purposes of board and video gaming. But, you still own the core
              intellectual property and can use it however you see fit. In fact,
              we encourage you to port your Expedition quests to other mediums
              to capitalize on the fanbase you'll build here!
            </p>
            <h4>Can I write in any genre?</h4>
            <p>
              <strong>YES!</strong> You can select the genre and age level of
              your quest before publishing, so you can publishing anything from
              a kid-friendly comedy to an adults-only murder mystery. Note that
              we reserve the right to remove offensive and pornographic
              material, and provide tools to users to report quests that violate
              our community and quality standards.
            </p>

            <footer>
              <p>
                © 2015-2017 Fabricate, LLC. Powered by{' '}
                <a target="_blank" href="https://expeditiongame.com">
                  Expedition: The Tabletop Roleplaying Game
                </a>
              </p>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}

export default Splash;

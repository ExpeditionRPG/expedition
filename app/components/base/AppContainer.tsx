import * as React from 'react'
import {Provider} from 'react-redux'
import FlatButton from 'material-ui/FlatButton'
import Snackbar from 'material-ui/Snackbar'

import AudioContainer from './AudioContainer'
import DialogsContainer from './DialogsContainer'
import ToolsContainer from '../ToolsContainer'
import FeaturedQuestsContainer from '../FeaturedQuestsContainer'
import PlayerCountSettingContainer from '../PlayerCountSettingContainer'
import ReportContainer from '../ReportContainer'
import SearchContainer from '../SearchContainer'
import SettingsContainer from '../SettingsContainer'
import SplashScreenContainer from '../SplashScreenContainer'
import QuestStartContainer from '../QuestStartContainer'
import QuestEndContainer from '../QuestEndContainer'
import RemotePlayContainer from '../RemotePlayContainer'
import RemoteFooterContainer from './remote/RemoteFooterContainer'
import RemoteSyncContainer from './remote/RemoteSyncContainer'

import {CARD_TRANSITION_ANIMATION_MS} from '../../Constants'
import {renderCardTemplate} from '../../cardtemplates/Template'
import {initialSettings} from '../../reducers/Settings'
import {cardTransitioning} from '../../actions/Card'
import {closeSnackbar} from '../../actions/Snackbar'
import {initialState} from '../../reducers/Snackbar'
import {initialRemotePlay} from '../../reducers/RemotePlay'
import {AppStateWithHistory, TransitionType, SearchPhase, RemotePlayPhase, SettingsType, SnackbarState, RemotePlayState} from '../../reducers/StateTypes'
import {getStore} from '../../Store'
import {getRemotePlayClient} from '../../RemotePlay'

const ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

interface MainProps extends React.Props<any> {}

interface MainState {
  card: JSX.Element;
  key: number;
  transition: TransitionType;
  settings: SettingsType;
  snackbar: SnackbarState;
  remotePlay: RemotePlayState;
}

export default class Main extends React.Component<MainProps, {}> {
  state: MainState;
  storeUnsubscribeHandle: () => any;

  constructor(props: MainProps) {
    super(props);
    this.state = this.getUpdatedState();
    this.storeUnsubscribeHandle = getStore().subscribe(this.handleChange.bind(this));
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    // 2017-08-16: Failing to unsubscribe here is likely to have caused unnecessary references to previous
    // JS objects, which prevents garbage collection and causes runaway memory consumption.
    this.storeUnsubscribeHandle();
  }

  getUpdatedState(): MainState {
    const state: AppStateWithHistory = getStore().getState();
    if (state === undefined || this.state === undefined || Object.keys(state).length === 0) {
      return {
        card: <SplashScreenContainer/>,
        key: 0,
        transition: 'INSTANT' as TransitionType,
        settings: initialSettings,
        snackbar: initialState,
        remotePlay: initialRemotePlay,
      };
    }

    if (state.remotePlay && state.remotePlay !== this.state.remotePlay) {
      // We only prevent card transition when we're not
      // transitioning away from a remote play "syncing" state.
      if (state.remotePlay.syncing || !this.state.remotePlay.syncing) {
        return {...this.state, remotePlay: state.remotePlay};
      }
    }

    if (state.snackbar.open !== this.state.snackbar.open) {
      return {...this.state, snackbar: state.snackbar};
    }

    // After this point, only naviation-related state changes will result in a state change
    if (!state.card || (this.state && state.card.ts === this.state.key)) {
      return this.state;
    }

    let card: JSX.Element = null;
    switch(state.card.name) {
      case 'SPLASH_CARD':
        card = <SplashScreenContainer/>;
        break;
      case 'PLAYER_COUNT_SETTING':
        card = <PlayerCountSettingContainer/>;
        break;
      case 'FEATURED_QUESTS':
        card = <FeaturedQuestsContainer/>;
        break;
      case 'QUEST_START':
        card = <QuestStartContainer/>;
        break;
      case 'QUEST_CARD':
        if (!state.quest || !state.quest.node) {
          return this.state;
        }
        card = renderCardTemplate(state.card, state.quest.node);
        if (!card) {
          console.log('Unknown quest card name ' + name);
          return this.state;
        }
        break;
      case 'QUEST_END':
        card = <QuestEndContainer/>;
        break;
      case 'ADVANCED':
        card = <ToolsContainer />;
        break;
      case 'SEARCH_CARD':
        card = <SearchContainer phase={state.card.phase as SearchPhase} />;
        break;
      case 'SETTINGS':
        card = <SettingsContainer />;
        break;
      case 'REPORT':
        card = <ReportContainer />;
        break;
      case 'REMOTE_PLAY':
        card = <RemotePlayContainer phase={state.card.phase as RemotePlayPhase} />;
        break;
      default:
        throw new Error('Unknown card ' + state.card.name);
    }

    let transition: TransitionType = 'NEXT';
    if (state.remotePlay && !state.remotePlay.syncing && this.state.remotePlay.syncing) {
      transition = 'INSTANT';
    } else if (state._return) {
      transition = 'PREV';
    } else if (state.card.name === 'SPLASH_CARD') {
      transition = 'INSTANT';
    }

    // At this point, we know a transition is happening for sure, so dispatch card.transitioning flag changes
    if (!state.card.transitioning && transition !== 'INSTANT') {
      getStore().dispatch(cardTransitioning(true));
      setTimeout(() => { getStore().dispatch(cardTransitioning(false)) }, CARD_TRANSITION_ANIMATION_MS);
    }

    return {
      card,
      key: state.card.ts,
      transition,
      settings: state.settings,
      snackbar: state.snackbar,
      remotePlay: state.remotePlay,
    };
  }

  handleChange() {
    // TODO: Handle no-op on RESET_APP from IDE
    this.setState(this.getUpdatedState());
  }

  render() {
    let containerClass = 'app_container ';
    if (this.state.settings.fontSize === 'SMALL') {
      containerClass += 'smallFont';
    } else if (this.state.settings.fontSize === 'LARGE') {
      containerClass += 'largeFont';
    }

    return (
      <div className={containerClass}>
        <Provider store={getStore()}>
          <span>
            <ReactCSSTransitionGroup
                transitionName={this.state.transition}
                transitionEnterTimeout={CARD_TRANSITION_ANIMATION_MS}
                transitionLeaveTimeout={CARD_TRANSITION_ANIMATION_MS}>
              <div className={'base_main' + ((this.state.remotePlay && this.state.remotePlay.session) ? ' has_footer' : '')} key={this.state.key}>
                  {this.state.card}
              </div>
            </ReactCSSTransitionGroup>
            {this.state.remotePlay && this.state.remotePlay.session && <RemoteFooterContainer/>}
            <DialogsContainer />
            <RemoteSyncContainer />
            <Snackbar
              className="snackbar"
              open={this.state.snackbar.open}
              message={this.state.snackbar.message}
              autoHideDuration={this.state.snackbar.timeout}
              onRequestClose={() => getStore().dispatch(closeSnackbar())}
              action={this.state.snackbar.actionLabel}
              onActionTouchTap={this.state.snackbar.action}
            />
            <AudioContainer />
          </span>
        </Provider>
      </div>
    );
  }
}

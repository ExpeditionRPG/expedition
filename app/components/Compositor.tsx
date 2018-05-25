import * as React from 'react'
import Snackbar from 'material-ui/Snackbar'
import AudioContainer from './base/AudioContainer'
import DialogsContainer from './base/DialogsContainer'
import MultiplayerFooterContainer from './multiplayer/MultiplayerFooterContainer'
import MultiplayerSyncContainer from './multiplayer/MultiplayerSyncContainer'
import {CARD_TRANSITION_ANIMATION_MS} from '../Constants'
import {
  CardState,
  CardThemeType,
  MultiplayerPhase,
  MultiplayerState,
  QuestState,
  TransitionType,
  SavedQuestsPhase,
  SearchPhase,
  SettingsType,
  SnackbarState
} from '../reducers/StateTypes'

import CheckoutContainer from './views/CheckoutContainer'
import ToolsContainer from './views/ToolsContainer'
import FeaturedQuestsContainer from './views/FeaturedQuestsContainer'
import MultiplayerContainer from './views/MultiplayerContainer'
import PartySizeSelectContainer from './views/PartySizeSelectContainer'
import SavedQuestsContainer from './views/SavedQuestsContainer'
import SearchContainer from './views/SearchContainer'
import SettingsContainer from './views/SettingsContainer'
import SplashScreenContainer from './views/SplashScreenContainer'
import QuestSetupContainer from './views/quest/QuestSetupContainer'
import QuestEndContainer from './views/quest/QuestEndContainer'
import {renderCardTemplate} from './views/quest/cardtemplates/Template'

const ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

export interface CompositorStateProps {
  card: CardState;
  quest: QuestState;
  remotePlay: MultiplayerState;
  settings: SettingsType;
  snackbar: SnackbarState;
  theme: CardThemeType;
  transition: TransitionType;
}

export interface CompositorDispatchProps {
  closeSnackbar: () => void;
}

export interface CompositorProps extends CompositorStateProps, CompositorDispatchProps {}

export default class Compositor extends React.Component<CompositorProps, {}> {
  render() {
    let card: JSX.Element = <span />;
    switch(this.props.card.name) {
      case 'SPLASH_CARD':
        card = <SplashScreenContainer />;
        break;
      case 'PLAYER_COUNT_SETTING':
        card = <PartySizeSelectContainer />;
        break;
      case 'FEATURED_QUESTS':
        card = <FeaturedQuestsContainer />;
        break;
      case 'SAVED_QUESTS':
        card = <SavedQuestsContainer  phase={this.props.card.phase as SavedQuestsPhase} />;
        break;
      case 'QUEST_SETUP':
        card = <QuestSetupContainer />;
        break;
      case 'QUEST_CARD':
        if (this.props.quest && this.props.quest.node) {
          card = renderCardTemplate(this.props.card, this.props.quest.node);
        }
        break;
      case 'QUEST_END':
        card = <QuestEndContainer />;
        break;
      case 'CHECKOUT':
        card = <CheckoutContainer />;
        break;
      case 'ADVANCED':
        card = <ToolsContainer />;
        break;
      case 'SEARCH_CARD':
        card = <SearchContainer phase={this.props.card.phase as SearchPhase} />;
        break;
      case 'SETTINGS':
        card = <SettingsContainer />;
        break;
      case 'REMOTE_PLAY':
        card = <MultiplayerContainer phase={this.props.card.phase as MultiplayerPhase} />;
        break;
      default:
        throw new Error('Unknown card ' + this.props.card.name);
    }

    const containerClass = ['app_container'];
    if (this.props.settings.fontSize === 'SMALL') {
      containerClass.push('smallFont');
    } else if (this.props.settings.fontSize === 'LARGE') {
      containerClass.push('largeFont');
    }

    return (
      <div className={containerClass.join(' ')}>
        <span>
          <ReactCSSTransitionGroup
              transitionName={this.props.transition}
              transitionEnterTimeout={CARD_TRANSITION_ANIMATION_MS}
              transitionLeaveTimeout={CARD_TRANSITION_ANIMATION_MS}>
            <div className={'base_main' + ((this.props.remotePlay && this.props.remotePlay.session) ? ' has_footer' : '')} key={this.props.card.key}>
              {card}
            </div>
          </ReactCSSTransitionGroup>
          {this.props.remotePlay && this.props.remotePlay.session && <MultiplayerFooterContainer theme={this.props.theme}/>}
          <DialogsContainer />
          <MultiplayerSyncContainer />
          <Snackbar
            className="snackbar"
            open={this.props.snackbar.open}
            message={this.props.snackbar.message}
            autoHideDuration={this.props.snackbar.timeout}
            onRequestClose={this.props.closeSnackbar}
            action={this.props.snackbar.actionLabel}
            onActionClick={this.props.snackbar.action}
          />
          <AudioContainer />
        </span>
      </div>
    );
  }
}

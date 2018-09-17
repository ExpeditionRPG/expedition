import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import * as React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {CARD_TRANSITION_ANIMATION_MS} from '../Constants';
import {
  CardState,
  CardThemeType,
  MultiplayerPhase,
  MultiplayerState,
  QuestState,
  SearchPhase,
  SettingsType,
  SnackbarState,
  TransitionClassType
} from '../reducers/StateTypes';
import AudioContainer from './base/AudioContainer';
import DialogsContainer from './base/DialogsContainer';
import MultiplayerFooterContainer from './multiplayer/MultiplayerFooterContainer';
import MultiplayerSyncContainer from './multiplayer/MultiplayerSyncContainer';
import CheckoutContainer from './views/CheckoutContainer';
import FeaturedQuestsContainer from './views/FeaturedQuestsContainer';
import ModeSelectContainer from './views/ModeSelectContainer';
import MultiplayerContainer from './views/MultiplayerContainer';
import {renderCardTemplate} from './views/quest/cardtemplates/Template';
import QuestEndContainer from './views/quest/QuestEndContainer';
import QuestSetupContainer from './views/quest/QuestSetupContainer';
import QuestHistoryContainer from './views/QuestHistoryContainer';
import QuestPreviewContainer from './views/QuestPreviewContainer';
import SavedQuestsContainer from './views/SavedQuestsContainer';
import SearchContainer from './views/SearchContainer';
import SettingsContainer from './views/SettingsContainer';
import SplashScreenContainer from './views/SplashScreenContainer';
import ToolsContainer from './views/ToolsContainer';

export interface StateProps {
  card: CardState;
  quest: QuestState;
  multiplayer: MultiplayerState;
  settings: SettingsType;
  snackbar: SnackbarState;
  theme: CardThemeType;
  transition: TransitionClassType;
}

export interface DispatchProps {
  closeSnackbar: () => void;
}

export interface Props extends StateProps, DispatchProps {}

export default class Compositor extends React.Component<Props, {}> {

  public snackbarActionClicked(e: React.MouseEvent<HTMLElement>) {
    if (this.props.snackbar.action) {
      this.props.snackbar.action(e);
    }
  }

  public render() {
    let card: JSX.Element = <span />;
    switch (this.props.card.name) {
      case 'SPLASH_CARD':
        card = <SplashScreenContainer />;
        break;
      case 'PLAYER_COUNT_SETTING':
        card = <ModeSelectContainer />;
        break;
      case 'FEATURED_QUESTS':
        card = <FeaturedQuestsContainer />;
        break;
      case 'SAVED_QUESTS':
        card = <SavedQuestsContainer />;
        break;
      case 'QUEST_HISTORY':
        card = <QuestHistoryContainer />;
        break;
      case 'QUEST_PREVIEW':
        card = <QuestPreviewContainer />;
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

    // See https://medium.com/lalilo/dynamic-transitions-with-react-router-and-react-transition-group-69ab795815c9
    // for more details on use of childFactory in TransitionGroup
    return (
      <div className={containerClass.join(' ')}>
        <TransitionGroup
            childFactory={(child) => React.cloneElement(
                child, {classNames: this.props.transition}
            )}>
            <CSSTransition
                key={this.props.card.key}
                classNames={''}
                timeout={{enter: CARD_TRANSITION_ANIMATION_MS, exit: CARD_TRANSITION_ANIMATION_MS}}>
                <div className={'base_main' + ((this.props.multiplayer && this.props.multiplayer.session) ? ' has_footer' : '')}>
                    {card}
                </div>
            </CSSTransition>
        </TransitionGroup>
        {this.props.multiplayer && this.props.multiplayer.session && <MultiplayerFooterContainer cardTheme={this.props.theme}/>}
        <DialogsContainer />
        <MultiplayerSyncContainer />
        <Snackbar
            className="snackbar"
            open={this.props.snackbar.open}
            message={<span>{this.props.snackbar.message}</span>}
            autoHideDuration={this.props.snackbar.timeout}
            onClose={this.props.closeSnackbar}
            action={(this.props.snackbar.actionLabel) ? [<Button key={1} onClick={(e: React.MouseEvent<HTMLElement>) => this.snackbarActionClicked(e)}>{this.props.snackbar.actionLabel}</Button>] : []}
        />
        <AudioContainer />
      </div>
    );
  }
}

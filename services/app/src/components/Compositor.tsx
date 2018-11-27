import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import * as React from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {CARD_TRANSITION_ANIMATION_MS, NAV_CARDS} from '../Constants';
import {
  CardName,
  CardState,
  CardThemeType,
  MultiplayerPhase,
  MultiplayerState,
  QuestState,
  SettingsType,
  SnackbarState,
  TransitionClassType
} from '../reducers/StateTypes';
import AudioContainer from './base/AudioContainer';
import DialogsContainer from './base/DialogsContainer';
import NavigationContainer from './base/NavigationContainer';
import MultiplayerClientContainer from './multiplayer/MultiplayerClientContainer';
import MultiplayerFooterContainer from './multiplayer/MultiplayerFooterContainer';
import MultiplayerSyncContainer from './multiplayer/MultiplayerSyncContainer';
import AccountContainer from './views/AccountContainer';
import CheckoutContainer from './views/CheckoutContainer';
import GMCornerContainer from './views/GMCornerContainer';
import ModeSelectContainer from './views/ModeSelectContainer';
import MultiplayerContainer from './views/MultiplayerContainer';
import {renderCardTemplate} from './views/quest/cardtemplates/Template';
import QuestEndContainer from './views/quest/QuestEndContainer';
import QuestSetupContainer from './views/quest/QuestSetupContainer';
import QuestHistoryContainer from './views/QuestHistoryContainer';
import QuestPreviewContainer from './views/QuestPreviewContainer';
import SavedQuestsContainer from './views/SavedQuestsContainer';
import SearchContainer from './views/SearchContainer';
import SearchDisclaimerContainer from './views/SearchDisclaimerContainer';
import SearchSettingsContainer from './views/SearchSettingsContainer';
import SettingsContainer from './views/SettingsContainer';
import SplashScreenContainer from './views/SplashScreenContainer';
import TutorialsContainer from './views/TutorialsContainer';

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

export function isNavCard(name: CardName) {
  for (const n of NAV_CARDS) {
    if (name === n) {
      return true;
    }
  }
  return false;
}

export default class Compositor extends React.Component<Props, {}> {

  public snackbarActionClicked(e: React.MouseEvent<HTMLElement>) {
    if (this.props.snackbar.action) {
      this.props.snackbar.action(e);
    }
  }

  private renderCard(): JSX.Element {
    switch (this.props.card.name) {
      case 'SPLASH_CARD':
        return <SplashScreenContainer />;
      case 'PLAYER_COUNT_SETTING':
        return <ModeSelectContainer />;
      case 'TUTORIAL_QUESTS':
        return <TutorialsContainer />;
      case 'SAVED_QUESTS':
        return <SavedQuestsContainer />;
      case 'QUEST_HISTORY':
        return <QuestHistoryContainer />;
      case 'QUEST_PREVIEW':
        return <QuestPreviewContainer />;
      case 'QUEST_SETUP':
        return <QuestSetupContainer />;
      case 'QUEST_CARD':
        if (!this.props.quest || !this.props.quest.node) {
          throw new Error('QUEST_CARD without quest/node');
        }
        return renderCardTemplate(this.props.card, this.props.quest.node);
      case 'QUEST_END':
        return <QuestEndContainer />;
      case 'GM_CARD':
        return <GMCornerContainer />;
      case 'CHECKOUT':
        return <CheckoutContainer />;
      case 'SEARCH_CARD':
        return <SearchContainer />;
      case 'SEARCH_SETTINGS':
        return <SearchSettingsContainer />;
      case 'SEARCH_DISCLAIMER':
        return <SearchDisclaimerContainer />;
      case 'SETTINGS':
        return <SettingsContainer />;
      case 'REMOTE_PLAY':
        return <MultiplayerContainer phase={this.props.card.phase as MultiplayerPhase} />;
      case 'ACCOUNT':
        return <AccountContainer />;
      default:
        throw new Error('Unknown card ' + this.props.card.name);
    }
  }

  private renderFooter(): JSX.Element|null {
    // Show no footers for certain cards
    for (const noShow of ['SPLASH_CARD', 'PLAYER_COUNT_SETTING']) {
      if (this.props.card.name === noShow) {
        return null;
      }
    }

    // Multiplayer-only view during the quest.
    if (this.props.multiplayer && this.props.multiplayer.session && !isNavCard(this.props.card.name)) {
      return <MultiplayerFooterContainer cardTheme={this.props.theme}/>;
    }

    // Only show nav footer for certain cards
    if (isNavCard(this.props.card.name)) {
      return <NavigationContainer cardTheme={this.props.theme}/>;
    }
    return null;
  }

  public shouldComponentUpdate(nextProps: Props) {
    // Don't update the main UI if we're just syncing state
    if (nextProps.multiplayer.syncing) {
      return false;
    }
    return true;
  }

  public render() {

    const containerClass = ['app_container'];
    if (this.props.settings.fontSize === 'SMALL') {
      containerClass.push('smallFont');
    } else if (this.props.settings.fontSize === 'LARGE') {
      containerClass.push('largeFont');
    }

    const footer = this.renderFooter();

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
            <div className={'base_main' + ((footer !== null) ? ' has_footer' : '')}>
              {this.renderCard()}
            </div>
          </CSSTransition>
        </TransitionGroup>
        {footer}
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
        <MultiplayerClientContainer />
      </div>
    );
  }
}

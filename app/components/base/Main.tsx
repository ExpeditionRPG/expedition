import * as React from 'react'
import {Provider} from 'react-redux'
import Snackbar from 'material-ui/Snackbar'

import AdvancedPlayContainer from '../AdvancedPlayContainer'
import FeaturedQuestsContainer from '../FeaturedQuestsContainer'
import PlayerCountSettingContainer from '../PlayerCountSettingContainer'
import ReportContainer from '../ReportContainer'
import SearchContainer from '../SearchContainer'
import SettingsContainer from '../SettingsContainer'
import SplashScreenContainer from '../SplashScreenContainer'
import QuestStartContainer from '../QuestStartContainer'
import QuestEndContainer from '../QuestEndContainer'

import {renderCardTemplate} from '../../cardtemplates/Template'

import {closeSnackbar} from '../../actions/Snackbar'
import {AppStateWithHistory, TransitionType, SearchPhase, SnackbarState} from '../../reducers/StateTypes'
import {getStore} from '../../Store'

const ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

interface MainProps extends React.Props<any> {}

export default class Main extends React.Component<MainProps, {}> {
  state: {key: number, transition: TransitionType, card: JSX.Element, snackbar: SnackbarState};

  constructor(props: MainProps) {
    super(props);
    this.state = this.getUpdatedState();
    getStore().subscribe(this.handleChange.bind(this));
  }

  getUpdatedState() {
    const state: AppStateWithHistory = getStore().getState();
    if (state === undefined || this.state === undefined || Object.keys(state).length === 0) {
      return {key: 0, transition: 'INSTANT' as TransitionType, card: <SplashScreenContainer/>, snackbar: { open: false, message: '' }};
    }

    if (state.snackbar.open !== this.state.snackbar.open) {
      return {...this.state, snackbar: state.snackbar};
    }

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
        card = <AdvancedPlayContainer />;
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
      default:
        throw new Error('Unknown card ' + state.card);
    }

    let transition: TransitionType = 'NEXT';
    if (state._return) {
      transition = 'PREV';
    } else if (state.card.name === 'SPLASH_CARD') {
      transition = 'INSTANT';
    }
    return {key: state.card.ts, transition, card, snackbar: state.snackbar};
  }

  handleChange() {
    // TODO: Handle no-op on RESET_APP from IDE
    this.setState(this.getUpdatedState());
  }

  render() {
    const cards: any = [
      <div className="base_main" key={this.state.key}>
        {this.state.card}
      </div>
    ];
    return (
      <div className="app_container">
        <Provider store={getStore()}>
          <ReactCSSTransitionGroup
            transitionName={this.state.transition}
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            {cards}
            <Snackbar
              className="snackbar"
              open={this.state.snackbar.open}
              message={this.state.snackbar.message}
              autoHideDuration={this.state.snackbar.timeout}
              onRequestClose={() => getStore().dispatch(closeSnackbar())}
            />
          </ReactCSSTransitionGroup>
        </Provider>
      </div>
    );
  }
}

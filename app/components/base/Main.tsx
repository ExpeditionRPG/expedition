import * as React from 'react'
import {Provider} from 'react-redux'

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

import {AppStateWithHistory, TransitionType, SearchPhase} from '../../reducers/StateTypes'
import {getStore} from '../../Store'

var ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

interface MainProps extends React.Props<any> {}

export default class Main extends React.Component<MainProps, {}> {
  state: {key: number, transition: TransitionType, card: JSX.Element};

  constructor(props: MainProps) {
    super(props);
    this.state = this.getUpdatedState();
    getStore().subscribe(this.handleChange.bind(this));
  }

  getUpdatedState() {
    let state: AppStateWithHistory = getStore().getState();
    if (state === undefined) {
      return {key: 0, transition: 'INSTANT' as TransitionType, card: <SplashScreenContainer/>};
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
    return {key: state.card.ts, transition, card};
  }

  handleChange() {
    // TODO: Handle no-op on RESET_APP from IDE
    this.setState(this.getUpdatedState());
  }

  render() {
    var cards: any = [
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
          </ReactCSSTransitionGroup>
        </Provider>
      </div>
    );
  }
}

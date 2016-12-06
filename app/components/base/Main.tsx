import * as React from 'react'
import theme from '../../theme'

import {AppStateWithHistory, TransitionType, SearchPhase} from '../../reducers/StateTypes'
import SplashScreenContainer from '../SplashScreenContainer'
import Card from './Card'
import FeaturedQuestsContainer from '../FeaturedQuestsContainer'
import QuestStartContainer from '../QuestStartContainer'
import RoleplayContainer from '../RoleplayContainer'
import CombatContainer from '../CombatContainer'
import SearchContainer from '../SearchContainer'
import PlayerCountSettingContainer from '../PlayerCountSettingContainer'
import SettingsContainer from '../SettingsContainer'
import AdvancedPlayContainer from '../AdvancedPlayContainer'
import {RoleplayResult, loadRoleplayNode, CombatResult, loadCombatNode} from '../../QuestParser'
import {getStore} from '../../store'
import { Provider } from 'react-redux'

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
        if (!state.quest || !state.quest.result) {
          return this.state;
        }
        switch(state.quest.result.type) {
          case 'Roleplay':
            card = <RoleplayContainer node={state.quest.node} roleplay={state.quest.result}/>;
            break;
          case 'Combat':
            card = <CombatContainer card={state.card} node={state.quest.node} icon={state.quest.result.icon} combat={state.combat}/>;
            break;
          default:
            console.log('Unknown quest card name ' + name);
            return this.state;
        }
        break;
      case 'ADVANCED':
        card = <AdvancedPlayContainer />;
        break;
      case 'CUSTOM_COMBAT':
        card = <CombatContainer card={state.card} custom={true}/>;
        break;
      case 'SEARCH_CARD':
        card = <SearchContainer phase={state.card.phase as SearchPhase} />;
        break;
      case 'SETTINGS':
        card = <SettingsContainer />;
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

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
import {getNodeCardType, RoleplayResult, loadRoleplayNode, CombatResult, loadCombatNode} from '../../QuestParser'

var ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');
declare var require:any;

interface MainProps extends React.Props<any> {
  store: any;
}

export default class Main extends React.Component<MainProps, {}> {
  state: {key: number, transition: TransitionType, card: JSX.Element};

  constructor(props: MainProps) {
    super(props);
    this.state = this.getUpdatedState();
    this.props.store.subscribe(this.handleChange.bind(this));
  }

  getUpdatedState() {
    let state: AppStateWithHistory = this.props.store.getState();
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
        let name = getNodeCardType(state.quest.node);
        if (name === 'ROLEPLAY') {
          let roleplay: RoleplayResult = loadRoleplayNode(state.quest.node);
          card = <RoleplayContainer node={state.quest.node} roleplay={roleplay}/>;
        } else if (name === 'COMBAT') {
          let combat: CombatResult = loadCombatNode(state.quest.node);
          card = <CombatContainer card={state.card} node={state.quest.node} icon={combat.icon} combat={state.combat}/>;
        } else {
          throw new Error('Unknown quest card name ' + name);
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
        <ReactCSSTransitionGroup
          transitionName={this.state.transition}
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
          {cards}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

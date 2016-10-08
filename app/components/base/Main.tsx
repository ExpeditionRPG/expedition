import * as React from 'react'
import theme from '../../theme'

import {AppStateWithHistory, TransitionType} from '../../reducers/StateTypes'
import SplashScreenContainer from '../SplashScreenContainer'
import Card from './Card'
import FeaturedQuestsContainer from '../FeaturedQuestsContainer'
import QuestStartContainer from '../QuestStartContainer'
import RoleplayContainer from '../RoleplayContainer'
import CombatContainer from '../CombatContainer'
import SearchContainer from '../SearchContainer'
import PlayerCountSettingContainer from '../PlayerCountSettingContainer'
import SettingsContainer from '../SettingsContainer'
import {getNodeCardType, RoleplayResult, loadRoleplayNode, CombatResult, loadCombatNode} from '../../QuestParser'

var ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

interface MainProps extends React.Props<any> {
  store: any;
}

export default class Main extends React.Component<MainProps, {}> {
  state: {key: number, transition: TransitionType, card: JSX.Element};

  constructor(props: MainProps) {
    super(props);
    this.state = {key: 0, transition: 'INSTANT', card: <SplashScreenContainer/>};
    this.props.store.subscribe(this.handleChange.bind(this));
  }

  handleChange() {
    let state: AppStateWithHistory = this.props.store.getState();
    if (!state.card || state.card.ts === this.state.key) {
      return;
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
          card = <CombatContainer node={state.quest.node} icon={combat.icon} combat={state.combat}/>;
        } else {
          throw new Error('Unknown quest card name ' + name);
        }
        break;
      case 'SEARCH_CARD':
        card = <SearchContainer phase={state.search.phase} />;
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

    // Append current timestamp to key to allow for completely unique key values.
    this.setState({key: state.card.ts, transition, card});
  }

  render() {
    var cards: any = [
      <div style={{position: 'absolute', width: '100%', height: '100%'}} key={this.state.key}>
          {this.state.card}
      </div>
    ];
    return (
      <ReactCSSTransitionGroup
        transitionName={this.state.transition}
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}>
        {cards}
      </ReactCSSTransitionGroup>
    );
  }
}


/*
<template is="dom-bind" id="app">
    <expedition-card-set id="pages" initial="splash" title="Play Style" icon="cards" on-return="showSetup">
      <!-- TODO: splash screen should be a polymer element for testability -->

      <quest-card
        id="globalQuest"
        on-return="showSelect"
        data-route="quest"
        url="{{quest.xml_url}}">
      </quest-card>

      <!-- Ideas: http://www.trollmystic.com/pub/2012/03/03/event-generator/ -->
      <quest-search
        title="Full Quests"
        data-info="Browse featured and community quests."
        on-quest-select="onPublicQuestChoice"
        on-return="showSelect"
        data-route="public">
      </quest-search>

      <roleplay-card
        title="Guided Adventure"
        data-info="For beginner and intermediate Guides - a quest framework."
        on-return="showSelect"
        data-route="guided">
      </roleplay-card>

      <combat-card
        title="Custom Encounter"
        data-info="For experienced Guides - only the combat system is provided."
        on-return="showSelect"
        data-route="custom" custom>
      </combat-card>

    </expedition-card-set>

    <expedition-dialog title="Settings" id="settings">
      <expedition-settings></expedition-settings>
    </expedition-dialog>
    <tutorial-dialog id="tutorial" modal></expedition-dialog>
  </template>
  */
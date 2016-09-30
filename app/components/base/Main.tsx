import * as React from 'react'
import theme from '../../theme'

import {CardNameType, TransitionType, AppState, QuestAction} from '../../reducers/StateTypes'
import SplashScreenContainer from '../SplashScreenContainer'
import Card from './Card'
import FeaturedQuestContainer from '../FeaturedQuestContainer'
import QuestStartContainer from '../QuestStartContainer'
import RoleplayContainer from '../RoleplayContainer'
import CombatContainer from '../CombatContainer'
import {RoleplayResult, loadRoleplayNode, CombatPhase, CombatResult, loadCombatNode} from '../../scripts/QuestParser'

var ReactCSSTransitionGroup: any = require('react-addons-css-transition-group');

interface MainProps extends React.Props<any> {
  store: any;
}

export default class Main extends React.Component<MainProps, {}> {
  state: {key: CardNameType, transition: TransitionType, card: JSX.Element};

  constructor(props: MainProps) {
    super(props);
    this.state = {key: 'SPLASH_CARD', transition: 'INSTANT', card: <SplashScreenContainer/>};
    this.props.store.subscribe(this.handleChange.bind(this));
  }

  handleChange() {
    let state: AppState = this.props.store.getState();
    let stateCard = state.card[state.card.length - 1];
    console.log(stateCard);
    if (stateCard && stateCard.name !== this.state.key) {
      let card: JSX.Element = null;
      switch(stateCard.name) {
        case 'SPLASH_CARD':
          card = <SplashScreenContainer/>;
          break;
        case 'TEST_CARD': // TODO REMOVE
          card = <Card title="Herp">Derp</Card>;
          break;
        case 'FEATURED_QUESTS':
          card = <FeaturedQuestContainer/>;
          break;
        case 'QUEST_START':
          card = <QuestStartContainer/>;
          break;
        case 'ROLEPLAY':
          let roleplay: RoleplayResult = loadRoleplayNode((stateCard as QuestAction).node);
          card = <RoleplayContainer node={roleplay.node} icon={roleplay.icon} title={roleplay.title} content={roleplay.content} actions={roleplay.actions}/>;
          break;
        case 'COMBAT':
          let phase: CombatPhase = (stateCard as QuestAction).phase;
          if (!phase) {
            throw new Error('Combat card had no phase');
          }
          let combat: CombatResult = loadCombatNode((stateCard as QuestAction).node);
          card = <CombatContainer node={combat.node} phase={phase} icon={combat.icon} enemies={combat.enemies} />;
          break;

        /*
        case 'SEARCH_CARD':
          return <SearchContainer/>;

        */
        default:
          throw new Error('Unknown card ' + stateCard.name);
      }

      // Append current timestamp to key to allow for completely unique key values.
      this.setState({key: stateCard.name + Date.now(), transition: stateCard.entry, card: card});
    }
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
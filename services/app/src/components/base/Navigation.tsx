import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import * as React from 'react';
import {CardName, CardState, SettingsType} from '../../reducers/StateTypes';
import {CardThemeType} from '../../reducers/StateTypes';
import {formatImg} from '../views/quest/cardtemplates/Render';

export interface StateProps {
  cardTheme: CardThemeType;
  card: CardState;
  questTheme: string;
  hasSearchResults: boolean;
  settings: SettingsType;
}

export interface DispatchProps {
  toCard: (name: CardName, hasSearchResults: boolean, settings: SettingsType) => void;
}

export interface Props extends StateProps, DispatchProps {}

export default class Navigation extends React.Component<Props, {}> {

  private computeValue() {
    switch (this.props.card.name) {
      case 'SEARCH_CARD':
      case 'QUEST_HISTORY':
      case 'SAVED_QUESTS':
      case 'TUTORIAL_QUESTS':
      case 'GM_CARD':
        return this.props.card.name;
      default:
        console.error('Unknown navigation state for card name ' + this.props.card.name);
        return 'TUTORIAL_CARD';
    }
  }

  private genIcon(name: string): JSX.Element {
    return <img className="inline_icon" src={'images/' + formatImg(name, this.props.cardTheme, true) + '.svg'} />;
  }

  public render() {
    // const color = (this.props.cardTheme === 'dark') ? 'white' : 'black';
    // TODO: Replace saved/offline with multiplayer flap when connected to a session
    return (
      <BottomNavigation
        value={this.computeValue()}
        showLabels={false}
        onChange={(e: any, name: CardName) => this.props.toCard(name, this.props.hasSearchResults, this.props.settings)}
        className={`nav_footer card_theme_${this.props.cardTheme} quest_theme_${this.props.questTheme}`}>
        <BottomNavigationAction classes={{label: 'navlabel'}} label="Tutorials" value="TUTORIAL_QUESTS" icon={this.genIcon('helper')} />
        <BottomNavigationAction classes={{label: 'navlabel'}} label="Saved/Offline" value="SAVED_QUESTS" icon={this.genIcon('offline')} />
        <BottomNavigationAction classes={{label: 'navlabel'}} label="Quests" value="SEARCH_CARD" icon={this.genIcon('compass')} />
        <BottomNavigationAction classes={{label: 'navlabel'}} label="History" value="QUEST_HISTORY" icon={this.genIcon('hourglass')} />
        <BottomNavigationAction classes={{label: 'navlabel'}} label="GM" value="GM_CARD" icon={this.genIcon('gm_corner')} />
      </BottomNavigation>
    );
  }
}

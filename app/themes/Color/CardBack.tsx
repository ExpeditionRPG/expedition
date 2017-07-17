import * as React from 'react'
import {romanize, healthCounter} from '../../helpers'
import {CardType} from '../../reducers/StateTypes'
import {MAX_COUNTER_HEALTH} from '../../Constants'


export default class CardBack extends React.Component<CardType, {}> {
  render() {
    const card = this.props.card;
    const theme = 'Color';
    switch (card.sheet) {
      case 'Ability':
        return (
          <div className={`card back vertical ${card.class} ${card.sheet}`}>
            <div className="contents">
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      case 'Adventurer':
        return (
          <div className={`card back horizontal ${card.class} ${card.sheet}`}>
            <div className="contents">
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      case 'Encounter':
        return (
          <div className={`card back dark horizontal ${card.class} ${card.sheet} tier${card.tier}`}>
            <div className="contents">
              {healthCounter(MAX_COUNTER_HEALTH)}
              {card.naming && <div className="naming">{card.naming}</div>}
              <div className="tier">{romanize(card.tier)}</div>
            </div>
          </div>
        );
      case 'Helper':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
            </div>
          </div>
        );
      case 'Loot':
        return (
          <div className={`card back vertical ${card.sheet} tier${card.tier}`}>
            <div className="contents">
              <div className="tier">{romanize(card.tier)}</div>
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      case 'Persona':
        return (
          <div className={`card back dark horizontal ${card.sheet}`}>
            <div className="contents">
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

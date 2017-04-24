import React from 'react'
import {romanize, healthCounter} from '../../Helpers.jsx'

export default class CardBack extends React.Component {
  render() {
    const card = this.props.card;
    const theme = 'BlackAndWhite';
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
              {healthCounter('max')}
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
    }
  }
}

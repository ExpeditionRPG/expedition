import * as React from 'react';
import {MAX_COUNTER_HEALTH} from '../../Constants';
import {healthCounter, romanize, translate} from '../../helpers';
import {CardType} from '../../reducers/StateTypes';

export default class CardBack extends React.Component<CardType, {}> {
  public render() {
    const card = this.props.card;
    const translations = this.props.translations;
    switch (card.sheet) {
      case 'Ability':
        return (
          <div className={`card back vertical ${card.classicon || card.class} ${card.sheet}`}>
            <div className="contents">
              <h1>{card.class}</h1>
              <h2>{translate(card.sheet, translations)}</h2>
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      case 'Adventurer':
        return (
          <div className={`card back horizontal ${card.classicon || card.class} ${card.sheet}`}>
            <div className="contents">
              <h1>{translate(card.sheet, translations)}</h1>
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      case 'Encounter':
        return (
          <div className="white-background">
            <div className={`card back dark horizontal ${card.classicon || card.class} ${card.sheet} tier${card.tier}`}>
              <div className="contents">
                <h1>{card.class}</h1>
                {healthCounter(MAX_COUNTER_HEALTH, true)}
                {card.naming && <div className="naming">{card.naming}</div>}
                <div className="tier">{romanize(card.tier)}</div>
              </div>
            </div>
          </div>
        );
      case 'Helper':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{translate(card.sheet, translations)}</h1>
            </div>
          </div>
        );
      case 'Loot':
        return (
          <div className={`card back vertical ${card.sheet} tier${card.tier}`}>
            <div className="contents">
              <h1>{translate(card.sheet, translations)}</h1>
              <div className="tier">{romanize(card.tier)}</div>
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      case 'Persona':
        return (
          <div className={`card back horizontal ${card.sheet}`}>
            <div className="contents">
              <h1>{translate(card.sheet, translations)}</h1>
              {card.naming && <div className="naming">{card.naming}</div>}
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

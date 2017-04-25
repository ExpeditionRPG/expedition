import * as React from 'react'
import {icon, camelCase, romanize, horizontalCounter, healthCounter, lootCounter} from '../../helpers'
import {CardProps} from '../../components/Card'


export default class CardFront extends React.Component<CardProps, {}> {
  render() {
    const card = this.props.card;
    const theme = 'UrbanChaos';
    switch (card.sheet) {
      case 'Citizen':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{card.name}</h1>
            </div>
          </div>
        );
      case 'Event':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{card.name}</h1>
            </div>
          </div>
        );
      case 'Proposal':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{card.name}</h1>
            </div>
          </div>
        );
    }
  }
}


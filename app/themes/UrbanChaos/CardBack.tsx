import * as React from 'react'
import {CardType} from '../../reducers/StateTypes'


export default class CardBack extends React.Component<CardType, {}> {
  render() {
    const card = this.props.card;
    const theme = 'UrbanChaos';
    switch (card.sheet) {
      case 'Citizen':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{card.sheet}</h1>
            </div>
          </div>
        );
      case 'Event':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{card.sheet}</h1>
            </div>
          </div>
        );
      case 'Politics':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <h1>{card.sheet}</h1>
            </div>
          </div>
        );
      case 'Reference':
        return (
          <div className={`card back vertical ${card.sheet}`}>
            <div className="contents">
              <article>
                <h3>End of year:</h3>
                <p>Vote on bills and score</p>
                <p>Draw 1 influence + 2 cards</p>
                <p>Draft citizens</p>
                <p>Update city resources</p>
                <p>Event!</p>
                <p>Collect taxes ($20M/player)</p>
                <p>Pass the chair</p>
              </article>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

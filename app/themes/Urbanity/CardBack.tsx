import * as React from 'react'
import {CardType} from '../../reducers/StateTypes'


export default class CardBack extends React.Component<CardType, {}> {
  render() {
    const card = this.props.card;
    const theme = 'Urbanity';
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
                <p>Draw back to 7 cards</p>
                <p>Update city resources</p>
                <p>Draft citizens</p>
                <p>Event</p>
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

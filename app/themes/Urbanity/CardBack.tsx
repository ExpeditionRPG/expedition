import * as React from 'react'
import {icon} from '../../helpers'
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
      case 'Crisis':
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
                <h3>Resources:</h3>
                {icon('transportation_small', theme)} transportation<br/>
                {icon('environment_small', theme)} environment<br/>
                {icon('health_small', theme)} health<br/>
                {icon('education_small', theme)} education<br/>
                {icon('jobs_small', theme)} jobs<br/>
              </article>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

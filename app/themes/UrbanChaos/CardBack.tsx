import * as React from 'react'
import {icon} from '../../helpers'
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
                <p>Check ongoings</p>
                <p>Vote on policies</p>
                <p>Score</p>
                <p>Reset cubes + policies</p>
                <p>Collect taxes ($20M/player)</p>
                <p>Pass the chair</p>
                <p>&nbsp;</p>
                <h3>Resources:</h3>
                {icon(theme, 'transportation_small')} transportation<br/>
                {icon(theme, 'environment_small')} environment<br/>
                {icon(theme, 'health_small')} health<br/>
                {icon(theme, 'education_small')} education<br/>
                {icon(theme, 'jobs_small')} jobs<br/>
              </article>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

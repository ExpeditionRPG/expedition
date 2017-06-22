import * as React from 'react'
import {icon} from '../../helpers'
import {CardType} from '../../reducers/StateTypes'


export default class CardFront extends React.Component<CardType, {}> {
  render() {
    const card = this.props.card;
    const theme = 'UrbanChaos';
    switch (card.sheet) {
      case 'Citizen':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div className="score">
                  <div className={`scorePlus ${card.scorePlusMult}`}>{card.scorePlus}</div>
                  {card.scoreMinus && <div className="scoreMinus">{card.scoreMinus}</div>}
                  {card.scoreRule && <div className="scoreRule">{card.scoreRule}</div>}
                </div>
              </article>
              <footer>
                <div>{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
      case 'Event':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div className="effects">{card.effects}</div>
              </article>
              <footer>
                <div>{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
      case 'Politics':
        return (
          <div className={`card front vertical ${card.sheet} ${card.committee}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
                <div className="type">{card.type}{card.secondary && ` - ${card.secondary}`}</div>
                {card.cost !== null && <span className="costs">
                  {card.cost < 0 && <span className="save">+${-1 * card.cost}M</span>}
                  {card.cost === 0 && <span className="save">$0M</span>}
                  {card.cost > 0 && <span className="spend">-${card.cost}M</span>}
                  &nbsp;&nbsp;
                </span>}
              </header>
              <article>
                <div className="score">
                  {card.scorePlus1 && <div className="scorePlus"><span>{card.scorePlus1}</span><span>{card.scorePlus2}</span></div>}
                  {card.scoreMinus && <div className="scoreMinus">{card.scoreMinus}</div>}
                </div>
                {card.effects && <div className="effects">{card.effects}</div>}
              </article>
              <footer>
                <div>{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
      case 'Reference':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <article>
                <h3>End of quarter:</h3>
                <p>Bundle policies into bills</p>
                <p>Increment quarter tracker</p>
                <p>End of year: resolve (see back)</p>
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

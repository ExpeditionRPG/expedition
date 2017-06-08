import * as React from 'react'
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
                  <div className={`scorePlus ${card.scorePlusMult}`} dangerouslySetInnerHTML={{__html: card.scorePlus}}></div>
                  {card.scoreMinus && <div className="scoreMinus"><span dangerouslySetInnerHTML={{__html: card.scoreMinus}}></span></div>}
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
                <div className="effects" dangerouslySetInnerHTML={{__html: card.effects}}></div>
              </article>
              <footer>
                <div>{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
      case 'Politics':
// <div className="advocates">Advocates</div>
        return (
          <div className={`card front vertical ${card.sheet} ${card.committee}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
                <div className="type">{card.type}{card.committee && <span className="committee"> - {card.committee}</span>}</div>
                {card.cost !== 0 && card.cost && <span className="costs">
                  {card.cost < 0 && <span className="save">+${-1 * card.cost}M</span>}
                  {card.cost > 0 && <span className="spend">-${card.cost}M</span>}
                  &nbsp;&nbsp;
                </span>}
              </header>
              <article>
                <div className="score">
                  <div className="scorePlus" dangerouslySetInnerHTML={{__html: card.scorePlus1 + card.scorePlus2}}></div>
                  {card.scoreMinus && <div className="scoreMinus"><span dangerouslySetInnerHTML={{__html: card.scoreMinus}}></span></div>}
                </div>
                {card.effects && <div className="effects" dangerouslySetInnerHTML={{__html: card.effects}}></div>}
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
                <h3>Each quarter, one of:</h3>
                <p>Draw 3 politics cards (max 5)</p>
                <p>Discard 1 citizen to draw 2 and keep 1</p>
                <p>Propose a policy</p>
                <p>&nbsp;</p>
                <h3>After all players:</h3>
                <p>Increment quarter tracker</p>
                <p>If end of year, resolve year</p>
              </article>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

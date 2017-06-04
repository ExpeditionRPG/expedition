import * as React from 'react'
import {CardProps} from '../../components/Card'


export default class CardFront extends React.Component<CardProps, {}> {
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
                <div>{card.effect}</div>
              </article>
              <footer>
                <div>{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
      case 'Policy':
        return (
          <div className={`card front vertical ${card.sheet} ${card.committee}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
                {card.cost !== 0 && card.cost && <span className="costs">
                  {card.cost < 0 && <span className="save">+${-1 * card.cost}M</span>}
                  {card.cost > 0 && <span className="spend">-${card.cost}M</span>}
                  &nbsp;&nbsp;
                </span>}
                <span className="committee">{card.committee}{card.committee === 'Finance' && ' (Any committee)'}</span>
              </header>
              <article>
                <div className="score">
                  <div className="scorePlus" dangerouslySetInnerHTML={{__html: card.scorePlus1 + card.scorePlus2}}></div>
                  {card.scoreMinus && <div className="scoreMinus"><span dangerouslySetInnerHTML={{__html: card.scoreMinus}}></span></div>}
                </div>
                {card.effects && <div className="effects" dangerouslySetInnerHTML={{__html: card.effects}}></div>}
              </article>
              <div className="advocates">
                <div className="for">(+) Advocates pro</div>
                <div className="against">Advocates con (-)</div>
              </div>
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
                <h3>Each turn, one of:</h3>
                <p>Draw 3 proposals (max 7)</p>
                <p>Discard 1 citizen to draw 2 and keep 1</p>
                <p>Put forth a proposal</p>
                <p>Place advocates on a proposal</p>
                <p>&nbsp;</p>
                <h3>After all players:</h3>
                <p>Increment turn tracker</p>
                <p>If end of year, resolve year</p>
              </article>
            </div>
          </div>
        );
    }
  }
}

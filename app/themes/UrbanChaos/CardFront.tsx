import * as React from 'react'
import {icon, iconString, camelCase, romanize, horizontalCounter, healthCounter, lootCounter} from '../../helpers'
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
                  Scores one point when: <span dangerouslySetInnerHTML={{__html: card.score}}></span>
                </div>
              </article>
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
      case 'Proposal':
        return (
          <div className={`card front vertical ${card.sheet} ${card.committee}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
                <div className="committee">{card.committee}</div>
              </header>
              <article>
                <div className="costs">
                  {card.cost < 0 && <span className="save">Saves (+) ${-1 * card.cost}M</span>}
                  {card.cost > 0 && <span className="spend">Costs (-) ${card.cost}M</span>}
                </div>
                <div className="effects" dangerouslySetInnerHTML={{__html: card.effects}}></div>
              </article>
              <footer>
                <div>{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
    }
  }
}


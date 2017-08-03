import * as React from 'react'
import {icon} from '../../helpers'
import {CardType} from '../../reducers/StateTypes'


export default class CardFront extends React.Component<CardType, {}> {
  render() {
    const card = this.props.card;
    const theme = 'Urbanity';
    switch (card.sheet) {
      case 'Citizen':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <header>
                <div className="name">{card.scoreBlack} {card.name}</div>
                <div className="type">Citizen</div>
              </header>
              <article>
                <div className="score">
                  {card.scoreBlack === 'plus' && <div className="scoreBlack plus">+</div>}
                  {card.scoreBlack !== 'plus' && <div className="scoreBlack">{card.scoreBlack}</div>}
                  {card.scoreRed === 'minus' && <div className="scoreRed minus">-</div>}
                  {card.scoreRed !== 'minus' && <div className="scoreRed">{card.scoreRed}</div>}
                  {card.scoreText && <div className="scoreText">{card.scoreText}</div>}
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
        let budget = null;
        if (card.cost !== null) {
          budget = [];
          if (card.cost > 0) {
            for (let i = card.cost; i > 0; i--) {
              budget.push(<span className="budgetBlack">+</span>);
            }
          } else if (card.cost < 0) {
            for (let i = card.cost; i < 0; i++) {
              budget.push(<span className="budgetRed">-</span>);
            }
          }
        }
        return (
          <div className={`card front vertical ${card.sheet} ${card.type}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
                <div className="icons">
                  {budget}
                  {card.scoreBlack1 && <span className="scoreBlack">{card.scoreBlack1}</span>}
                  {card.scoreBlack2 && <span className="scoreBlack">{card.scoreBlack2}</span>}
                  {card.scoreRed1 && <span className="scoreRed">{card.scoreRed1}</span>}
                  {card.scoreRed2 && <span className="scoreRed">{card.scoreRed2}</span>}
                </div>
                <div className="type">{card.type}</div>
              </header>
              <article>
                <div className="score">
                  {card.scoreBlack1 && <div className="scoreBlack"><span>{card.scoreBlack1}</span><span>{card.scoreBlack2}</span></div>}
                  {card.scoreRed1 && <div className="scoreRed"><span>{card.scoreRed1}</span><span>{card.scoreRed2}</span></div>}
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
                <h3>Each Session</h3>
                <p>Discard politics of your choice, draw back up to 7.</p>
                <p>Draw 1 influence.</p>
                <p>Event!</p>
                <p>Draft pick back to 4 citizens.</p>
                <p>4 turns: simulatenous action, bundle bills</p>
                <p>Vote on each bill</p>
                <p>Reveal citizens, score</p>
                <p>Discard policies, citizens</p>
                <p>Pass the chairperson</p>
              </article>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

import * as React from 'react'
import {icon, camelCase, romanize, horizontalCounter, healthCounter, lootCounter} from '../../helpers'
import {CardProps} from '../../components/Card'


export default class CardFront extends React.Component<CardProps, {}> {
  render() {
    const card = this.props.card;
    const theme = 'UrbanChaos';
    switch (card.sheet) {
      case 'Citizen':
// commuteUse  transitBike transitBus  transitCar  transitWalk traits
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div>{card.age} yr old {card.race} {card.gender}</div>
                <div>Work: {card.occupation}</div>
                <div>Education: {card.education}</div>
                <div>Income: {card.income}</div>
                <div>{card.relationship}</div>
                {card.commuteLocation !== "Local" && <div>Lives in {card.location}, works in {card.commuteLocation}</div>}
                {card.commuteLocation === "Local" && <div>Lives and works in {card.location}</div>}
                <div>Traits:</div>
                <div className="traits" dangerouslySetInnerHTML={{__html: card.traits}}></div>
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
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div>${card.cost}M {card.resources && (' and ' + card.resources)}</div>
                <div dangerouslySetInnerHTML={{__html: card.effects}}></div>
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


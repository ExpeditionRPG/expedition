import * as React from 'react'
import {icon, camelCase, romanize, horizontalCounter, healthCounter, lootCounter} from '../../helpers'
import {CardProps} from '../../components/Card'


export default class CardFront extends React.Component<CardProps, {}> {
  render() {
    const card = this.props.card;
    const theme = 'BlackAndWhite';
    switch (card.sheet) {
      case 'Ability':
        return (
          <div className={`card front vertical ${card.sheet} ${card.class}`} id={camelCase(name)}>
            <div className="contents">
              <header>
                <div className="typeicon" dangerouslySetInnerHTML={{__html: card.typeicon}}></div>
                <div className="name">{card.name}</div>
                <div className="classicon">
                  <div className="icon">{icon(theme, card.class.toLowerCase() + '_small')}</div>
                </div>
              </header>
              <article>
                <div className="indicators">
                  <div className="risk">
                    <strong>{icon(theme, 'd20_small')} <span className="symbol">&ge;</span> {card.risk}</strong>
                  </div>
                  <div className="target">
                    {icon(theme, 'target_small')} {card.target}
                  </div>
                </div>
                <div className="preamble">
                  <div className="hit">
                    <strong>Success: </strong>
                    <span dangerouslySetInnerHTML={{__html: card.hit}}></span>
                    <br className="padded" />
                  </div>
                  {card.abilitytext &&
                    <div>
                      <span dangerouslySetInnerHTML={{__html: card.abilitytext}}></span>
                      <br className="padded" />
                    </div>
                  }
                </div>
                <div className="rng">
                  {card.crithit &&
                    <div className="crithit">
                      <strong>{icon(theme, 'd20_small')} <span className="symbol">&ge;</span> 20:</strong> <span dangerouslySetInnerHTML={{__html: card.crithit}}></span>
                      <br className="padded" />
                    </div>
                  }
                  {card.miss &&
                    <div className="miss">
                      <strong>{icon(theme, 'd20_small')} <span className="symbol">&lt;</span> {card.risk}:</strong> <span dangerouslySetInnerHTML={{__html: card.miss}}></span>
                      <br className="padded" />
                    </div>
                  }
                  {card.critmiss &&
                    <div className="critmiss">
                      <strong>{icon(theme, 'd20_small')} <span className="symbol">&le;</span> 1:</strong> <span dangerouslySetInnerHTML={{__html: card.critmiss}}></span>
                    </div>
                  }
                </div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
              </footer>
            </div>
          </div>
        );
      case 'Adventurer':
        return (
          <div className={`card front horizontal ${card.sheet} bottomBar`} id={camelCase(card.name)}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div className="adventurertext" ><div className="child">
                  <div>
                    <strong>Starting abilities:</strong>
                    <br className="padded" />
                    <span dangerouslySetInnerHTML={{__html: card.startingabilities}}></span>
                  </div>
                </div></div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
                <div className="counter counter-horizontal">
                  {icon(theme, 'health_small')}
                  {horizontalCounter(12)}
                </div>
              </footer>
            </div>
          </div>
        );
      case 'Encounter':
        return (
          <div className="white-background">
            <div className={`card front dark horizontal ${card.sheet} ${card.class} tier${card.tier} ${card.health > 10 && 'bottomBar'} ${card.health === 10 && 'hp10'}`}>
              <div className="contents">
                <header>
                  <div className="health">{icon(theme, 'health_small')} {card.health}</div>
                  <div className="name">{card.name}</div>
                </header>
                <article>
                  <div className="type">Tier {romanize(card.tier)} {card.class}</div>
                  {card.ongoing1 &&
                    <div className="ongoing" dangerouslySetInnerHTML={{__html: card.ongoing1}}></div>
                  }
                  {card.ongoing2 &&
                    <div className="ongoing2" dangerouslySetInnerHTML={{__html: card.ongoing2}}></div>
                  }
                  {card.surge &&
                    <div className="surge"><strong>Surge: </strong><span dangerouslySetInnerHTML={{__html: card.surge}}></span></div>
                  }
                </article>
                <footer>
                  <div className="flavortext">{card.flavortext}</div>
                </footer>
                {healthCounter(card.health)}
              </div>
            </div>
          </div>
        );
      case 'Helper':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <article>
                <div className="item">{icon(theme, 'health_small')} Health / regain health</div>
                <div className="item">{icon(theme, 'd20_small')} A D20 die roll</div>
                <div className="item">{icon(theme, 'target_small')} Unique target(s)</div>
                <div className="item">{icon(theme, 'damage_small')} Damage / attack</div>
                <div className="item">{icon(theme, 'melee_small')} Melee abilities</div>
                <div className="item">{icon(theme, 'ranged_small')} Ranged abilities</div>
                <div className="item">{icon(theme, 'magic_small')} Magic abilities</div>
                <div className="item">{icon(theme, 'music_small')} Music abilities</div>
                <div className="item">{icon(theme, 'cards_small')} Drawing / playing cards</div>
                <br />
                <div className="item"><strong>I/II/III/IV</strong> &nbsp;Tier</div>
              </article>
            </div>
          </div>
        );
      case 'Loot':
        return (
          <div className={`card front vertical ${card.sheet} tier${card.tier} ${card.tracker && 'tracker'} ${card.tracker > 14 && 'bottomBar'}`} id="{{camelCase name }}">
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div className="indicators">
                  <div>{card.numberuses}</div>
                  <div>{card.usewhen}</div>
                </div>
                <br className="padded" />
                <div className="abilitytext" dangerouslySetInnerHTML={{__html: card.text}}></div>
                <div className="rng" dangerouslySetInnerHTML={{__html: card.roll}}></div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
              </footer>
              {card.tracker && lootCounter(card.tracker)}
            </div>
          </div>
        );
    }
  }
}


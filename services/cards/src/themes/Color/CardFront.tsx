import * as React from 'react';
import {MAX_ADVENTURER_HEALTH} from '../../Constants';
import {camelCase, healthCounter, horizontalCounter, icon, lootCounter, romanize} from '../../helpers';
import {CardType} from '../../reducers/StateTypes';

export default class CardFront extends React.Component<CardType, {}> {
  public render() {
    const card = this.props.card;
    switch (card.sheet) {
      case '-Title':
        return (
          <div className={`card front vertical ${card.sheet} title-${card.image}`}>
            <div className="contents">
              <div className="UPC">
                <img src={`/images/cards/fronts/UPC${card.image}.svg`} />
              </div>
            </div>
          </div>
        );
      case 'Ability':
        return (
          <div className={`card front vertical ${card.sheet} ${card.class}`} id={camelCase(name)}>
            <div className="contents">
              <header>
                <div className="typeicon">{card.typeicon}</div>
                <div className="name">{card.name}</div>
                <div className="classicon">
                  <div className="icon">{icon(card.class.toLowerCase() + '_small')}</div>
                </div>
              </header>
              <article>
                <div className="indicators">
                  <div className="risk">
                    <strong>{icon('d20_small')} <span className="symbol">&ge;</span> {card.risk}</strong>
                  </div>
                  <div className="target">
                    <strong>{icon('target_small')}</strong> {card.target}
                  </div>
                </div>
                <div className="preamble">
                  <div className="hit">
                    <strong>Success: </strong>
                    {card.hit}
                    <br className="padded" />
                  </div>
                  {card.abilitytext &&
                    <div>
                      {card.abilitytext}
                      <br className="padded" />
                    </div>
                  }
                </div>
                <div className="rng">
                  {card.crithit &&
                    <div className="crithit">
                      <strong>{icon('d20_small')} <span className="symbol">&ge;</span> 20:</strong> {card.crithit}
                      <br className="padded" />
                    </div>
                  }
                  {card.miss &&
                    <div className="miss">
                      <strong>{icon('d20_small')} <span className="symbol">&lt;</span> {card.risk}:</strong> {card.miss}
                      <br className="padded" />
                    </div>
                  }
                  {card.critmiss &&
                    <div className="critmiss">
                      <strong>{icon('d20_small')} <span className="symbol">&le;</span> 1:</strong> {card.critmiss}
                    </div>
                  }
                </div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
              </footer>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
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
                    {card.startingabilities}
                  </div>
                </div></div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
                <div className="counter counter-horizontal">
                  {icon('health_small')}
                  {horizontalCounter(card.health || MAX_ADVENTURER_HEALTH)}
                </div>
              </footer>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
            </div>
          </div>
        );
      case 'Encounter':
        return (
          <div className={`card front dark horizontal ${card.sheet} ${card.class} tier${card.tier} ${card.health > 10 && 'bottomBar'} ${card.health === 10 && 'hp10'}`}>
            <div className="contents">
              <header>
                <div className="health">{icon('health_small')} {card.health}</div>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div className="type">Tier {romanize(card.tier)} {card.class}</div>
                {card.ongoing1 &&
                  <div className="ongoing">{card.ongoing1}</div>
                }
                {card.ongoing2 &&
                  <div className="ongoing2">{card.ongoing2}</div>
                }
                {card.surge &&
                  <div className="surge"><strong>Surge: </strong>{card.surge}</div>
                }
              </article>
              {card.image && <div className="art">{icon(card.image)}</div>}
              <footer>
                <div className="flavortext">{card.flavortext}</div>
              </footer>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
              {healthCounter(card.health)}
            </div>
          </div>
        );
      case 'Helper':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <article>
                <div className="item">{icon('health_small')} Health / regain health</div>
                <div className="item">{icon('d20_small')} A D20 die roll</div>
                <div className="item">{icon('target_small')} Unique target(s)</div>
                <div className="item">{icon('damage_small')} Damage / attack</div>
                <div className="item">{icon('melee_small')} Melee abilities</div>
                <div className="item">{icon('ranged_small')} Ranged abilities</div>
                <div className="item">{icon('magic_small')} Magic abilities</div>
                <div className="item">{icon('music_small')} Music abilities</div>
                <div className="item">{icon('cards_small')} Drawing / playing cards</div>
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
                  <div>Tier {card.tier} loot</div>
                  <div>{card.numberuses}</div>
                  <div>{card.usewhen}</div>
                </div>
                <br className="padded" />
                <div className="abilitytext">{card.text}</div>
                <div className="rng">{card.roll}</div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
              </footer>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
              {card.tracker && lootCounter(card.tracker)}
            </div>
          </div>
        );
      case 'Persona':
        return (
          <div className={`card front horizontal ${card.sheet}`}>
            <div className="contents">
              <article>
                <table>
                  <tbody>
                    <tr><td>Max</td><td><strong>{card.empowered}: </strong>{card.power}</td></tr>
                    <tr className="personaMarker personaMarkerTop"><td>△</td></tr>
                    <tr><td>Base</td><td><strong>{card.base}</strong>&nbsp;&nbsp;(Type: {card.class})</td></tr>
                    <tr className="personaMarker personaMarkerBottom"><td>▽</td></tr>
                    <tr><td>Min</td><td><strong>{card.afflicted}: </strong>{card.affliction}</td></tr>
                  </tbody>
                </table>
              </article>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
            </div>
          </div>
        );
      case 'Skill':
        return (
          <div className={`card front horizontal ${card.sheet} bottomBar`} id={camelCase(card.name)}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
                <div className="class">Type: {card.class}</div>
              </header>
              <article>
                <div className="discard"><strong>Single use:</strong> {card.discard}</div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
                <div className="counter counter-horizontal level">
                  Level: {horizontalCounter(card.progression)}
                </div>
              </footer>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

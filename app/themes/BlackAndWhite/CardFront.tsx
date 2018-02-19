import * as React from 'react'
import {icon, camelCase, romanize, horizontalCounter, healthCounter, lootCounter, translate, translateTier} from '../../helpers'
import {CardType} from '../../reducers/StateTypes'
import {MAX_ADVENTURER_HEALTH} from '../../Constants'


export default class CardFront extends React.Component<CardType, {}> {
  render() {
    const card = this.props.card;
    const translations = this.props.translations;
    const theme = 'BlackAndWhite';
    switch (card.sheet) {
      case 'Ability':
        return (
          <div className={`card front vertical ${card.sheet} ${card.classicon || card.class}`} id={camelCase(name)}>
            <div className="contents">
              <header>
                <div className="typeicon">{card.typeicon}</div>
                <div className="name">{card.name}</div>
                <div className="classicon">
                  <div className="icon">{icon((card.classicon || card.class).toLowerCase() + '_small')}</div>
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
                    <strong>{translate('Success', translations)}: </strong>
                    <span>{card.hit}</span>
                    <br className="padded" />
                  </div>
                  {card.abilitytext &&
                    <div>
                      <span>{card.abilitytext}</span>
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
                    <strong>{translate('Starting Abilities', translations)}:</strong>
                    <br className="padded" />
                    {card.startingabilities}
                  </div>
                </div></div>
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
                <div className="counter counter-horizontal">
                  {icon('health_small')}
                  {horizontalCounter(MAX_ADVENTURER_HEALTH)}
                </div>
              </footer>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
            </div>
          </div>
        );
      case 'Encounter':
        return (
          <div className="white-background">
            <div className={`card front dark horizontal ${card.sheet} ${card.classicon || card.class} tier${card.tier} ${card.health > 10 && 'bottomBar'} ${card.health === 10 && 'hp10'}`}>
              <div className="contents">
                <header>
                  <div className="health">{icon('health_small')} {card.health}</div>
                  <div className="name">{card.name}</div>
                </header>
                <article>
                  <div className="type">{translateTier(card.tier, card.classicon || card.class, translations)}</div>
                  {card.ongoing1 &&
                    <div className="ongoing">{card.ongoing1}</div>
                  }
                  {card.ongoing2 &&
                    <div className="ongoing2">{card.ongoing2}</div>
                  }
                  {card.surge &&
                    <div className="surge"><strong>{translate('Surge', translations)}: </strong>{card.surge}</div>
                  }
                </article>
                {card.image && <img className="art" src={`/expedition-art/icons/${card.image}.png`} />}
                <footer>
                  <div className="flavortext">{card.flavortext}</div>
                </footer>
                {healthCounter(card.health)}
                {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
              </div>
            </div>
          </div>
        );
      case 'Helper':
        return (
          <div className={`card front vertical ${card.sheet}`}>
            <div className="contents">
              <article>
                <div className="item">{icon('health_small')} {translate('Health / Regain Health', translations)}</div>
                <div className="item">{icon('d20_small')} {translate('A D20 die roll', translations)}</div>
                <div className="item">{icon('target_small')} {translate('Unique target(s)', translations)}</div>
                <div className="item">{icon('damage_small')} {translate('Damage / Attack', translations)}</div>
                <div className="item">{icon('melee_small')} {translate('Melee abilities', translations)}</div>
                <div className="item">{icon('ranged_small')} {translate('Ranged abilities', translations)}</div>
                <div className="item">{icon('magic_small')} {translate('Magic abilities', translations)}</div>
                <div className="item">{icon('music_small')} {translate('Music abilities', translations)}</div>
                <div className="item">{icon('cards_small')} {translate('Drawing / Playing cards', translations)}</div>
                <br />
                <div className="item"><strong>I/II/III/IV</strong> &nbsp;{translate('Tier', translations)}</div>
              </article>
            </div>
          </div>
        );
      case 'Loot':
        return (
          <div className={`card front vertical ${card.sheet} tier${card.tier} ${card.tracker && 'tracker'} ${card.tracker > 14 && 'bottomBar'}`} id={camelCase(name)}>
            <div className="contents">
              <header>
                <div className="name">{card.name}</div>
              </header>
              <article>
                <div className="indicators">
                  <div>{translateTier(card.tier, 'Loot', translations)}</div>
                  <div className="numUses">{card.numberuses}</div>
                  <div className="useWhen">{card.usewhen}</div>
                </div>
                <br className="padded" />
                <div className="abilitytext">{card.text}</div>
                {card.roll && <div className="rng">{card.roll}</div>}
              </article>
              <footer>
                <div className="flavortext">{card.flavortext}</div>
              </footer>
              {card.tracker && lootCounter(card.tracker)}
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
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
                    <tr><td>{translate('Max', translations)}</td><td><strong>{card.empowered}: </strong>{card.power}</td></tr>
                    <tr className="personaMarker personaMarkerTop"><td>△</td></tr>
                    <tr><td>{translate('Base', translations)}</td><td><strong>{card.base}</strong>&nbsp;&nbsp;({translate('Type', translations)}: {card.class})</td></tr>
                    <tr className="personaMarker personaMarkerBottom"><td>▽</td></tr>
                    <tr><td>{translate('Min', translations)}</td><td><strong>{card.afflicted}: </strong>{card.affliction}</td></tr>
                  </tbody>
                </table>
              </article>
              {card.expansion && <div className="expansionIcon">{icon(card.expansion)}</div>}
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}

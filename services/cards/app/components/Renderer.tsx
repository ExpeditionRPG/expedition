import * as React from 'react'

import {POKER_CARDS_PER_LETTER_PAGE} from '../Constants'
import {CardType, FiltersState, TranslationsType} from '../reducers/StateTypes'

declare var require: any;
const SVGInjector = require('svg-injector') as any;

const CardBacks: any = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardBack.tsx'),
  Color: require('../themes/Color/CardBack.tsx'),
  Urbanity: require('../themes/Urbanity/CardBack.tsx'),
};
const CardFronts: any = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardFront.tsx'),
  Color: require('../themes/Color/CardFront.tsx'),
  Urbanity: require('../themes/Urbanity/CardFront.tsx'),
};


export interface RendererStateProps {
  cards: CardType[] | null;
  filters: FiltersState;
  translations: TranslationsType | null;
}

export interface RendererProps extends RendererStateProps {};

class Renderer extends React.Component<RendererProps, {}> {
  render() {
    const cards = this.props.cards || [];
    const renderSettings = { // defaults
      bleed: false,
      cardsPerPage: POKER_CARDS_PER_LETTER_PAGE,
      showFronts: true,
      showBacks: true,
      showInstructions: false,
      theme: this.props.filters.theme.current || 'BlackAndWhite',
      uniqueBacksOnly: false,
    };
    switch (this.props.filters.export.current) {
      case 'PrintAndPlay':
      renderSettings.showInstructions = true;
        break;
      case 'WebView':
        renderSettings.cardsPerPage = 999; // TODO this requires some CSS / class changes...
        renderSettings.showBacks = false;
        break;
      case 'DriveThruCards':
        renderSettings.cardsPerPage = 1;
        renderSettings.bleed = true;
        break;
      case 'AdMagicFronts':
        renderSettings.cardsPerPage = 1;
        renderSettings.showBacks = false;
        renderSettings.bleed = true;
        break;
      case 'AdMagicBacks':
        renderSettings.cardsPerPage = 1;
        renderSettings.showFronts = false;
        renderSettings.uniqueBacksOnly = true;
        renderSettings.bleed = true;
        break;
      case 'FrontsOnly':
        renderSettings.showBacks = false;
        break;
      default:
        break;
    }

    // Bugfix 2/18/18 - if you render elements with the same ID (aka incrementing integers) when their contents change
    // (aka source change), React gets confused; hence IDs based on card.name when possible
    const CardBack = CardBacks[renderSettings.theme].default;
    const CardFront = CardFronts[renderSettings.theme].default;
    const frontPageList = [] as JSX.Element[][];
    const backPageList = [] as JSX.Element[][];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (i === 0 || i % renderSettings.cardsPerPage === 0) {
        frontPageList.push([]);
        backPageList.push([]);
      }
      if (renderSettings.showFronts) {
        frontPageList[frontPageList.length-1].push(<CardFront key={card.name || i} card={card} translations={this.props.translations}></CardFront>);
      }
      if (renderSettings.showBacks) {
        if (renderSettings.uniqueBacksOnly && i > 0) {
          if (card.naming !== '' || card.class !== cards[i-1].class || card.tier !== cards[i-1].tier) {
            backPageList[backPageList.length-1].push(<CardBack key={card.name || i} card={card} translations={this.props.translations}></CardBack>);
          }
        } else {
          backPageList[backPageList.length-1].push(<CardBack key={card.name || i} card={card} translations={this.props.translations}></CardBack>);
        }
      }
    }
    const frontPages = frontPageList.map((cardPage, i) => {
      return <div key={i} className="page fronts">{cardPage}</div>;
    });
    const backPages = backPageList.map((cardPage, i) => {
      return <div key={i + frontPages.length} className="page backs">{cardPage}</div>;
    });
    const pages = [];
    while (frontPages.length > 0) {
      pages.push(frontPages.shift());
      pages.push(backPages.shift());
    }
    // Timeout pushes it to the back of the stack so that it's run after the new contents
    // have been rendered to the page
    setTimeout(() => {
      SVGInjector(document.querySelectorAll('img.svg'), {});
    }, 1);

    return (
      <div id="renderer" className={renderSettings.theme + ' ' + this.props.filters.export.current + (renderSettings.bleed ? ' bleed' : '') }>
        {renderSettings.showInstructions &&
          <div>
            <div className="printInstructions">
              <h1>Expedition: The Roleplaying Card Game</h1>
              <h2>The adventurer's guide to printing</h2>
              <div className="halfWidth">
                <p><strong>Before you begin:</strong> Many printers (especially consumer printers) don't handle front-back alignment well. You may end up with up to a 1/8" offset between the front and back of cards. If you think this will bug you, you can buy a professionally printed full-color copy at ExpeditionGame.com/store for just $30.</p>
                <ol>
                  <li>Download this PDF and take it to your local print shop.</li>
                  <li>Have it printed on heavy white cardstock (ideally 80-pound or heavier).</li>
                  <li>Make sure to print double-sided, and to set to document to 100% zoom.</li>
                  <li>Cut the cards using a paper cutter. The more precise you are, the easier they'll be to handle later.</li>
                  <li>Secure your cards with a box or rubber band.</li>
                  <li>Accessories: You'll need at least a dozen tracking clips (such as paper clips) and a d20 die.</li>
                  <li>Rules: All of the rules are in the app! Get it for web, Android and iOS at ExpeditionGame.com/app</li>
                  <li>That's all it takes - now prepare to adventure!</li>
                </ol>
              </div>
            </div>
            <div className="printInstructions">
              <p className="topAlert">Save paper by printing pages 3+.</p>
              <div className="fullWidth">
                <h3>Terms of Use</h3>
                <p>We hope you enjoy your adventures!</p>
                <p>Expedition is free to use under the Creative Commons BY-NC-SA 4.0 license. You can read more about the license at http://creativecommons.org/licenses/by-nc-sa/4.0/.</p>
                <p>These are the terms of the copyright:</p>
                <p><strong>Attribution:</strong> You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.</p>
                <p><strong>NonCommercial:</strong> You may not use the material for commercial purposes.</p>
                <p><strong>ShareAlike:</strong> If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.</p>
                <p>You must also comply with the Laws of Man and Nature. Do not use any form of this game for nefarious purposes like libel, slander, copyright infringement or harassment. If you break the law and get in trouble for it, Expedition is free of all liability.</p>
              </div>
            </div>
          </div>
        }
        {pages}
      </div>
    );
  }
}

export default Renderer;

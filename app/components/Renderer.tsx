import * as React from 'react'

declare var require: any;
const SVGInjector = require('svg-injector') as any;

const CardBacks: any = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardBack.tsx'),
  Color: require('../themes/Color/CardBack.tsx'),
  UrbanChaos: require('../themes/UrbanChaos/CardBack.tsx'),
};
const CardFronts: any = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardFront.tsx'),
  Color: require('../themes/Color/CardFront.tsx'),
  UrbanChaos: require('../themes/UrbanChaos/CardFront.tsx'),
};


export interface RendererStateProps {
  cards: any;
  filters: any;
}

export interface RendererDispatchProps {
}

export interface RendererProps extends RendererStateProps, RendererDispatchProps {};

class Renderer extends React.Component<RendererProps, {}> {
  render() {
    const cards = this.props.cards || [];
    const renderSettings = { // defaults
      bleed: false,
      cardsPerPage: 9,
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

    const CardBack = CardBacks[renderSettings.theme].default;
    const CardFront = CardFronts[renderSettings.theme].default;
    const frontPageList = [];
    const backPageList = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (i === 0 || i % renderSettings.cardsPerPage === 0) {
        frontPageList.push([]);
        backPageList.push([]);
      }
      if (renderSettings.showFronts) {
        frontPageList[frontPageList.length-1].push(<CardFront key={i} card={card}></CardFront>);
      }
      if (renderSettings.showBacks) {
        if (renderSettings.uniqueBacksOnly && i > 0) {
          if (card.naming !== '' || card.class !== cards[i-1].class || card.tier !== cards[i-1].tier) {
            backPageList[backPageList.length-1].push(<CardBack key={i} card={card}></CardBack>);
          }
        } else {
          backPageList[backPageList.length-1].push(<CardBack key={i} card={card}></CardBack>);
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
              <ol>
                <li>Download this PDF and take it to your local print shop.</li>
                <li>Have it printed on heavy white cardstock (usually 80-pound or heavier). Although the cards are black and white, you'll get nicer results on a color printer.</li>
                <li>Make sure to print double-sided, and to set to document to 100% zoom.</li>
                <li>Cut the cards using a paper cutter. The more precise you are, the easier they'll be to handle later.</li>
                <li>Secure your cards with a small box or rubber band, and prepare to adventure!</li>
              </ol>
            </div>
            <div className="printInstructions">
              <p className="center">Blank page for printing purposes. Save paper by only printing pages 3+!</p>
            </div>
          </div>
        }
        {pages}
      </div>
    );
  }
}

export default Renderer;

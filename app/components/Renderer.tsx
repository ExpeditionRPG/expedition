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
  renderSettings: any;
}

export interface RendererDispatchProps {
}

export interface RendererProps extends RendererStateProps, RendererDispatchProps {};

class Renderer extends React.Component<RendererProps, {}> {
  render() {
    const cards = this.props.cards || [];
    const renderSettings = this.props.renderSettings;
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
          if (card.naming !== "" || card.class !== cards[i-1].class || card.tier !== cards[i-1].tier) {
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
      <div id="renderArea" className={renderSettings.theme}>
        {pages}
      </div>
    );
  }
}

export default Renderer;

import React from 'react'

declare var require: any;
const SVGInjector = require('svg-injector') as any;

const CardBacks: any = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardBack.tsx'),
  Color: require('../themes/Color/CardBack.tsx'),
};
const CardFronts: any = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardFront.tsx'),
  Color: require('../themes/Color/CardFront.tsx'),
};


export interface RendererStateProps {
  cards: any;
  settings: any;
}

export interface RendererDispatchProps {
}

export interface RendererProps extends RendererStateProps, RendererDispatchProps {};

class Renderer extends React.Component<RendererProps, {}> {
  render() {
    const cards = this.props.cards || [];
    const CardBack = CardBacks[this.props.settings.theme].default;
    const CardFront = CardFronts[this.props.settings.theme].default;
    const frontPageList = [];
    const backPageList = [];
    for (let i = 0; i < cards.length; i++) {
      if (i % this.props.settings.cardsPerPage === 0) {
        frontPageList.push([]);
        backPageList.push([]);
      }
      frontPageList[frontPageList.length-1].push(<CardFront key={i} card={cards[i]}></CardFront>);
      backPageList[backPageList.length-1].push(<CardBack key={i} card={cards[i]}></CardBack>);
    }
    const frontPages = frontPageList.map((cards, i) => {
      return <div key={i} className="page fronts">{cards}</div>;
    });
    const backPages = backPageList.map((cards, i) => {
      return <div key={i + frontPages.length} className="page backs">{cards}</div>;
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
      <div id="renderArea" className={this.props.settings.theme}>
        {pages}
      </div>
    );
  }
}

export default Renderer;

import React from 'react'
import SVGInjector from 'svg-injector'

const CardBacks = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardBack.jsx'),
  Color: require('../themes/Color/CardBack.jsx'),
};
const CardFronts = {
  BlackAndWhite: require('../themes/BlackAndWhite/CardFront.jsx'),
  Color: require('../themes/Color/CardFront.jsx'),
};

export default class RenderArea extends React.Component {
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
    for (let i = 0, l = frontPages.length; i < frontPages.length; i++) {
      pages.push(fron)
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

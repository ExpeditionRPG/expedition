import React from 'react';

export default class AppBar extends React.Component {
  render() {
    return (
      <header id="topbar">
        <a href="https://expeditiongame.com" target="_blank">
          <img id="logo" src="img/logo.svg" />
        </a>
        <button><a href="https://github.com/Fabricate-IO/expedition-cards/blob/master/CARD-CREATION.md" target="_blank">Help</a></button>
        <button><a href="https://expeditiongame.com/contact" target="_blank">Send Feedback</a></button>
        <div id="filters">
          <span id="dynamicFilters"></span>
        </div>
      </header>
    );
  }
}

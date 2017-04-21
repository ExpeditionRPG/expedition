import React from 'react';

import {getStore} from '../Store.jsx';
import AppBar from './AppBar.jsx';


export default class Main extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.getUpdatedState();
    getStore().subscribe(this.handleChange.bind(this));
  }

  getUpdatedState() {
    let state = getStore().getState();
    this.state = getStore().getState();
    return this.state;
  }

  handleChange() {
    this.setState(this.getUpdatedState());
  }

  render() {
    const cards = (this.state.cards.loading) ? null : this.state.cards.filtered.map((card, index) => {
      return <div key={index}>{card.name}</div>;
    });
    return (
      <div>
        <AppBar props={{filters: this.state.filters}} />
        {this.state.cards.loading && <div className="sk-circle" id="loading">
          <div className="sk-circle1 sk-child"></div>
          <div className="sk-circle2 sk-child"></div>
          <div className="sk-circle3 sk-child"></div>
          <div className="sk-circle4 sk-child"></div>
          <div className="sk-circle5 sk-child"></div>
          <div className="sk-circle6 sk-child"></div>
          <div className="sk-circle7 sk-child"></div>
          <div className="sk-circle8 sk-child"></div>
          <div className="sk-circle9 sk-child"></div>
          <div className="sk-circle10 sk-child"></div>
          <div className="sk-circle11 sk-child"></div>
          <div className="sk-circle12 sk-child"></div>
        </div>}
        <div className="printInstructions">
          <img id="instructionLogo" src="img/logo.svg" />
          <h1>The adventurer's guide to printing</h1>
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
        <div id="renderArea" data-theme="official">{cards}</div>
      </div>
    );
  }
}





/*
var Joi = require('joi-browser');

var State = require('./state');
var Helpers = require('./helpers');


(function init() {

  $("#renderArea").hide();

  State.init(function (err, result) {

    if (err) {
      throw err;
    }

    $("#refreshCards").click(function () { State.updateSheets(); });
    $("#setSource").click(function () { setSource(); });
    window.onfocus = function() { State.updateSheets(); };
    $("#renderArea").show();
  });
})();


function setSource () {
  // Official production sheet: https://docs.google.com/spreadsheets/d/1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM/pubhtml
  var sheetWebLink = prompt('Enter your Google Sheet URL (make sure to use the "Publish To Web" option)');

  if (sheetWebLink == null || sheetWebLink == '') {
    return;
  }

  Joi.validate(sheetWebLink, Joi.string().uri(), function (err, value) {

    if (err) {
      return alert (err);
    }

    value = value.replace('https://docs.google.com/spreadsheets/d/', '')
        .replace('/pubhtml', '');
    State.updateState('googleSheetId', value);
  });
}
*/

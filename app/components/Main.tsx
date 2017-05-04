import * as React from 'react'
import AppBarContainer from './AppBarContainer'
import RendererContainer from './RendererContainer'

export interface MainStateProps {
  loading: boolean;
}

export interface MainDispatchProps {
  downloadCards: () => void;
}

export interface MainProps extends MainStateProps, MainDispatchProps {};

class Main extends React.Component<MainProps, {}> {
  componentDidMount() {
    this.props.downloadCards();
  }

  render() {
    return (
      <div>
        <AppBarContainer/>
        {this.props.loading && <div className="sk-circle" id="loading">
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
        <RendererContainer/>
      </div>
    );
  }
}

export default Main;


/*
var Joi = require('joi-browser');

var State = require('./state');
var Helpers = require('./helpers');


(function init() {

  $("#renderArea").hide();

  props.init(function (err, result) {

    if (err) {
      throw err;
    }

    $("#refreshCards").click(function () { props.updateSheets(); });
    $("#setSource").click(function () { setSource(); });
    window.onfocus = function() { props.updateSheets(); };
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
    props.updateState('googleSheetId', value);
  });
}
*/

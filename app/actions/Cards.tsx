import * as React from 'react'
import Redux from 'redux'
import {FiltersCalculate} from './Filters'
import {getStore} from '../Store'
import {icon} from '../helpers'
import {CardType, FiltersState} from '../reducers/StateTypes'

declare var require: any;
const Tabletop = require('tabletop') as any;

export function DownloadCards(): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    const store = getStore();
    dispatch(CardsLoading());
    Tabletop.init({
      key: store.getState().filters.source.current.split(':')[1],
      parseNumbers: true,
      simpleSheet: true,
      postProcess: (card: CardType) => {
        // TODO parse / validate / clean the object here. Use Joi? Expose validation errors to the user
        // Note that we can't make too many assumptions about the data coming in if we want this to work with
        // multiple games... unless each theme has its own validation schema!
        // Note: doesn't yet have access to sheet name, that's assigned in callback
        return card;
      },
      callback: (data: any, tabletop: any) => {
        // Turn into an array, remove commented out / hidden cards, attach sheet name
        let cards: CardType[] = [];
        const sheets = tabletop.sheets();
        Object.keys(sheets).sort().forEach((sheetName: string) => {
          cards = cards.concat(sheets[sheetName].elements.filter((card: CardType) => {
            return (card.Comment === '' || card.hide === '');
          }).map((card: CardType) => {
            card.sheet = sheetName;
            return card;
          }));
        });
        dispatch(CardsUpdate(cards));
        dispatch(CardsFilter(store.getState.cards, store.getState().filters));
        dispatch(FiltersCalculate(store.getState().cards.filtered));
      }
    });
  }
}

export interface CardsLoadingAction extends Redux.Action {
  type: 'CARDS_LOADING';
}

export function CardsLoading(): CardsLoadingAction {
  return {type: 'CARDS_LOADING'};
}

export interface CardsUpdateAction extends Redux.Action {
  type: 'CARDS_UPDATE';
  cards: CardType[];
}

export function CardsUpdate(cards: CardType[]): CardsUpdateAction {
  return {type: 'CARDS_UPDATE', cards};
}

export interface CardsFilterAction extends Redux.Action {
  type: 'CARDS_FILTER';
  cards: CardType[];
  filters: FiltersState;
}

export function CardsFilter(cards: CardType[], filters: FiltersState): CardsFilterAction {
  return {type: 'CARDS_FILTER', cards, filters};
}


// Filters the cards and returns them formatted based on the filters
export function filterAndFormatCards(cards: CardType[], filters: FiltersState): CardType[] {
  if (cards === null) {
    return cards;
  }

  const cardFilters = ['sheet', 'tier', 'class'].filter((filterName: string) => {
    return (filters[filterName].current !== 'All');
  });
  cards = cards.filter((card: CardType) => {
    for (let i = 0; i < cardFilters.length; i++) {
      const filterName = cardFilters[i];
      const filter = filters[filterName];
      if (card[filterName] !== filter.current) {
        return false;
      }
    }
    return true;
  }).map((card: CardType) => formatCard(card, filters));
  return cards;
}


const boldColonedRegex = /(.*: )/g;
const orRegex = /\nOR\n/g; // note: caps only
const symbolRegex = /&[#a-z0-9]{1,7};/img;
const iconRegex = /#\w*/mg;
const doubleLinebreak = /\n\n/mg;
const singleLinebreak = /\n/mg; // purposefully last
const elementifyRegex = new RegExp([
  boldColonedRegex.source,
  orRegex.source,
  symbolRegex.source,
  iconRegex.source,
  doubleLinebreak.source,
  singleLinebreak
].join('|'), 'igm');

// Returns each property either as a string or, if it contains icons, an array of JSX elements
function formatCard(card: CardType, filters: FiltersState): CardType {
  Object.keys(card).forEach((key: string) => {
    let value = card[key];
    if (value === '-') { // clear and skip '-' proprties
      card[key] = '';
    } else if (typeof value === 'string') {
      // For each propery, split it up on anything that'll get turned into a JSX element
      // Then walk through the array and JSX-ify as needed, leaving the rest as strings
      // Parsing order is important here, for example \n\n vs \n
      const values = value.split(elementifyRegex).map((str: string, index: number): string | JSX.Element => {
        // Wrap "OR" in div for padding
        if (orRegex.test(str)) {
          return <div key={index} className="or">OR</div>;
        }
        // Bold "Declaration: "
        if (boldColonedRegex.test(str)) {
          return <strong key={index}>{str}</strong>
        }
        // Parse & wrap symbols for browser display (<, >, etc)
        if (symbolRegex.test(str)) {
          return <span key={index} className="symbol" dangerouslySetInnerHTML={{__html: str}}></span>;
        }
        if (iconRegex.test(str)) {
          return icon(filters.theme.current, str.replace(iconRegex, (match: string) => match.substring(1) + '_small'));
        }
        if (doubleLinebreak.test(str)) {
          return <br key={index} className="padded"/>;
        }
        if (singleLinebreak.test(str)) {
          return <br key={index}/>;
        }
        return str;
      });
      // If there's only one item, turn it back into an item to keep filter code simpler.
      value = (values.length === 1) ? values[0] : values;
    }
    card[key] = value;
  });
  return card;
}

import {parse as parseCSV} from 'papaparse';
import * as React from 'react';
import Redux from 'redux';
import {SHEETS} from '../Constants';
import {icon} from '../helpers';
import {CardType, FiltersState, TranslationsType} from '../reducers/StateTypes';
import {getStore} from '../Store';
import {CardsFilterAction, CardsLoadingAction, CardsUpdateAction, TranslationsUpdateAction} from './ActionTypes';
import {filtersCalculate} from './Filters';

interface ResultType {
  cards?: CardType[];
  translations?: TranslationsType;
}

export function downloadCards(name: string, cardType: string|null = null): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    const store = getStore();
    dispatch(cardsLoading());

    const p = (cardType !== null) ? Promise.all([parseSingleSheet(cardType, name)]) : downloadAndProcessSpreadsheet(name);
    p.then((results: ResultType[]) => {
        const cards = results.reduce((acc: CardType[], obj: ResultType) => {
          return [...acc, ...(obj.cards || [])];
        }, []).sort((a: CardType, b: CardType) => {
          if (a.sheet < b.sheet) {
            return -1;
          } else if (a.sheet > b.sheet) {
            return 1;
          } else if (a.class < b.class) {
            return -1;
          } else if (a.class > b.class) {
            return 1;
          }
          return 0;
        });

        const translations = results.reduce((acc: TranslationsType, obj: ResultType) => {
          return {...acc, ...(obj.translations || {})};
        }, {});
        if (Object.keys(translations).length > 0) {
          dispatch(translationsUpdate({AdjectiveAfterNoun: false, ...translations}));
        }
        dispatch(cardsUpdate(cards));

        // TODO this series of actions is order-dependent
        // This should be made more robust with something like a Redux watcher
        dispatch(cardsFilter(cards, store.getState().filters));
        dispatch(filtersCalculate(store.getState().cards.filtered));
      });
  };
}

function parseSingleSheet(sheetName: string, url: string) {
  return new Promise((resolve, reject) => {
      parseCSV(url, {
          download: true,
          header: true,
          dynamicTyping: true,
          complete(results: any) {
            const data = results.data;
            // Turn into an array, remove commented out / hidden cards, attach sheet name
            let cards: CardType[] = [];
            let translations: TranslationsType|null = null;

            if (sheetName === 'translations') {
              translations = {AdjectiveAfterNoun: false};
              for (const row of data) {
                if (row.Translated && row.Translated !== '') {
                  translations[row.Language.toLowerCase()] = row.Translated;
                }
              }
            } else {
              cards = cards.concat(data.filter((card: CardType) => {
                return (card.Comment === null || card.hide === null);
              }).map((card: CardType) => {
                card.sheet = sheetName;
                return card;
              }));
            }
            resolve({cards, translations});
          },
      });
    });
}

function downloadAndProcessSpreadsheet(name: string) {
  let source: any = null;
  for (const s of SHEETS) {
    if (name === s.name) {
      source = s;
      break;
    }
  }
  const promises = [];
  for (const sheetName of Object.keys(source.sheets)) {
    const url = 'https://docs.google.com/spreadsheets/d/e/' + source.key + '/pub?output=csv&single=true&gid=' + source.sheets[sheetName];
    promises.push(parseSingleSheet(sheetName, url));
  }
  return Promise.all(promises);
}

export function cardsLoading(): CardsLoadingAction {
  return {type: 'CARDS_LOADING'};
}

export function cardsUpdate(cards: CardType[]): CardsUpdateAction {
  return {type: 'CARDS_UPDATE', cards};
}

export function translationsUpdate(translations: TranslationsType): TranslationsUpdateAction {
  return {type: 'TRANSLATIONS_UPDATE', translations};
}

export function cardsFilter(cards: CardType[], filters: FiltersState): CardsFilterAction {
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
  return cards
    .filter((card: CardType) => {
      for (const filterName of cardFilters) {
        const filter = filters[filterName];
        if (card[filterName] !== filter.current) {
          return false;
        }
      }
      return true;
    })
    .map((card: CardType) => formatCard(card, filters));
}

const iconRegex = /#\w*/mg;
const boldColonedRegex = /[^#:.\n]*?:/g;
const orRegex = /\nOR\n/g; // purposefully caps only
const symbolRegex = /&[#a-z0-9]{1,7};/img;
const doubleLinebreak = /\n\n/mg;
const singleLinebreak = /\n/mg; // purposefully last
const elementifyRegex = new RegExp('(' + [
  iconRegex.source,
  boldColonedRegex.source,
  orRegex.source,
  symbolRegex.source,
  doubleLinebreak.source,
  singleLinebreak.source,
].join('|') + ')', 'igm');

// Returns a new card with each property either as a string or, if it contains icons, an array of JSX elements
function formatCard(card: CardType, filters: FiltersState): CardType {
  const newCard: CardType = {};
  Object.keys(card).forEach((key: string) => {
    let value = card[key];
    if (value === '-' || value === '') { // skip '-' and blank proprties
      return;
    } else if (typeof value === 'string') {
      // For each propery, split it up on anything that'll get turned into a JSX element
      // Then walk through the array and JSX-ify as needed, leaving the rest as strings
      // Parsing order is important here, for example \n\n vs \n
      const values = value.split(elementifyRegex)
          .filter((str: string) => (str && str !== ''))
          .map((str: string, index: number): string | JSX.Element => {
            if (iconRegex.test(str)) {
              let theme = filters.theme.current;
              // TODO improve icon() helper so that it falls back to load icon src from expedition-art/ if it's not available in theme folder
              if (filters.theme.current === 'Color' || filters.theme.current === 'BlackAndWhite') {
                theme = null;
              }
              return icon(str.replace(iconRegex, (match: string) => match.substring(1) + '_small'), theme, index);
            }
            // Wrap "OR" in div for padding
            if (orRegex.test(str)) {
              return <div key={index} className="or">OR</div>;
            }
            // Bold "Declaration: " (EXCEPT FLAVORTEXT)
            if (boldColonedRegex.test(str) && key !== 'flavortext') {
              return <strong key={index}>{str}</strong>;
            }
            // Parse & wrap symbols (<, >, etc) in a span for better style control
            if (symbolRegex.test(str)) {
              return <span key={index} className="symbol">{str}</span>;
            }
            if (doubleLinebreak.test(str)) {
              return <br key={index} className="padded"/>;
            }
            if (singleLinebreak.test(str)) {
              return <br key={index}/>;
            }
            return str;
          });

      if (values.length === 0) {
        value = null;
      } else if (values.length === 1) {
        value = values[0];
      } else {
        value = values;
      }
    }
    newCard[key] = value;
  });
  return newCard;
}

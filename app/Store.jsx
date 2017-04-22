import { createStore, combineReducers } from 'redux'
import Tabletop from 'tabletop'

import {iconString} from './Helpers.jsx'

let store: any = null;

export const defaultState = {
  cards: {
    data: null, // array of cards, with .sheet = sheet name
    filtered: null, // only the cards valid with current filters
    loading: true,
  },
  filters: {
    sheet: {
      current: 'All',
      default: 'All',
      options: ['All'],
    },
    class: {
      current: 'All',
      default: 'All',
      options: ['All'],
    },
    tier: {
      current: 'All',
      default: 'All',
      options: ['All'],
    },
    theme: {
      current: 'BlackAndWhite',
      default: 'BlackAndWhite',
      options: ['BlackAndWhite', 'Color'],
    },
    export: {
      current: 'PrintAndPlay',
      default: 'PrintAndPlay',
      options: ['PrintAndPlay', 'WebView', 'DriveThruCards', 'AdMagicFronts', 'AdMagicBacks', 'FrontsOnly'],
    },
  },
  renderSettings: {
    cardsPerPage: 9,
    theme: 'BlackAndWhite',
  },
};


// Data pipeline:
// Cards requested -> Cards received -> Filtered cards updated based on new data
// Filter changed -> Filtered cards updated based on new filters -> Filter options updated based on valid cards


function cleanCardData(card) {

  card.text = makeBold(card.text);
  card.abilitytext = makeBold(card.abilitytext);
  card.roll = makeBold(card.roll);

  // bold STATEMENTS:
  function makeBold (string) {
    return (string == null) ? string : string.replace(/(.*:)/g, (whole, capture) => `<strong>${capture}</strong>`);
  }

  Object.keys(card).forEach((property) => {

    if (card[property] === '-') { // remove '-' proprties
      card[property] = '';
    } else if (typeof card[property] === 'string') {
      // replace CSV line breaks with BR's - padded if: above and below OR's, below end of </strong>, above start of <strong>
      // otherwise just a normal BR
      card[property] = card[property].replace(/(\n(<strong>))|((<\/strong>)\n)|(\n(OR)\n)|(\n)/mg, (whole) => {
        if (whole.indexOf('<strong>') !== -1) {
          return '<br class="padded"/>' + whole;
        }
        else if (whole.indexOf('</strong>') !== -1) {
          return whole + '<br class="padded"/>';
        }
        else if (whole.indexOf('OR') !== -1) {
          return '<br class="padded"/>' + whole + '<br class="padded"/>';
        }
        else {
          return whole + '<br />';
        }
      });

      // Expand &macro's
      card[property] = card[property].replace(/&[a-zA-Z0-9;]*/mg, (match) => {
        switch (match.substring(1)) {
          case 'crithit':
            return '#roll <span class="symbol">&ge;</span> 20';
          break;
          case 'hit':
            return '#roll <span class="symbol">&ge;</span> $risk';
          break;
          case 'miss':
            return '#roll <span class="symbol">&lt;</span> $risk';
          break;
          case 'critmiss':
            return '#roll <span class="symbol">&le;</span> 1';
          break;
          // >, <, etc
          case 'geq;': return '≥'; break;
          case 'lt;': return '<'; break;
          case 'leq;': return '≤'; break;
          case 'gt;': return '>'; break;
        }
        throw "BROKEN MACRO: " + match.substring(1);
        return 'BROKEN MACRO';
      });

      // Replace $var with variable value
      card[property] = card[property].replace(/\$\w*/mg, (match) => {
        return card[match.substring(1)];
      });
    }
    return card[property];
  });

  if (card.Effect) { // put ORs in divs
    card.Effect = card.Effect.replace(/OR<br \/>/g, (whole, capture, match) => {
      return '<div class="or"><span>OR</span></div>';
    });
  }

  return card;
}





function cards(state = defaultState.cards, action) {
  switch (action.type) {
    case 'CARDS_REQUEST':
      Tabletop.init({
        key: '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
        parseNumbers: true,
        simpleSheet: true,
        postProcess: function (card) {
          // TODO parse / validate / clean the object here. Use Joi? Expose validation errors to the user
          // Note: does not have access to sheet name
          return cleanCardData(card);
        },
        callback: function (data, tabletop) {
          // Remove commented out cards and attach sheet name
          let cards = [];
          const sheets = tabletop.sheets();
          Object.keys(sheets).sort().forEach((sheetName) => {
            cards = cards.concat(sheets[sheetName].elements.filter((card) => {
              return (card.Comment === '');
            }).map((card) => {
              card.sheet = sheetName;
              return card;
            }));
          });
          getStore().dispatch({type: 'CARDS_RECEIVED', data: cards })
        }
      });
      return Object.assign({}, state, { loading: true });
    case 'CARDS_RECEIVED':
      setTimeout(() => {
        getStore().dispatch({type: 'FILTERS_UPDATED', filters: getStore().getState().filters});
      }, 1);
      return Object.assign({}, state, {
        data: action.data,
        filtered: filterCards(action.data, getStore().getState().filters),
        loading: false,
      });
    case 'FILTERS_UPDATED':
      return Object.assign({}, state, {
        filtered: filterCards(state.data, action.filters),
      });
    default:
      return state;
  }

  function filterCards(cards, filters) {

    const cardFilters = ['sheet', 'tier', 'class'].filter((filterName) => {
      return (filters[filterName].current !== 'All');
    });
    cards = cards.filter((card) => {
      for (let i = 0; i < cardFilters.length; i++) {
        const filterName = cardFilters[i];
        const filter = filters[filterName];
        if (card[filterName] !== filter.current) {
          return false;
        }
      }
      return true;
    }).map((card) => {
      Object.keys(card).map((property) => {
        // Prepare string properties for injection:
          // Replace #icons with the theme's icon image
        if (typeof card[property] === 'string') {
          card[property] = card[property].replace(/#\w*/mg, (match) => {
            return iconString(filters.theme.current, match.substring(1) + '_small');
          });
        }
      });
      return card;
    });
    setTimeout(() => {
      getStore().dispatch({type: 'CARDS_FILTERED', cards});
    }, 1);
    return cards;
  }
}

function filters(state = defaultState.filters, action) {
  let newState;
  switch (action.type) {
    case 'FILTER_CHANGE':
      newState = Object.assign({}, state);
      newState[action.name].current = action.value;
      setTimeout(() => {
        getStore().dispatch({type: 'FILTERS_UPDATED', filters: newState});
      }, 1);
      return newState;
    case 'CARDS_FILTERED':
      newState = Object.assign({}, state);
      return updateFilterOptions(newState, action.cards);
    default:
      return state;
  }

  // TODO if a filter is currently active / not on default, show all possible options for that filter (on unfiltered data)
  // (otherwise, because the data's been filtered already, it'll only show the current selection + all)
  function updateFilterOptions(filters, cards) {

    if (cards == null) { return filters; }

    filters.sheet.options = [filters.sheet.default].concat(cards.reduce((acc, card) => {
      if (acc.indexOf(card.sheet) === -1) {
        acc.push(card.sheet);
      }
      return acc;
    }, []).sort());
    filters.class.options = [filters.class.default].concat(cards.reduce((acc, card) => {
      if (acc.indexOf(card.class) === -1 && card.class !== '' && ['Ability', 'Encounter'].indexOf(card.sheet) !== -1) {
        acc.push(card.class);
      }
      return acc;
    }, []).sort());
    filters.tier.options = [filters.tier.default].concat(cards.reduce((acc, card) => {
      if (acc.indexOf(card.tier) === -1 && typeof card.tier === 'number' && ['Encounter', 'Loot'].indexOf(card.sheet) !== -1) {
        acc.push(card.tier);
      }
      return acc;
    }, []).sort());
    return filters;
  }
}

function renderSettings(state = defaultState.renderSettings, action) {
  switch (action.type) {
    case 'FILTERS_UPDATED':
    // TODO
      const newState = Object.assign({}, state);
      newState.theme = action.filters.theme.current;
      switch (action.filters.export) {
        case 'PrintAndPlay':
          newState.cardsPerPage = 9;
          break;
        case 'WebView':
          newState.cardsPerPage = 1;
          break;
      }
      return newState;
      break;
    default:
      return state;
  }
}


const combinedReducers = combineReducers({
  cards,
  filters,
  renderSettings,
});

export function getStore() {
  if (store !== null) {
    return store;
  }
  store = createStore(combinedReducers, defaultState);
  return store;
}

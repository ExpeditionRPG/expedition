import { createStore, combineReducers } from 'redux'
import Tabletop from 'tabletop'

let store: any = null;

export const defaultState = {
  cards: {
    data: null,
    filtered: null, // array
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
      current: 'Official',
      default: 'Official',
      options: ['Official', 'TODO'], // Object.keys(window.Expedition),
    },
    export: {
      current: 'Print-and-Play',
      default: 'Print-and-Play',
      options: ['Print-and-Play', 'DriveThruCards', 'AdMagic-Fronts', 'AdMagic-Backs', 'Hide-Backs'],
    },
  },
};

function cards(state = defaultState.cards, action) {
  switch (action.type) {
    case 'CARDS_REQUEST':
      Tabletop.init({
        key: '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
        parseNumbers: true,
        simpleSheet: true,
        postProcess: function (element) {
          // TODO parse / validate / clean the object here. Use Joi? Expose validation errors to the user
          // Note: does not have access to sheet name
          return element;
        },
        callback: function (data, tabletop) {
          getStore().dispatch({type: 'CARDS_RECEIVED', data: tabletop.sheets()})
        }
      });
      return Object.assign({}, state, { loading: true });
    case 'CARDS_RECEIVED':
      return Object.assign({}, state, {
        data: action.data,
      });
    case 'FILTER_PROCESSED':
      return Object.assign({}, state, {
        filtered: filterCards(state.data, action.filters),
        loading: false,
      });
    default:
      return state;
  }

  function filterCards(cards, filters) {
    let newCards = [];
    const cardFilters = ['tier', 'class'].filter((filterName) => {
      return (filters[filterName].current !== 'All');
    });
    for (let sheetName in cards) {
      if (filters.sheet.current === 'All' || filters.sheet.current === sheetName) {
        newCards = newCards.concat(cards[sheetName].elements.filter((card) => {

          if (card.Comment !== '') {
            return false;
          }

          for (let i = 0; i < cardFilters.length; i++) {
            const filterName = cardFilters[i];
            const filter = filters[filterName];
            if (card[filterName] !== filter.current) {
              return false;
            }
          }
          card.sheet = sheetName;
          return true;
        }));
      }
    }
    return newCards;
  }
}

function filters(state = defaultState.filters, action) {
  let newState;
  switch (action.type) {
    case 'FILTER_CHANGE':
      newState = Object.assign({}, state);
      newState[action.name].current = action.value;
      return updateFilterOptions(newState, getStore().getState().cards.data);
    case 'CARDS_RECEIVED':
      newState = Object.assign({}, state);
      return updateFilterOptions(newState, action.data);
    default:
      return state;
  }

  function updateFilterOptions(filters, cards) {

    if (cards == null) { return filters; }

    // TODO pre-filter data based on existing filter current values
    // Requires re-thinking the order in which cards and filter data is processed

    filters.sheet.options = [filters.sheet.default].concat(Object.keys(cards));
    filters.class.options = [filters.class.default].concat(cards.Ability.elements.concat(cards.Encounter.elements).reduce((acc, val) => {
      if (acc.indexOf(val.class) === -1 && val.class !== '') {
        acc.push(val.class);
      }
      return acc;
    }, []).sort());
    filters.tier.options = [filters.tier.default].concat(cards.Encounter.elements.concat(cards.Loot.elements).reduce((acc, val) => {
      if (acc.indexOf(val.tier) === -1 && typeof val.tier === 'number') {
        acc.push(val.tier);
      }
      return acc;
    }, []).sort());
    setTimeout(() => {
      getStore().dispatch({type: 'FILTER_PROCESSED', filters});
    }, 1);
    return filters;
  }
}


const combinedReducers = combineReducers({
  cards,
  filters,
});

export function getStore() {
  if (store !== null) {
    return store;
  }
  store = createStore(combinedReducers, defaultState);
  return store;
}

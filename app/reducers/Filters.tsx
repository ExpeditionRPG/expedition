import {getStore} from '../store'

export let initialState: any = {
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
    options: ['BlackAndWhite', 'Color', 'UrbanChaos'],
  },
  export: {
    current: 'PrintAndPlay',
    default: 'PrintAndPlay',
    options: ['PrintAndPlay', 'WebView', 'DriveThruCards', 'AdMagicFronts', 'AdMagicBacks', 'FrontsOnly'],
  },
};

// Load the filter initial state from the querystring as well
declare var require: any;
const qs = require('qs') as any;
const query = qs.parse(window.location.search.substring(1));
for (let key in query) {
  initialState[key].current = query[key];
}


export default function Filters(state: any = initialState, action: any) {
  let newState: any;
  switch (action.type) {
    case 'FILTER_CHANGE':
      newState = Object.assign({}, state);
      newState[action.name].current = action.value;
      return newState;
    case 'FILTERS_CALCULATE':
      newState = Object.assign({}, state);
      return updateFilterOptions(newState, action.cardsFiltered);
    default:
      return state;
  }
}


// TODO if a filter is currently active / not on default, show all possible options for that filter (on unfiltered data)
// (otherwise, because the data's been filtered already, it'll only show the current selection + all)
function updateFilterOptions(filters: any, cards: any[]) {

  if (cards == null) { return filters; }

  filters.sheet.options = [filters.sheet.default].concat(cards.reduce((acc: any, card: any) => {
    if (acc.indexOf(card.sheet) === -1) {
      acc.push(card.sheet);
    }
    return acc;
  }, []).sort());
  filters.class.options = [filters.class.default].concat(cards.reduce((acc: any, card: any) => {
    if (acc.indexOf(card.class) === -1 && card.class !== '' && ['Ability', 'Encounter'].indexOf(card.sheet) !== -1) {
      acc.push(card.class);
    }
    return acc;
  }, []).sort());
  filters.tier.options = [filters.tier.default].concat(cards.reduce((acc: any, card: any) => {
    if (acc.indexOf(card.tier) === -1 && typeof card.tier === 'number' && ['Encounter', 'Loot'].indexOf(card.sheet) !== -1) {
      acc.push(card.tier);
    }
    return acc;
  }, []).sort());
  return filters;
}

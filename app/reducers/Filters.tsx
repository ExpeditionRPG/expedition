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
  source: {
    // Urban Chaos: 1hR-Taq5n4kiRhRSv4D1CxXZlCyEooRSv_wW8bs_vXes
    current: 'Expedition:1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
    default: 'Expedition:1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
    options: ['Expedition:1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM', 'Custom'],
  },
};

// Load any initial values from URL / querystring
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
      if (action.name === 'source' && action.value === 'Custom') {
        action.value = window.prompt('Please enter your card sheet publish URL (cancel and hit "?" in the top right for help)', '');
        action.value = 'Custom:' + action.value.replace('https://docs.google.com/spreadsheets/d/', '');
        // TODO validate URL or ID, otherwise notify user + abort
      }
      newState[action.name].current = action.value;
      // Update URL - don't include in URL if it's the default value
      let query = Object.assign(qs.parse(window.location.search.substring(1)), {[action.name]: action.value});
      for (let key in query) {
        if (query[key] === initialState[key].default) {
          delete query[key];
        }
      }
      window.history.pushState(null, 'Expedition Card Creator', '?' + qs.stringify(query));
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

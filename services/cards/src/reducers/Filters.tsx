import Redux from 'redux';
import {FilterChangeAction, FiltersCalculateAction} from '../actions/ActionTypes';
import {SHEETS} from '../Constants';
import {CardType, FiltersState} from './StateTypes';

// In UI order
export let initialState: FiltersState = {
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
  source: {
    current: SHEETS[0].name,
    default: SHEETS[0].name,
    options: [
      ...SHEETS.map((s) => s.name),
    ],
  },
};

export default function Filters(state: FiltersState = initialState, action: Redux.Action) {
  let newState: FiltersState;
  switch (action.type) {
    case 'FILTER_CHANGE':
      const filterChange = action as FilterChangeAction;
      newState = {...state};
      if (newState[filterChange.name]) { // Protect against URL parameters that aren't ours, such as search / social media links
        newState[filterChange.name].current = filterChange.value;
      }
      return newState;
    case 'FILTERS_CALCULATE':
      newState = {...state};
      return updateFilterOptions(newState, (action as FiltersCalculateAction).cardsFiltered);
    default:
      return state;
  }
}

// TODO if a filter is currently active / not on default, show all possible options for that filter (on unfiltered data)
// (otherwise, because the data's been filtered already, it'll only show the current selection + all)
function updateFilterOptions(filters: FiltersState, cards: CardType[]) {

  if (cards === null) { return filters; }

  filters.sheet.options = [filters.sheet.default].concat(cards.reduce((acc: string[], card: CardType) => {
    if (acc.indexOf(card.sheet) === -1) {
      acc.push(card.sheet);
    }
    return acc;
  }, []).sort());
  filters.class.options = [filters.class.default].concat(cards.reduce((acc: string[], card: CardType) => {
    if (acc.indexOf(card.class) === -1 && card.class !== '' && ['Ability', 'Encounter'].indexOf(card.sheet) !== -1) {
      acc.push(card.class);
    }
    return acc;
  }, []).sort());
  filters.tier.options = [filters.tier.default].concat(cards.reduce((acc: number[], card: CardType) => {
    if (acc.indexOf(card.tier) === -1 && typeof card.tier === 'number' && ['Encounter', 'Loot'].indexOf(card.sheet) !== -1) {
      acc.push(card.tier);
    }
    return acc;
  }, []).sort());
  return filters;
}

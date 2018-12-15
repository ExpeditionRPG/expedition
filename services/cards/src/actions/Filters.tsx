import Redux from 'redux';
import {initialState} from '../reducers/Filters';
import {CardType} from '../reducers/StateTypes';
import {getStore} from '../Store';
import {FilterChangeAction, FiltersCalculateAction} from './ActionTypes';
import {cardsFilter, downloadCards} from './Cards';

declare var require: any;
declare var window: any;
const qs = require('qs');

// Filter changes trigger several things, including the actual FiltersChange action
export function filterChange(name: string, value: string | number): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    if (name === 'source' && value === 'Custom') {
      // TODO validate URL or ID, otherwise notify user + abort
      value = window.prompt('Please enter your card sheet publish URL (see "?" in the top right for help)', '') as string;
      if (value.indexOf('/e/') !== -1) {
        return alert('Please use the URL of the Google Doc, not the publish link');
      }
      value = 'Custom:' + value.replace('https://docs.google.com/spreadsheets/d/', '').split('/')[0];
    }
    // tslint:disable-next-line
    dispatch({type: 'FILTER_CHANGE', name, value}) as FilterChangeAction;

    // Update URL - don't include in URL if it's the default value
    const query = {...qs.parse(window.location.search.substring(1)), [name]: value};
    for (const key in query) {
      if (initialState[key] && query[key] === initialState[key].default) {
        delete query[key];
      }
    }
    window.history.pushState(null, 'Expedition Card Creator', '?' + qs.stringify(query));

    const store = getStore();
    if (name === 'source') {
      dispatch(downloadCards(store.getState().filters.source.current));
    } else {
      dispatch(cardsFilter(store.getState().cards.data, store.getState().filters));
      dispatch(filtersCalculate(store.getState().cards.filtered));
    }
  };
}

export function loadFiltersFromUrl(): ((dispatch: Redux.Dispatch<any>) => void) {
  return (dispatch: Redux.Dispatch<any>) => {
    const query = qs.parse(window.location.search.substring(1));
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        const val = (isNaN(query[key]) ? query[key] : Number(query[key]));
        dispatch(filterChange(key, val));
      }
    }
  };
}

export function filtersCalculate(cardsFiltered: CardType[]): FiltersCalculateAction {
  return {type: 'FILTERS_CALCULATE', cardsFiltered};
}

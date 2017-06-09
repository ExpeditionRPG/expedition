import Redux from 'redux'
import {CardsFilter, DownloadCards} from './Cards'
import {getStore} from '../Store'
import {CardType} from '../reducers/StateTypes'


export interface FilterChangeAction extends Redux.Action {
  type: 'FILTER_CHANGE'
  name: string;
  value: string | number;
}

// Filter changes trigger several things, including the actual FiltersChange action
export function FilterChange(name: string, value: string | number): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    if (name === 'source' && value === 'custom') {
      // TODO validate URL or ID, otherwise notify user + abort
      value = window.prompt('Please enter your card sheet publish URL (see "?" in the top right for help)', '');
      value = 'Custom:' + value.replace('https://docs.google.com/spreadsheets/d/', '');
    }
    dispatch({type: 'FILTER_CHANGE', name, value}) as FilterChangeAction;
    if (name === 'source') {
      dispatch(DownloadCards());
    } else {
      const store = getStore();
      dispatch(CardsFilter(store.getState().cards, store.getState().filters));
      dispatch(FiltersCalculate(store.getState().cards.filtered));
    }
  }
}

export interface FiltersCalculateAction extends Redux.Action {
  type: 'FILTERS_CALCULATE'
  cardsFiltered: CardType[];
}

export function FiltersCalculate(cardsFiltered: CardType[]): FiltersCalculateAction {
  return {type: 'FILTERS_CALCULATE', cardsFiltered};
}

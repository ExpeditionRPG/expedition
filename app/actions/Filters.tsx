import Redux from 'redux'
import {CardsFilter, DownloadCards} from './Cards'
import {getStore} from '../Store'


export interface FilterChangeAction extends Redux.Action {
  type: 'FILTER_CHANGE'
  name: string;
  value: string | number;
}

// Filter changes trigger several things, including the plain FiltersChange action
export function FilterChange(name: string, value: string | number): ((dispatch: Redux.Dispatch<any>)=>void) {
  return (dispatch: Redux.Dispatch<any>) => {
    dispatch({type: 'FILTER_CHANGE', name, value});
    if (name === 'source') {
      dispatch(DownloadCards());
    } else {
      dispatch(CardsFilter(getStore().getState().filters));
      dispatch(FiltersCalculate(getStore().getState().cards.filtered));
    }
  }
}

export interface FiltersCalculateAction extends Redux.Action {
  type: 'FILTERS_CALCULATE'
  cardsFiltered: any;
}

export function FiltersCalculate(cardsFiltered: any): FiltersCalculateAction {
  return {type: 'FILTERS_CALCULATE', cardsFiltered};
}

import Redux from 'redux'
import {CardsFilter} from './Cards'
import {getStore} from '../Store'


// Actual filter changes trigger several things, including the plain FiltersChange action
export function FilterChange(name: string, value: string | number) {
  return (dispatch: Redux.Dispatch<any>): any => {
    dispatch(FiltersChange(name, value));
    dispatch(CardsFilter(getStore().getState().filters));
    dispatch(FiltersCalculate(getStore().getState().cards.filtered));
  }
}

interface FiltersChangeAction extends Redux.Action {
  type: 'FILTERS_CHANGE'
  name: string;
  value: string | number;
}

function FiltersChange(name: string, value: string | number): FiltersChangeAction {
  return {type: 'FILTERS_CHANGE', name, value};
}


export interface FiltersCalculateAction extends Redux.Action {
  type: 'FILTERS_CALCULATE'
  cardsFiltered: any;
}

export function FiltersCalculate(cardsFiltered: any): FiltersCalculateAction {
  return {type: 'FILTERS_CALCULATE', cardsFiltered};
}

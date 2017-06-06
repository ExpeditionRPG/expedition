import Redux from 'redux'
import {CardsFilter, DownloadCards} from './Cards'
import {getStore} from '../Store'
import {CardType} from '../reducers/StateTypes'


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
      const state = getStore().getState();
      dispatch(CardsFilter(state.filters));
      dispatch(FiltersCalculate(state.cards.filtered));
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

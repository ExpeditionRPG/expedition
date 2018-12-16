import Redux from 'redux';
import {CardType, FiltersState, TranslationsType} from '../reducers/StateTypes';

export interface CardsLoadingAction extends Redux.Action {
  type: 'CARDS_LOADING';
}

export interface CardsFilterAction extends Redux.Action {
  type: 'CARDS_FILTER';
  cards: CardType[];
  filters: FiltersState;
}

export interface TranslationsUpdateAction extends Redux.Action {
  type: 'TRANSLATIONS_UPDATE';
  translations: TranslationsType;
}

export interface CardsUpdateAction extends Redux.Action {
  type: 'CARDS_UPDATE';
  cards: CardType[];
}

export interface FiltersCalculateAction extends Redux.Action {
  type: 'FILTERS_CALCULATE';
  cardsFiltered: CardType[];
}

export interface FilterChangeAction extends Redux.Action {
  type: 'FILTER_CHANGE';
  name: string;
  value: string | number;
}

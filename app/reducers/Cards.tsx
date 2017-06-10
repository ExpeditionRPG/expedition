import Redux from 'redux'
import {CardType, CardsState, FiltersState} from './StateTypes'
import {CardsFilterAction, CardsUpdateAction, filterAndFormatCards} from '../actions/Cards'

export const initialState: CardsState = {
  data: null,
  filtered: null,
  loading: true,
};

export default function Cards(state: CardsState = initialState, action: Redux.Action): CardsState {
  switch (action.type) {
    case 'CARDS_LOADING':
      return {...state,
        loading: true,
      };
    case 'CARDS_UPDATE':
      return {...state,
        data: (action as CardsUpdateAction).cards,
        loading: false,
      };
    case 'CARDS_FILTER':
      let cardsFilterAction = (action as CardsFilterAction);
      return {...state,
        filtered: filterAndFormatCards(cardsFilterAction.cards, cardsFilterAction.filters),
      };
    default:
      return state;
  }
}

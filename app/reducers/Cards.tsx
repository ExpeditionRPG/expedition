import Redux from 'redux'
import {iconString} from '../helpers'
import {CardType, CardsState, FiltersState} from './StateTypes'
import {CardsFilterAction, CardsUpdateAction} from '../actions/Cards'

export const initialState: CardsState = {
  data: null, // array of cards, with .sheet = sheet name
  filtered: null, // only the cards valid with current filters
  loading: true,
};

export default function Cards(state: CardsState = initialState, action: Redux.Action): CardsState {
  switch (action.type) {
    case 'CARDS_LOADING':
      return Object.assign({}, state, {
        loading: true,
      });
    case 'CARDS_UPDATE':
      return Object.assign({}, state, {
        data: (action as CardsUpdateAction).cards,
        loading: false,
      });
    case 'CARDS_FILTER':
      return Object.assign({}, state, {
        filtered: filterCards(state.data, (action as CardsFilterAction).filters),
      });
    default:
      return state;
  }
}


function filterCards(cards: CardType[], filters: FiltersState) {

  const cardFilters = ['sheet', 'tier', 'class'].filter((filterName: string) => {
    return (filters[filterName].current !== 'All');
  });
  cards = cards.filter((card: CardType) => {
    for (let i = 0; i < cardFilters.length; i++) {
      const filterName = cardFilters[i];
      const filter = filters[filterName];
      if (card[filterName] !== filter.current) {
        return false;
      }
    }
    return true;
  }).map((card: CardType) => {
    Object.keys(card).map((property: string) => {
      // Prepare string properties for injection:
        // Replace #icons with the theme's icon image
      if (typeof card[property] === 'string') {
        card[property] = card[property].replace(/#\w*/mg, (match: string) => {
          return iconString(filters.theme.current, match.substring(1) + '_small');
        });
      }
    });
    return card;
  });
  return cards;
}

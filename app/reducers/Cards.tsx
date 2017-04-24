import {iconString} from '../helpers'

export const initialState: any = {
  data: null, // array of cards, with .sheet = sheet name
  filtered: null, // only the cards valid with current filters
  loading: true,
};

export default function Cards(state: any = initialState, action: any): any {
  switch (action.type) {
    case 'CARDS_LOADING':
      return Object.assign({}, state, {
        loading: true,
      });
    case 'CARDS_UPDATE':
      return Object.assign({}, state, {
        data: action.cards,
        loading: false,
      });
    case 'CARDS_FILTER':
      return Object.assign({}, state, {
        filtered: filterCards(state.data, action.filters),
      });
    default:
      return state;
  }
}


function filterCards(cards: any[], filters: any) {

  const cardFilters = ['sheet', 'tier', 'class'].filter((filterName: string) => {
    return (filters[filterName].current !== 'All');
  });
  cards = cards.filter((card: any) => {
    for (let i = 0; i < cardFilters.length; i++) {
      const filterName = cardFilters[i];
      const filter = filters[filterName];
      if (card[filterName] !== filter.current) {
        return false;
      }
    }
    return true;
  }).map((card: any) => {
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

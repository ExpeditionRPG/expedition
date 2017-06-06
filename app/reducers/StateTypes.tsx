export interface CardType {
  [key: string]: any;
}

export interface CardsState {
  data: CardType[],
  filtered: CardType[],
  loading: boolean,
}

export interface FiltersState {
  [key: string]: any;
}

export interface AppState {
  cards: CardsState;
  filters: FiltersState;
}

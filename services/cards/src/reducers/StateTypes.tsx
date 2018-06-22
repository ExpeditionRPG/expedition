export interface CardType {
  // all cards have sheet: string as the tabletop sheet they originated from
  [key: string]: any;
}

export interface TranslationsType {
  // Settings
  AdjectiveAfterNoun: boolean;
  // Mapping of English string -> translation
  [key: string]: string | boolean;
}

export interface CardsState {
  data: CardType[] | null, // array of all downloaded cards
  filtered: CardType[] | null, // only cards valid with current filters
  translations: TranslationsType | null,
  loading: boolean,
}

export interface FiltersState {
  [key: string]: any;
}

export interface AppState {
  cards: CardsState;
  filters: FiltersState;
}

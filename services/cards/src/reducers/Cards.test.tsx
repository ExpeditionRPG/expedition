import Cards, { initialState } from './Cards';

const filters = {
  class: { current: 'All', default: 'All' },
  sheet: { current: 'All', default: 'All' },
  theme: { current: 'BlackAndWhite', default: 'BlackAndWhite' },
  tier: { current: 'All', default: 'All' },
};

const cards = [
  { name: 'Fireball', sheet: 'Ability', class: 'Fire', tier: 1 },
  { name: 'Wooden Sword', sheet: 'Loot', class: 'Loot', tier: 2 },
];

describe('Cards reducer', () => {
  test('starts loading with no data when given undefined', () => {
    expect(Cards(undefined, { type: '@@INIT' })).toEqual({
      data: null,
      filtered: null,
      loading: true,
      translations: null,
    });
  });

  test('flags loading without dropping existing data on CARDS_LOADING', () => {
    const result = Cards(
      { ...initialState, data: cards, loading: false },
      { type: 'CARDS_LOADING' },
    );
    expect(result.loading).toEqual(true);
    expect(result.data).toEqual(cards);
  });

  test('stores cards and finishes loading on CARDS_UPDATE', () => {
    const result = Cards(initialState, { type: 'CARDS_UPDATE', cards } as any);
    expect(result.data).toEqual(cards);
    expect(result.loading).toEqual(false);
  });

  test('stores translations without touching cards on TRANSLATIONS_UPDATE', () => {
    const translations = { AdjectiveAfterNoun: true, sword: 'espada' };
    const result = Cards({ ...initialState, data: cards }, {
      type: 'TRANSLATIONS_UPDATE',
      translations,
    } as any);
    expect(result.translations).toEqual(translations);
    expect(result.data).toEqual(cards);
  });

  test('filters cards by the active sheet filter on CARDS_FILTER', () => {
    const result = Cards(initialState, {
      cards,
      filters: { ...filters, sheet: { current: 'Ability', default: 'All' } },
      type: 'CARDS_FILTER',
    } as any);
    expect(result.filtered).toEqual([
      { name: 'Fireball', sheet: 'Ability', class: 'Fire', tier: 1 },
    ]);
  });

  test('keeps every card when all filters are on their defaults', () => {
    const result = Cards(initialState, {
      cards,
      filters,
      type: 'CARDS_FILTER',
    } as any);
    expect((result.filtered as any[]).length).toEqual(2);
  });

  test('leaves filtered null when there are no cards to filter', () => {
    const result = Cards(initialState, {
      cards: null,
      filters,
      type: 'CARDS_FILTER',
    } as any);
    expect(result.filtered).toBeNull();
  });

  test('does not mutate the state it was given', () => {
    const state = { ...initialState, data: null };
    const result = Cards(state, { type: 'CARDS_UPDATE', cards } as any);
    expect(state.data).toBeNull();
    expect(state.loading).toEqual(true);
    expect(result).not.toBe(state);
  });

  test('returns the same state object for unhandled actions', () => {
    const state = { ...initialState };
    expect(Cards(state, { type: 'NOT_A_CARDS_ACTION' })).toBe(state);
  });
});

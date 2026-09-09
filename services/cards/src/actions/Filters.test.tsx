jest.mock('./Cards', () => ({
  downloadCards: jest.fn(() => () => Promise.resolve()),
  cardsUpdate: (...args: unknown[]) =>
    jest.requireActual('./Cards').cardsUpdate(...args),
  cardsFilter: (...args: unknown[]) =>
    jest.requireActual('./Cards').cardsFilter(...args),
  filterAndFormatCards: (...args: unknown[]) =>
    jest.requireActual('./Cards').filterAndFormatCards(...args),
}));
import { getStore } from '../Store';
import { filterChange } from './Filters';
import * as Cards from './Cards';
import { initialState } from '../reducers/Filters';

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState(null, '', '/');
  for (const name of Object.keys(initialState))
    getStore().dispatch({
      type: 'FILTER_CHANGE',
      name,
      value: initialState[name].current,
    });
});
test('custom source prompts for sheet type and URL', () => {
  jest
    .spyOn(window, 'prompt')
    .mockReturnValueOnce('Encounter')
    .mockReturnValueOnce('https://example.com/cards.csv');
  const download = jest.mocked(Cards.downloadCards);
  getStore().dispatch(filterChange('source', 'custom'));
  expect(window.prompt).toHaveBeenCalledTimes(2);
  expect(download).toHaveBeenCalledWith(
    'https://example.com/cards.csv',
    'Encounter',
  );
  expect(getStore().getState().filters.source.current).toBe(
    'https://example.com/cards.csv',
  );
});
test('changing source downloads it and persists the URL', () => {
  const download = jest.mocked(Cards.downloadCards);
  getStore().dispatch(filterChange('source', 'The Horror'));
  expect(download).toHaveBeenCalledWith('The Horror', null);
  expect(new URLSearchParams(window.location.search).get('source')).toBe(
    'The Horror',
  );
});
test('changing a filter recalculates cards and available filter choices', () => {
  getStore().dispatch(
    Cards.cardsUpdate([
      { name: 'Beast', sheet: 'Encounter', class: 'Beast', tier: 2 },
      { name: 'Loot', sheet: 'Loot', class: 'Treasure', tier: 1 },
    ]),
  );
  getStore().dispatch(filterChange('sheet', 'Encounter'));
  expect(getStore().getState().cards.filtered).toEqual([
    { name: 'Beast', sheet: 'Encounter', class: 'Beast', tier: 2 },
  ]);
  expect(getStore().getState().filters.class.options).toEqual(['All', 'Beast']);
  getStore().dispatch(filterChange('sheet', 'All'));
  expect(getStore().getState().cards.filtered).toHaveLength(2);
  expect(new URLSearchParams(window.location.search).has('sheet')).toBe(false);
});

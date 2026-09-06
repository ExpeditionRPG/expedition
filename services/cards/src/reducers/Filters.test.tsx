import { SHEETS } from '../Constants';
import Filters, { initialState } from './Filters';

// A fresh, deeply-independent copy so no test can be affected by another.
function freshState(): any {
  return JSON.parse(JSON.stringify(initialState));
}

const cards = [
  { name: 'Fireball', sheet: 'Ability', class: 'Fire', tier: null },
  { name: 'Skeleton', sheet: 'Encounter', class: 'Undead', tier: 2 },
  { name: 'Wooden Sword', sheet: 'Loot', class: '', tier: 1 },
  { name: 'Brawler', sheet: 'Adventurer', class: 'Ignored', tier: 3 },
  { name: 'Nameless', sheet: 'Encounter', class: '', tier: 2 },
];

describe('Filters reducer', () => {
  test('returns the default filters when given undefined', () => {
    const result = Filters(undefined, { type: '@@INIT' });
    expect(result.sheet).toEqual({
      current: 'All',
      default: 'All',
      options: ['All'],
    });
    expect(result.class).toEqual({
      current: 'All',
      default: 'All',
      options: ['All'],
    });
    expect(result.tier).toEqual({
      current: 'All',
      default: 'All',
      options: ['All'],
    });
    expect(result.theme).toEqual({
      current: 'BlackAndWhite',
      default: 'BlackAndWhite',
      options: ['BlackAndWhite', 'Color'],
    });
    expect(result.export.current).toEqual('PrintAndPlay');
    expect(result.source).toEqual({
      current: SHEETS[0].name,
      default: SHEETS[0].name,
      options: SHEETS.map(s => s.name),
    });
  });

  test('sets the current value of the named filter on FILTER_CHANGE', () => {
    const result = Filters(freshState(), {
      type: 'FILTER_CHANGE',
      name: 'theme',
      value: 'Color',
    } as any);
    expect(result.theme.current).toEqual('Color');
    expect(result.theme.default).toEqual('BlackAndWhite');
    expect(result.theme.options).toEqual(['BlackAndWhite', 'Color']);
  });

  test('accepts numeric values such as a tier on FILTER_CHANGE', () => {
    const result = Filters(freshState(), {
      type: 'FILTER_CHANGE',
      name: 'tier',
      value: 3,
    } as any);
    expect(result.tier.current).toEqual(3);
  });

  test('leaves the other filters alone on FILTER_CHANGE', () => {
    const result = Filters(freshState(), {
      type: 'FILTER_CHANGE',
      name: 'sheet',
      value: 'Encounter',
    } as any);
    expect(result.sheet.current).toEqual('Encounter');
    expect(result.class.current).toEqual('All');
    expect(result.export.current).toEqual('PrintAndPlay');
  });

  test('ignores an unknown filter name rather than throwing', () => {
    const before = freshState();
    let result: any;
    expect(() => {
      result = Filters(before, {
        type: 'FILTER_CHANGE',
        name: 'utm_source',
        value: 'facebook',
      } as any);
    }).not.toThrow();
    expect(result.utm_source).toBeUndefined();
    expect(result).toEqual(freshState());
  });

  test('does not mutate the filter it was given on FILTER_CHANGE', () => {
    const before = freshState();
    Filters(before, {
      type: 'FILTER_CHANGE',
      name: 'theme',
      value: 'Color',
    } as any);
    expect(before.theme.current).toEqual('BlackAndWhite');
  });

  test('does not pollute the exported initial state on FILTER_CHANGE', () => {
    Filters(undefined, {
      type: 'FILTER_CHANGE',
      name: 'theme',
      value: 'Color',
    } as any);
    expect(initialState.theme.current).toEqual('BlackAndWhite');
  });

  test('derives the sheet options from the cards on FILTERS_CALCULATE', () => {
    const result = Filters(freshState(), {
      type: 'FILTERS_CALCULATE',
      cardsFiltered: cards,
    } as any);
    expect(result.sheet.options).toEqual([
      'All',
      'Ability',
      'Adventurer',
      'Encounter',
      'Loot',
    ]);
  });

  test('derives class options only from ability and encounter cards, skipping blanks', () => {
    const result = Filters(freshState(), {
      type: 'FILTERS_CALCULATE',
      cardsFiltered: cards,
    } as any);
    expect(result.class.options).toEqual(['All', 'Fire', 'Undead']);
  });

  test('derives tier options only from numeric encounter and loot tiers', () => {
    const result = Filters(freshState(), {
      type: 'FILTERS_CALCULATE',
      cardsFiltered: cards,
    } as any);
    expect(result.tier.options).toEqual(['All', 1, 2]);
  });

  test('leaves current selections and unrelated filters untouched on FILTERS_CALCULATE', () => {
    const before = freshState();
    before.sheet.current = 'Encounter';
    const result = Filters(before, {
      type: 'FILTERS_CALCULATE',
      cardsFiltered: cards,
    } as any);
    expect(result.sheet.current).toEqual('Encounter');
    expect(result.theme.options).toEqual(['BlackAndWhite', 'Color']);
    expect(result.source.options).toEqual(SHEETS.map(s => s.name));
  });

  test('returns the filters unchanged when there are no cards yet', () => {
    const result = Filters(freshState(), {
      type: 'FILTERS_CALCULATE',
      cardsFiltered: null,
    } as any);
    expect(result).toEqual(freshState());
  });

  test('does not mutate the option arrays it was given on FILTERS_CALCULATE', () => {
    const before = freshState();
    Filters(before, { type: 'FILTERS_CALCULATE', cardsFiltered: cards } as any);
    expect(before.sheet.options).toEqual(['All']);
    expect(before.class.options).toEqual(['All']);
    expect(before.tier.options).toEqual(['All']);
  });

  test('does not pollute the exported initial state on FILTERS_CALCULATE', () => {
    Filters(undefined, {
      type: 'FILTERS_CALCULATE',
      cardsFiltered: cards,
    } as any);
    expect(initialState.sheet.options).toEqual(['All']);
    expect(initialState.class.options).toEqual(['All']);
    expect(initialState.tier.options).toEqual(['All']);
  });

  test('returns the same state object for unhandled actions', () => {
    const before = freshState();
    expect(Filters(before, { type: 'NOT_A_FILTERS_ACTION' })).toBe(before);
  });
});

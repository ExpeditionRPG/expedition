import * as React from 'react';
import {filterAndFormatCards} from './Cards';

const dummyFilters = {
  class: {
    current: 'All',
  },
  sheet: {
    current: 'All',
  },
  theme: {
    current: 'BlackAndWhite',
  },
  tier: {
    current: 'All',
  },
};

describe('Cards actions', () => {

  describe('Download cards', () => {
    test.skip('returns an error if HTTP errors', () => { /* TODO */ });
    test.skip('dispatches actions on success', () => { /* TODO */ });
    test.skip('end to end downloads a simple sheet and returns expected state', () => { /* TODO */ });
  });

  describe('filterAndFormatCards', () => {
    test('nulls properties that are just hyphens or blank', () => {
      const cards = [{
        class: '',
        sheet: 'test',
        tier: '-',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned).toEqual([{sheet: 'test'}]);
    });

    test('bolds "statement: text" structures', () => {
      const cards = [{
        text: 'statement: text',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual([<strong key={0}>statement:</strong>, ' text']);
    });

    test('bolds "statement: text. statement: text" structures', () => {
      const cards = [{
        text: 'statement: text. statement: text',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual([<strong key={0}>statement:</strong>, ' text.', <strong key={2}> statement:</strong>, ' text']);
    });

    test('wraps symbols like &gt; in a symbol span', () => {
      const cards = [{
        text: '&gt;',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual(<span key={0} className="symbol">{'&gt;'}</span>);
    });

    test('inserts #icons', () => {
      const cards = [{
        text: '#roll',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual(<img key={0} className="inline_icon svg roll_small" src={`/images/icons/roll_small.svg`}/>);
    });

    test('wraps \nOR\n for better styling', () => {
      const cards = [{
        text: 'Choose one \nOR\n two',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual(['Choose one ', <div key={1} className="or">OR</div>, ' two']);
    });

    test('replaces newlines with <br/>s', () => {
      const cards = [{
        text: 'The target regains\n6 health.',
      }];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual(['The target regains', <br key={1}/>, '6 health.']);
    });

    test('filters by sheet, tier and class', () => {
      const filters = {
        class: {
          current: 'Class',
        },
        sheet: {
          current: 'Sheet',
        },
        tier: {
          current: 'Tier',
        },
      };
      const cards = [
        {
          class: 'Class',
          sheet: 'Sheet',
          tier: 'Tier',
        },
        {
          class: 'Class',
          sheet: 'SheetNope',
          tier: 'Tier',
        },
        {
          class: 'Class',
          sheet: 'Sheet',
          tier: 'TierNope',
        },
        {
          class: 'ClassNope',
          sheet: 'Sheet',
          tier: 'Tier',
        },
      ];
      const cleaned = filterAndFormatCards(cards, filters);
      expect(cleaned.length).toEqual(1);
      expect(cleaned[0]).toEqual(cards[0]);
    });
  });
});

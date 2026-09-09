import * as React from 'react';
import { downloadCards, filterAndFormatCards } from './Cards';
import { getStore } from '../Store';
import { SHEETS } from '../Constants';

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
    let xhr: jest.SpyInstance;
    beforeEach(() => {
      xhr = jest.spyOn(XMLHttpRequest.prototype, 'send');
    });
    function respond(csv: string, status = 200) {
      xhr.mockImplementation(function (this: XMLHttpRequest) {
        Object.defineProperty(this, 'status', { value: status });
        Object.defineProperty(this, 'readyState', { value: 4 });
        Object.defineProperty(this, 'responseText', { value: csv });
        this.dispatchEvent(new ProgressEvent('load'));
      });
    }
    test('reports HTTP errors and clears loading state', async () => {
      respond('unavailable', 500);
      await getStore().dispatch(
        downloadCards('https://example.com/cards.csv', 'Encounter'),
      );
      expect(getStore().getState().cards.loading).toBe(false);
      expect(getStore().getState().cards.error).toEqual(expect.any(String));
    });
    test('dispatches loading, update, filter and choices on success', async () => {
      respond('name,class,tier,Comment,hide\nArcher,Ranged,1,,');
      const store = getStore();
      const dispatch = jest.fn(action => store.dispatch(action));
      await downloadCards(
        'https://example.com/cards.csv',
        'Encounter',
      )(dispatch);
      expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual([
        'CARDS_LOADING',
        'CARDS_UPDATE',
        'CARDS_FILTER',
        'FILTERS_CALCULATE',
      ]);
      expect(store.getState().cards.loading).toBe(false);
      expect(store.getState().cards.error).toBeUndefined();
    });
    test('downloads CSV through the real parser and reducers, excluding hidden/comment rows', async () => {
      respond(
        'name,class,tier,Comment,hide\nArcher,Ranged,1,,\nSecret,Beast,2,,true\nDraft,Beast,3,unfinished,\nGoblin,Beast,1,,',
      );
      const store = getStore();
      await store.dispatch(
        downloadCards('https://example.com/cards.csv', 'Encounter'),
      );
      expect(
        store.getState().cards.data.map((card: { name: string }) => card.name),
      ).toEqual(['Goblin', 'Archer']);
      expect(store.getState().cards.filtered).toHaveLength(2);
      expect(store.getState().filters.class.options).toEqual([
        'All',
        'Beast',
        'Ranged',
      ]);
    });
    test('recognizes the published Translations sheet name', async () => {
      respond('Language,Translated\nTier,Niveau');
      const source = {
        name: 'Test translations',
        key: 'test',
        sheets: { Translations: '1' },
      };
      SHEETS.push(source);
      try {
        await getStore().dispatch(downloadCards(source.name));
        expect(getStore().getState().cards.translations).toEqual({
          AdjectiveAfterNoun: false,
          tier: 'Niveau',
        });
      } finally {
        SHEETS.pop();
      }
    });
  });

  describe('filterAndFormatCards', () => {
    test('nulls properties that are just hyphens or blank', () => {
      const cards = [
        {
          class: '',
          sheet: 'test',
          tier: '-',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned).toEqual([{ sheet: 'test' }]);
    });

    test('bolds "statement: text" structures', () => {
      const cards = [
        {
          text: 'statement: text',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual([
        <strong key={0}>statement:</strong>,
        ' text',
      ]);
    });

    test('bolds "statement: text. statement: text" structures except flavortext', () => {
      const cards = [
        {
          text: 'statement: text. statement: text',
          flavortext: 'not: bolded',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual([
        <strong key={0}>statement:</strong>,
        ' text.',
        <strong key={2}> statement:</strong>,
        ' text',
      ]);
      expect(cleaned[0].flavortext).toEqual(['not:', ' bolded']);
    });

    test('wraps symbols like &gt; in a symbol span', () => {
      const cards = [
        {
          text: '&gt;',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual(
        <span key={0} className="symbol">
          {'&gt;'}
        </span>,
      );
    });

    test('inserts #icons', () => {
      const cards = [
        {
          text: '#roll',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual(
        <img
          key={0}
          className="inline_icon svg roll_small"
          src={`/images/icons/roll_small.svg`}
        />,
      );
    });

    test('wraps \nOR\n for better styling', () => {
      const cards = [
        {
          text: 'Choose one \nOR\n two',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual([
        'Choose one ',
        <div key={1} className="or">
          OR
        </div>,
        ' two',
      ]);
    });

    test('replaces newlines with <br/>s', () => {
      const cards = [
        {
          text: 'The target regains\n6 health.',
        },
      ];
      const cleaned = filterAndFormatCards(cards, dummyFilters);
      expect(cleaned[0].text).toEqual([
        'The target regains',
        <br key={1} />,
        '6 health.',
      ]);
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

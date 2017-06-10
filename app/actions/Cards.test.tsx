import * as React from 'react'
import {filterAndFormatCards} from './Cards'

const dummyFilters = {
  sheet: {
    current: 'All',
  },
  tier: {
    current: 'All',
  },
  class: {
    current: 'All',
  },
  theme: {
    current: 'BlackAndWhite',
  },
};

describe('Cards actions', () => {

  describe('Download cards', () => {
    it('returns an error if HTTP errors');
    it('dispatches actions on success');
    it('end to end downloads a simple sheet and returns expected state');
  });

  it('nulls properties that are just hyphens or blank', () => {
    const cards = [{
      sheet: 'test',
      tier: '-',
      class: '',
    }];
    const cleaned = filterAndFormatCards(cards, dummyFilters);
    expect(cleaned).toEqual([{sheet: 'test'}]);
  });

  it('bolds "statement: text" structures', () => {
    const cards = [{
      text: 'statement: text',
    }];
    const cleaned = filterAndFormatCards(cards, dummyFilters);
    expect(cleaned[0].text).toEqual([<strong key={0}>statement: </strong>, 'text']);
  });

  // TODO is there a better way to test this, that confirms the symbol is actually rendered into the contents?
  it('replaces symbols like &gt; -> >', () => {
    const cards = [{
      text: '&gt;',
    }];
    const cleaned = filterAndFormatCards(cards, dummyFilters);
    expect(cleaned[0].text).toEqual(<span key={0} className="symbol" dangerouslySetInnerHTML={{__html: '&gt;'}}></span>);
  });

  it('inserts #icons', () => {
    const cards = [{
      text: '#roll',
    }];
    const cleaned = filterAndFormatCards(cards, dummyFilters);
    expect(cleaned[0].text).toEqual(<img key={0} className="inline_icon svg" src={`/themes/BlackAndWhite/images/icon/roll_small.svg`}/>);
  });

  it('wraps \nOR\n for better styling', () => {
    const cards = [{
      text: 'Choose one \nOR\n two',
    }];
    const cleaned = filterAndFormatCards(cards, dummyFilters);
    expect(cleaned[0].text).toEqual(['Choose one ', <div key={1} className="or">OR</div>, ' two']);
  });

  it('replaces newlines with <br/>s', () => {
    const cards = [{
      text: 'The target regains\n6 health.',
    }];
    const cleaned = filterAndFormatCards(cards, dummyFilters);
    expect(cleaned[0].text).toEqual(['The target regains', <br key={1}/>, '6 health.']);
  });

  it('filters by sheet, tier and class', () => {
    const filters = {
      sheet: {
        current: 'Sheet',
      },
      tier: {
        current: 'Tier',
      },
      class: {
        current: 'Class',
      },
    };
    const cards = [
      {
        sheet: 'Sheet',
        tier: 'Tier',
        class: 'Class',
      },
      {
        sheet: 'SheetNope',
        tier: 'Tier',
        class: 'Class',
      },
      {
        sheet: 'Sheet',
        tier: 'TierNope',
        class: 'Class',
      },
      {
        sheet: 'Sheet',
        tier: 'Tier',
        class: 'ClassNope',
      },
    ];
    const cleaned = filterAndFormatCards(cards, filters);
    expect(cleaned.length).toEqual(1);
    expect(cleaned[0]).toEqual(cards[0]);
  });
});

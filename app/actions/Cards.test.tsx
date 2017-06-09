import {filterAndFormatCards} from './Cards'

describe('Cards actions', () => {

  describe('Download cards', () => {
    it('returns an error if HTTP errors');
    it('dispatches actions on success');
    it('end to end downloads a simple sheet and returns expected state');
  });

  it('clears properties that are just hyphens', () => {
    const cards = [{text: 'test', score: '-'}];
    const cleaned = filterAndFormatCards(cards, {});
    expect(cleaned[0]).toEqual({text: 'test', score: ''});
  });

  it('bolds "statement: text" structures', () => {
    const cards = [{
      text: 'statement: text',
    }];
    const cleaned = filterAndFormatCards(cards, {});
    expect(cleaned[0].text).toEqual('<strong>statement:</strong> text');
  });

  it('replaces macros like &crithit', () => {
    const cards = [{
      text: '&crithit',
    }];
    const cleaned = filterAndFormatCards(cards, {});
    expect(cleaned[0].text).toEqual('#roll <span class="symbol">&ge;</span> 20');
  });

  it('replaces symbols like &gt; and &lt;', () => {
    const cards = [{
      text: '&gt;&lt;',
    }];
    const cleaned = filterAndFormatCards(cards, {});
    expect(cleaned[0].text).toEqual('><');
  });

  it('wrapers OR<br/> for better styling');

  it('inserts #icons');

  it('filters by sheet');

  it('filters by tier');

  it('filters by class');
});

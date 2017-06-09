import {cleanCardData} from './Cards'

describe('Cards actions', () => {

  describe('Download cards', () => {
    it('returns an error if HTTP errors');
    it('dispatches actions on success');
    // TODO these end to end tests should provide all of the coverage we currently have below,
    // so that we don't need to expose the private helper function
    it('end to end downloads a simple sheet and returns expected state');
  });

  it('clears properties that are just hyphens', () => {
    const card = {text: 'test', score: '-'};
    const cleaned = cleanCardData(card);
    expect(cleaned).toEqual({text: 'test', score: ''});
  });

  it('bolds "statement: text" structures', () => {
    const card = {
      text: 'statement: text',
    };
    const cleaned = cleanCardData(card);
    expect(cleaned.text).toEqual('<strong>statement:</strong> text');
  });

  it('replaces macros like &crithit', () => {
    const card = {
      text: '&crithit',
    };
    const cleaned = cleanCardData(card);
    expect(cleaned.text).toEqual('#roll <span class="symbol">&ge;</span> 20');
  });

  it('replaces characters like &gt;', () => {
    const card = {
      text: '&gt;&lt;',
    };
    const cleaned = cleanCardData(card);
    expect(cleaned.text).toEqual('><');
  });

  it('wrapers OR<br/> for better styling');
});

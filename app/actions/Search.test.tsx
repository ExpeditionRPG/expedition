import {search, searchAndPlay} from './Search'

describe('Search actions', () => {
  describe('Search', () => {
    it('calls getSearchResults with provided initial params and settings');
    it('calls getSearchResults with expansion enabled');
    it('dispatches search results'); // $10
  });

  it('searchAndPlay');

  describe('getSearchResults', () => {
    it('shows snackbar on request error');  // $10
    it('calls back with results'); // $10
  });
});

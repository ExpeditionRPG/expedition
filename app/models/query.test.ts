// TODO: test https://github.com/Fabricate-IO/expedition-quest-creator/issues/184
// We should see how to start a local msyql instance (and bigstore)
// and point the test / travis configs at it.
// (note: current travis environment variables are fillter values)

import * as Query from './query'
const expect = require('expect');

describe('query', () => {

  it('create');
  it('getId');
  it('deleteId');
  it('upsert');
  it('update');

  describe('search', () => {
    it('works with no parameters defined');
    it('test each parameter individually');
    it('edge case: order by +ratingavg');
  });

  describe('JS to PG to JS', () => {
    it('handles single quotes in strings', () => {
      const original = "He's";
      const converted = Query.internals.stringJsToPg(original);
      const returned = Query.internals.stringPgToJs(converted);
      expect(returned).toEqual(original);
    });

    it('converts keys', () => {
      const original = 'lastLogin';
      const pg = Query.internals.keyJsToPg(original);
      const returned = Query.internals.keyPgToJs(pg);
      expect(returned).toEqual(original);
      expect(pg).toEqual('last_login');
    });
  });
});

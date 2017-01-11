// TODO: This is just a skeleton.
// We should see how to start a local msyql instance (and bigstore)
// and point the test / travis configs at it.
// (note: current travis environment variables are fillter values)

const expect = require('expect');

const Query = require('./query');

describe('query', () => {

  it('create');
  it('getId');
  it('deleteId');
  it('upsert');
  it('update');

  describe('allows special characters', () => {
    it('handles single quotes', () => {
      const original = "He's";
      const converted = Query.internals.stringJsToPg(original);
      const returned = Query.internals.stringPgToJs(converted);
      expect(returned).toEqual(original);
    });
  });
});

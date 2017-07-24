// TODO: test https://github.com/Fabricate-IO/expedition-quest-creator/issues/184
// We should see how to start a local msyql instance (and bigstore)
// and point the configs at it.
// (note: current travis environment variables are fillter values)

const expect = require('expect');

describe('feedback', () => {
  it('fails if missing quest_id or user_id');

  it('succeeds if no quest_id + user_id combo exists');

  it('upserts existing quest_id + user_id entry');

  it('re-calculates quest rating avg and count on new feedback (only counting feedback with non-null ratings)');
});

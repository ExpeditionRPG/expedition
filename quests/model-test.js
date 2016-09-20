// TODO: This is just a skeleton.
// We should see how to start a local msyql instance (and bigstore)
// and point the configs at it.

import expect from 'expect'

describe('model', () => {

  describe('searchQuests', () => {
    it('returns empty array on empty');

    it('returns full single quest data');

    it('only returns published quests when no loggedInUser');

    it('also displays published quests when loggedInUser');

    it('does not display other user quests when loggedInUser');
  });

  describe('read', () => {
    it('reads full quest data');

    it('fails to read unpublished quest when no logged in user match');

    it('reads published quest when no logged in user match');
  });

  describe('update', () => {
    it('updates all non-automatic quest fields');

    it('upserts quest if no id');

    it('fails update with invalid ID');

    it('fails update from different user');
  });

  describe('tombstone', () => {
    it('sets tombstone if matching id and user');

    it('fails to set tombstone if no user match');

    it('fails to set tombstone if no id match');
  });

  describe('publish', () => {
    it('publishes owned quest');

    it('unpublishes owned quest');

    it('fails to publish/unpublish unowned quest');
  });
});
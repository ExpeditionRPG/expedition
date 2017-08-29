import * as expect from 'expect'
import {} from 'jasmine'

describe('handlers', () => {
  describe('healthCheck', () => {
    it('returns success');
  });

  describe('announcement', () => {
    it('returns with message and link');
  });

  describe('search', () => {
    it('handles missing locals');
    it('successfully searches and returns data');
  });

  describe('questXMLRedirect', () => {
    it('redirects to quest XML url');
  });

  describe('publish', () => {
    it('handles missing locals');
    it('publishes minor release');
    it('publishes major release');
  });

  describe('unpublish', () => {
    it('unpublishes a quest');
    it('handles missing locals');
  });

  desribe('feedback', () => {
    it('publishes feedback');
    it('handles bad feedback type');
  });

  describe('subscribe', () => {
    it('handles invalid email address');
    it('subscribes user to list');
  });
});

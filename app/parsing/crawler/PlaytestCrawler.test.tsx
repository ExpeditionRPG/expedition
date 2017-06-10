import {playtest} from './PlaytestCrawler'

var expect: any = require('expect');
const cheerio: any = require('cheerio') as CheerioAPI;

describe('playtest', () => {
  describe('internal-level message', () => {
    it('logs if quest is unparseable');
  });

  describe('error-level message', () => {
    it('logs if quest path is broken'); // e.g. by a bad goto

    it('logs if a node has an implicit end (no **end** tag)');

    it('logs if a node leads to an invalid node');

    it('logs if a node has multiple conditionally true events'); // test on win and on lose

    it('logs if a node has all choices hidden and "Next" is shown'); // (correctness depends on user intent here)

    it('logs if a node has an op parser failure'); // (E.g. "True" and "TRUE" aren't defined, but "true" is a constant)')
  });

  describe('warning-level message', () => {
    it('logs if quest length is too varied');

    it('logs if a node is not visited');

    it('logs if a node has been visited >10x');

    it('logs if overall quest length is too varied');

    it('logs if overall quest difficulty is way too high'); // (e.g. consistently above T6 encounters)

    it('logs if a node has too lengthy dialogue');

    it('logs if there are too many consecutive combats'); // 2 combats back-to-back? bad idea. 3 combats with single cards in between? Also bad idea.

    it('logs if there is uneven choice distribution') // (too few/too many, or alternating 0-2-0-2 etc.)
  });

  describe('debug-level message', () => {
    it('logs general reading level required for the quest');

    it('logs estimated minimum/maximum play time');

    it('logs most-visited nodes');
  });
});

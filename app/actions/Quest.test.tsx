import {initQuest} from './Quest'
import {initialState} from '../reducers/Quest'
import {defaultContext} from '../components/views/quest/cardtemplates/Template'

const cheerio = require('cheerio') as CheerioAPI;

describe('Quest actions', () => {
  describe('initQuest', () => {
    it('successfully returns the parsed quest node', () => {
      const questNode = cheerio.load('<quest><roleplay><p>Hello</p></roleplay></quest>')('quest');
      const result = initQuest(initialState.details, questNode, defaultContext());
      expect(result.node.getRootElem().toString()).toEqual('<quest><roleplay><p>Hello</p></roleplay></quest>');
    });
  });

  describe('event', () => {
    it('handles win event');

    it('handles lose event');

    it('gracefully failes on invalid event');
  });

  describe('loadNode', () => {
    it('ends quest on end trigger');

    it('dispatches roleplay on roleplay node');

    it('dispatches combat on combat node');
  })
});

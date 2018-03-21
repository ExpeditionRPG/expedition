import {initQuest} from './Quest'
import {initialState} from '../reducers/Quest'
import {defaultContext} from '../cardtemplates/Template'

const cheerio = require('cheerio') as CheerioAPI;

describe('Quest action', () => {
  describe('initQuest', () => {
    it('successfully returns the parsed quest node', () => {
      const questNode = cheerio.load('<quest><roleplay><p>Hello</p></roleplay></quest>')('quest');
      const result = initQuest(initialState.details, questNode, defaultContext());
      expect(result.node.getRootElem().toString()).toEqual('<quest><roleplay><p>Hello</p></roleplay></quest>');
    });
  });

  describe('loadNode', () => {
    it('ends quest on end trigger');

    it('dispatches roleplay on roleplay node');

    it('dispatches combat on combat node');
  })
});

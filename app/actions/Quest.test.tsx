import {initQuest} from './Quest'
import {initialState} from '../reducers/Quest'
import {defaultQuestContext} from '../reducers/Quest'

declare var require:any;
const cheerio = require('cheerio') as CheerioAPI;

describe('Quest action', () => {
  describe('initQuest', () => {
    it('successfully returns the parsed quest node', () => {
      const questNode = cheerio.load('<quest><roleplay><p>Hello</p></roleplay></quest>')('quest');
      const result = initQuest(initialState.details, questNode, defaultQuestContext());
      expect(result.node.getRootElem().toString()).toEqual('<quest><roleplay><p>Hello</p></roleplay></quest>');
    });

    it('TODO what would cause it to fail, and how should it fail?');
  });
});

import {getPlayNode} from './Editor'

const cheerio: any = require('cheerio');

describe('Editor action', () => {
  describe('setCodeView', () => {
    it('creates action');
  });

  describe('setDirty', () => {
    it('creates action');
  });

  describe('getPlayNode', () => {
    it('works on root quest node', () => {
      // TODO fix dependency chain loading - auth.tsx failing b/c utils not defined (external dependency)
      // const quest = cheerio.load('<quest><roleplay>Foo</roleplay></quest>');
      // expect(getPlayNode(quest)).toEqual(cheerio.load('<roleplay>Foo</roleplay>'));
    });

    it('works on roleplay node', () => {
      // const quest = cheerio.load('<roleplay>Foo</roleplay>');
      // expect(getPlayNode(quest)).toEqual(cheerio.load('<roleplay>Foo</roleplay>'));
    });

    it('works on combat node');

    it('alerts on invalid node');
  });

  describe('renderAndPlay', () => {
    it('renders and plays');

    it('auto-playtests');
  });
});

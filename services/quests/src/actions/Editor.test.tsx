// import {getPlayNode} from './Editor'
// const cheerio: any = require('cheerio');

describe('Editor action', () => {
  describe('setCodeView', () => {
    test.skip('creates action', () => { /* TODO */ });
  });

  describe('setDirty', () => {
    test.skip('creates action', () => { /* TODO */ });
  });

  describe('getPlayNode', () => {
    test('works on root quest node', () => {
      // TODO fix dependency chain loading - auth.tsx failing b/c utils not defined (external dependency)
      // const quest = cheerio.load('<quest><roleplay>Foo</roleplay></quest>');
      // expect(getPlayNode(quest)).toEqual(cheerio.load('<roleplay>Foo</roleplay>'));
    });

    test('works on roleplay node', () => {
      // const quest = cheerio.load('<roleplay>Foo</roleplay>');
      // expect(getPlayNode(quest)).toEqual(cheerio.load('<roleplay>Foo</roleplay>'));
    });

    test.skip('works on combat node', () => { /* TODO */ });

    test.skip('alerts on invalid node', () => { /* TODO */ });
  });

  describe('renderAndPlay', () => {
    test.skip('renders and plays', () => { /* TODO */ });

    test.skip('auto-playtests', () => { /* TODO */ });

    test.skip('pushes error on invalid node', () => { /* TODO */ });
  });
});

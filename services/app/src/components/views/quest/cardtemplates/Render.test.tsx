import {configure, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });
import {calculateAudioIntensity, generateIconElements, setAndRenderNode, findCombatParent} from './Render';
import {ParserNode} from './TemplateTypes';
import {defaultContext} from './Template';
import {newMockStore} from 'app/Testing';

const cheerio: any = require('cheerio');

describe('Render', () => {
  describe('generateIconElements', () => {
    // NOTE: Since we're dangerously setting inner html, we can't
    // use enzyme in a more principled way (e.g. finding the img element,
    // ensuring it exists, that the class is set appropriately and the src attr is
    // properly set).
    test('makes half-size svg for [art] tags', () => {
      const result = shallow(generateIconElements('[art]', 'light')).html();
      expect(result).toContain('artHalf');
      expect(result).toContain('art.svg');
    });
    test('makes full-size svg for [art_full] tags', () => {
      const result = shallow(generateIconElements('[art_full]', 'light')).html();
      expect(result).toContain('artFull');
      expect(result).toContain('art.svg');
    });
    test('makes half-size png for [art_png] tags', () => {
      const result = shallow(generateIconElements('[art_png]', 'light')).html();
      expect(result).toContain('artHalf');
      expect(result).toContain('art.png');
    });
    test('makes full-size png for [art_png_full] tags', () => {
      const result = shallow(generateIconElements('[art_png_full]', 'light')).html();
      expect(result).toContain('artFull');
      expect(result).toContain('art.png');
    });
    test('makes inline icon for :icon:', () => {
      const result = shallow(generateIconElements(':icon:', 'light')).html();
      expect(result).toContain('inline_icon');
      expect(result).toContain('icon_small.svg');
    });
    test('makes inline white icon for :icon_white: when theme is dark', () => {
      const result = shallow(generateIconElements(':icon_white:', 'dark')).html();
      expect(result).toContain('inline_icon');
      expect(result).toContain('icon_white_small.svg');
    });
  });

  describe('numberToWord', () => {
    test.skip('Converts numbers to words', () => { /* TODO */ });
    test.skip('Passes through numbers it does not recognize', () => { /* TODO */ });
  });

  describe('capitalizeFirstLetter', () => {
    test.skip('capitalizes the first letter', () => { /* TODO */ });
    test.skip('safely handles empty string', () => { /* TODO */ });
  });

  describe('findCombatParent', () => {
    test('returns node when node is combat', () => {
      const v = cheerio.load('<quest><combat id="start"></combat></quest>')('#start');
      const result = findCombatParent(new ParserNode(v, defaultContext()));
      if (result === null) {
        throw Error('null result');
      }
      expect(result.attr('id')).toEqual('start');
    });
    test('returns combat parent', () => {
      const v = cheerio.load('<quest><combat id="expected"><event on="round"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      const result = findCombatParent(new ParserNode(v, defaultContext()));
      if (result === null) {
        throw Error('null result');
      }
      expect(result.attr('id')).toEqual('expected');
    });
    test('does not return combat when node is within a win/lose event', () => {
      const v = cheerio.load('<quest><combat><event on="win"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      expect(findCombatParent(new ParserNode(v, defaultContext()))).toEqual(null);
    });
  });

  describe('setAndRenderNode', () => {
    test('renders roleplay', () => {
      const v = cheerio.load('<quest><combat><event on="win"><roleplay id="start"></roleplay></event></combat></quest>')('#start');
      const store = newMockStore({});
      store.dispatch(setAndRenderNode(new ParserNode(v, defaultContext())));
      const action = store.getActions().filter((a) => a.type === 'NAVIGATE')[0];
      expect(action.to.name).toEqual('QUEST_CARD');
      expect(action.to.phase).not.toBeDefined();
    });

    test('renders mid-combat roleplay', () => {
      const v = cheerio.load('<quest><combat><event on="round"><roleplay id="midcombat"></roleplay></event></combat></quest>')('#midcombat');
      const store = newMockStore({});
      store.dispatch(setAndRenderNode(new ParserNode(v, defaultContext())));
      const action = store.getActions().filter((a) => a.type === 'NAVIGATE')[0];
      expect(action.to.name).toEqual('QUEST_CARD');
      expect(action.to.phase).toEqual('MID_COMBAT_ROLEPLAY');
    });

    test('renders combat', () => {
      const v = cheerio.load('<quest><combat id="combat"></combat></quest>')('#combat');
      const store = newMockStore({settings: {numLocalPlayers: 2}});
      store.dispatch(setAndRenderNode(new ParserNode(v, defaultContext())));
      const action = store.getActions().filter((a) => a.type === 'NAVIGATE')[0];
      expect(action.to.name).toEqual('QUEST_CARD');
      expect(action.to.phase).toEqual('DRAW_ENEMIES');
    });

    test('renders decision', () => {
      const v = cheerio.load('<quest><decision id="decision"></decision></quest>')('#decision');
      const store = newMockStore({});
      store.dispatch(setAndRenderNode(new ParserNode(v, defaultContext())));
      const action = store.getActions().filter((a) => a.type === 'NAVIGATE')[0];
      expect(action.to.name).toEqual('QUEST_CARD');
      expect(action.to.phase).toEqual('PREPARE_DECISION');
    });
  });

  describe('calculateAudioIntensity', () => {
    test.only('returns intensity for normal combat', () => {
      const ctx = defaultContext();
      ctx.templates.combat = {tier: 2, numAliveAdventurers: 1, roundCount: 1};
      const node = new ParserNode(cheerio.load('<quest><combat id="combat"></combat></quest>')('#combat'), ctx);
      expect(calculateAudioIntensity(node, 2)).toEqual(13);
    });

    test('returns 0 for non-combat', () => {
      const node = new ParserNode(cheerio.load('<quest><roleplay id="rp"></roleplay></quest>')('#rp'), defaultContext());
      expect(calculateAudioIntensity(node, 2)).toEqual(0);
    });
  });
});

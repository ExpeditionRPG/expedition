/// <reference path="../../../typings/expect/expect.d.ts" />
/// <reference path="../../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../typings/custom/require.d.ts" />

import {Block} from '../block/BlockList'
import {BlockRenderer} from './BlockRenderer'
import {XMLRenderer} from './XMLRenderer'
import {Logger, prettifyMsgs} from '../Logger'
import TestData from './TestData'

var prettifyHTML = (require("html") as any).prettyPrint;

var expect: any = require('expect');
var cheerio: any = require('cheerio');



describe('BlockRenderer', () => {
  // BlockRenderer is stateless
  var br = new BlockRenderer(XMLRenderer);

  describe('toCombat', () => {
    it('errors on bad parsing', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['ha! this will never parse'],
          startLine: 0,
        }
      ];

      br.toCombat(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.genericCombatXML);
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.combatBadParseLog);
    });

    it ('errors without enemies or events', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['_combat_'],
          startLine: 0,
        }
      ];

      br.toCombat(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.genericCombatXML);
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.combatNoEnemyOrEventsLog);
    })

    it('errors on inner block without event bullet');

    it('renders full combat', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['_combat_', '', '- e1', '- e2', '* on win'],
          startLine: 0,
        },
        {
          indent: 2,
          lines: [],
          render: XMLRenderer.toRoleplay({}, ['win']),
          startLine: 2,
        },
        {
          indent: 0,
          lines: ['* on lose'],
          startLine: 4,
        },
        {
          indent: 2,
          lines: [],
          render: XMLRenderer.toRoleplay({}, ['lose']),
          startLine: 2,
        },
      ];

      br.toCombat(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.fullCombatXML);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('errors if no combat enemies');

    it('errors if inner combat block with no event bullet');

    it('errors if invalid combat event');

    it('errors if invalid combat enemy');

    it('errors if missing combat event');
  });

  describe('toRoleplay', () => {
    it('renders full roleplay', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['_roleplay_', '', 'text', '', '* choice'],
          startLine: 0,
        },
        {
          indent: 2,
          lines: [],
          render: XMLRenderer.toRoleplay({}, ['choice text']),
          startLine: 2,
        },
        {
          indent: 0,
          lines: ['* other choice'],
          startLine: 4,
        },
        {
          indent: 2,
          lines: [],
          render: XMLRenderer.toRoleplay({}, ['other choice text']),
          startLine: 2,
        },
      ];

      br.toRoleplay(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.fullRoleplayXML);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders roleplay without title', () => {
      var log = new Logger();
      var blocks: Block[] = [
        { lines: [ 'Victory!', '' ],
          indent: 4,
          startLine: 21
        }
      ];

      br.toRoleplay(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayNoTitle);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('errors if invalid roleplay attribute');

    it('errors if invalid choice attribute');

  });

  describe('toTrigger', () => {
  });

  describe('toQuest', () => {
    it('errors if unparseable quest attribute');


    it('errors if unknown quest attribute', () => {
      /*
      var qdl = new BlockRendererQDLParser(XMLRenderer);

      qdl.render(new BlockList(TestData.badQuestAttrMD));

      expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.badQuestAttrError);
      */
    });

    it('errors if invalid quest attribute', () => {
      /*
      var qdl = new QDLParser(XMLRenderer);

      qdl.render(new BlockList(TestData.invalidQuestAttrMD));

      expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.invalidQuestAttrError);
      */
    })

    it('errors if missing quest title', () => {
      /*
      var qdl = new QDLParser(XMLRenderer);

      qdl.render(new BlockList(TestData.invalidQuestAttrMD));

      expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.invalidQuestAttrError);
      */
    });
  });

  describe('toMeta', () => {
  });

  describe('validate', () => {

  });

  describe('finalize', () => {

  });
});
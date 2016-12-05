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

    it('renders conditional events', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['_combat_', '', '- e1', '- e2', '* {{test1}} on win'],
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
          lines: ['* {{test2}} on lose'],
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

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.combatConditionalEventXML);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders with JSON', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['_combat_ {"enemies": [{"text":"skeleton"}, {"text":"test", "visible":"cond"}]}', '', '* {{test1}} on win'],
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
          lines: ['* {{test2}} on lose'],
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

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.combatJSONEnemyXML);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('errors if inner combat block with no event bullet');

    it('errors if invalid combat event');

    it('errors if invalid combat enemy');
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

    it('renders conditional choices', () => {
      var log = new Logger();
      var blocks: Block[] = [
        {
          indent: 0,
          lines: ['_roleplay_', '', 'text', '', '* {{test1}} choice'],
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
          lines: ['* {{test2}} other choice'],
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

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayConditionalChoiceXML);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders with ID', () => {
      var log = new Logger();
      var blocks: Block[] = [
        { lines: [ '_Title_ (#testid123)', '', 'hi' ],
          indent: 4,
          startLine: 21
        }
      ];

      br.toRoleplay(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayWithID);
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders with JSON');

    it('errors if invalid roleplay attribute');

    it('errors if invalid choice attribute');

  });

  describe('toTrigger', () => {
    it('renders end', () => {
      var log = new Logger();
      var blocks: Block[] = [
        { lines: [ '**end**', '' ],
          indent: 4,
          startLine: 21
        }
      ];

      br.toTrigger(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual('<trigger>end</trigger>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders goto', () => {
      var log = new Logger();
      var blocks: Block[] = [
        { lines: [ '**goto testid123**', '' ],
          indent: 4,
          startLine: 21
        }
      ];

      br.toTrigger(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual('<trigger>goto testid123</trigger>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders condition', () => {
      var log = new Logger();
      var blocks: Block[] = [
        { lines: [ '**{{a}} end**', '' ],
          indent: 4,
          startLine: 21
        }
      ];

      br.toTrigger(blocks, log)

      expect(prettifyHTML(blocks[0].render + '')).toEqual('<trigger if="a">end</trigger>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('errors if multiple blocks');

    it('errors on bad parsing');
  });

  describe('toQuest', () => {
    it('renders', () => {
      var log = new Logger();
      var block: Block = {
        lines: [ '#Quest Title', 'minplayers: 1', 'maxplayers: 2', 'author: Test' ],
        indent: 0,
        startLine: 0
      };

      br.toQuest(block, log)

      expect(prettifyHTML(block.render + '')).toEqual('<quest title="Quest Title" author="Test" minplayers="1" maxplayers="2"></quest>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    })

    it('errors if unparseable quest attribute', () => {
      var log = new Logger();
      var block: Block = {
        lines: [ '#Quest Title', 'minplayers1', 'maxplayers: 2', 'author: Test' ],
        indent: 0,
        startLine: 0
      };

      br.toQuest(block, log)

      expect(prettifyHTML(block.render + '')).toEqual('<quest title="Quest Title" author="Test" maxplayers="2"></quest>');
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.badParseQuestAttrError);
    });


    it('errors if unknown quest attribute', () => {
      var log = new Logger();
      var block: Block = {
        lines: [ '#Quest Title', 'minplayers: 1', 'maxplayers: 2', 'author: Test', 'testparam: hi' ],
        indent: 0,
        startLine: 0
      };

      br.toQuest(block, log)

      expect(prettifyHTML(block.render + '')).toEqual('<quest title="Quest Title" author="Test" minplayers="1" maxplayers="2"></quest>');
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.badQuestAttrError);
    });

    it('errors if invalid quest attribute', () => {
      var log = new Logger();
      var block: Block = {
        lines: [ '#Quest Title', 'minplayers: hi', 'maxplayers: 2', 'author: Test' ],
        indent: 0,
        startLine: 0
      };

      br.toQuest(block, log)

      expect(prettifyHTML(block.render + '')).toEqual('<quest title="Quest Title" author="Test" minplayers="0" maxplayers="2"></quest>');
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.invalidQuestAttrError);
    })
  });

  describe('toMeta', () => {
  });

  describe('validate', () => {
  });

  describe('finalize', () => {
  });
});
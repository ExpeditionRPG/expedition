import {Block} from '../block/BlockList';
import {Logger, prettifyMsgs} from '../Logger';
import {BlockRenderer} from './BlockRenderer';
import TestData from './TestData';
import {XMLRenderer} from './XMLRenderer';

const prettifyHTML = (require('html') as any).prettyPrint;

describe('BlockRenderer', () => {
  // BlockRenderer is stateless
  const br = new BlockRenderer(XMLRenderer);

  describe('toNode', () => {
    describe('combat', () => {
      it('errors on bad bullet json', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_', '', '- e1', '', '* on win {invalid_json}'],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['win'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.badJSONXML);
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.badJSONLog);
      });

      it ('errors without enemies or events', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_'],
            startLine: 0,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.genericCombatXML);
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.combatNoEnemyOrEventsLog);
      });

      it ('errors with bad enemy tier', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_', '', '- Thief {"tier": -1}', '- Thief', '', '* on win'],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['win'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.combatBadTierLog);
      });

      it('errors on inner block without event bullet');

      it('renders full combat', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_', '', '- e1', '- e2 {"tier": 3}', '', '* on win'],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['win'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);
        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.fullCombatXML);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders conditional events', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_', '', '- e1', '- e2', '', '* {{test1}} on win'],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['win'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.combatConditionalEventXML);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('errors if inner combat block with no event bullet');

      it('errors if invalid combat event');

      it('errors if invalid combat enemy');
    });

    describe('roleplay', () => {
      it('renders with JSON', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: [
              '_combat_ {"enemies": [{"text":"skeleton"}, {"text":"test", "visible":"cond"}]}',
              '',
              '* {{test1}} on win {"heal": 2}',
            ],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['win'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.combatJSONEnemyXML);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders full roleplay', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_Title_', '', 'text', '', '* choice'],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['choice text'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['other choice text'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.fullRoleplayXML);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders roleplay without title', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: [ 'Victory!', '' ],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayNoTitle);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders roleplay with title that has icon', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: ['_Title with :roll:, :rune_alpha:_', 'Victory!', '' ],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayTitleIcons);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders roleplay with title that has icon and ID', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: ['_Title with :roll:, :rune_alpha:_ (#id)', 'Victory!', '' ],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayTitleIconsId);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders conditional choices', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_Title_', '', 'text', '', '* {{test1}} choice'],
            startLine: 0,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['choice text'], 2),
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
            render: XMLRenderer.toTemplate('roleplay', {}, ['other choice text'], 3),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayConditionalChoiceXML);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('alerts the user to choice without text', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_Title_', '', 'text', '', '* {{test1}}'],
            startLine: 5,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['choice text'], 7),
            startLine: 7,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayChoiceNoTitle);
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.missingTitleErr);
      });

      it('alerts the user to choice with invalid choice string', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_Title_', '', 'text', '', '* {{test1'],
            startLine: 5,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['choice text'], 7),
            startLine: 7,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayChoiceNoParse);
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.invalidChoiceStringErr);
      });

      it('renders with ID', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: [ '_Title_ (#testid123)', '', 'hi' ],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(TestData.roleplayWithID);
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      it('renders with JSON');

      it('errors if invalid roleplay attribute');

      it('errors if invalid choice attribute');
    });
  });

  describe('toTrigger', () => {
    it('renders end', () => {
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 4,
          lines: [ '**end**', '' ],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual('<trigger data-line="21">end</trigger>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders goto', () => {
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 4,
          lines: [ '**goto testid123**', '' ],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual('<trigger data-line="21">goto testid123</trigger>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('renders condition', () => {
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 4,
          lines: [ '**{{a}} end**', '' ],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual('<trigger if="a" data-line="21">end</trigger>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('errors if multiple blocks');

    it('errors on bad parsing');
  });

  describe('toQuest', () => {
    it('renders', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: [ '#Quest Title' ],
        startLine: 0,
      };

      br.toQuest(block, log);

      expect(prettifyHTML(block.render + '')).toEqual('<quest title="Quest Title" data-line="0"></quest>');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    it('errors if unparseable quest attribute', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: [ '#Quest Title', 'minplayers1' ],
        startLine: 0,
      };

      br.toQuest(block, log);

      expect(prettifyHTML(block.render + '')).toEqual('<quest title="Quest Title" data-line="0"></quest>');
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.badParseQuestAttrError);
    });
  });

  describe('toMeta', () => {
    it('TODO');
  });

  describe('validate', () => {
    it('TODO');
  });

  describe('finalize', () => {
    it('TODO');
  });
});

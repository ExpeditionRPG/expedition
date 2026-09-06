import { Block } from '../block/BlockList';
import { Logger, prettifyMsgs } from '../Logger';
import { BlockRenderer } from './BlockRenderer';
import TestData from './TestData';
import { XMLRenderer } from './XMLRenderer';

const prettifyHTML = (require('html') as any).prettyPrint;

describe('BlockRenderer', () => {
  // BlockRenderer is stateless
  const br = new BlockRenderer(XMLRenderer);

  describe('toNode', () => {
    describe('combat', () => {
      test('errors on bad bullet json', () => {
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

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.badJSONXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.badJSONLog);
      });

      it('errors without enemies or events', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_'],
            startLine: 0,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.genericCombatXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual(
          TestData.combatNoEnemyOrEventsLog,
        );
      });

      test('errors on lack of whitespace after enemy list', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_', '', '- Thief', '- Thief', '* on win'],
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
        expect(prettifyMsgs(log.finalize())).toEqual(
          TestData.combatBadWhitespace,
        );
      });

      test('errors with bad enemy tier', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: [
              '_combat_',
              '',
              '- Thief {"tier": -1}',
              '- Thief',
              '',
              '* on win',
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

      test('errors on inner block without event bullet', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_combat_', '', '- Skeleton', ''],
            startLine: 0,
          },
          {
            // Indented section that no "* on <event>" bullet introduced.
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['inner'], 2),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        // The orphaned block is dropped, and win/lose are backfilled with
        // default "end" triggers.
        expect(blocks[0].render + '').toEqual(
          '<combat data-line="0"><e>Skeleton</e>' +
            '<event on="win"><trigger>end</trigger></event>' +
            '<event on="lose"><trigger>end</trigger></event></combat>',
        );
        expect(prettifyMsgs(log.finalize())).toEqual(
          TestData.combatOrphanedInnerBlockLog,
        );
      });

      test('renders full combat', () => {
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
        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.fullCombatXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders conditional events', () => {
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

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.combatConditionalEventXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      // Left skipped: this stub is a duplicate of "errors on inner block
      // without event bullet" above - the same code path (BlockRenderer.toNode
      // logging 411 for a rendered block with no owning bullet), the same
      // inputs, the same assertions. Reviving it would only double-count.
      test.skip('errors if inner combat block with no event bullet', () => {
        /* TODO */
      });

      test('errors if invalid combat event', () => {
        // Anything in a combat card that isn't an enemy or an event bullet is
        // rejected rather than rendered as a paragraph.
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: [
              '_combat_',
              '',
              '- Skeleton',
              '',
              'just some text',
              '',
              '* on win',
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
            lines: ['* on lose'],
            startLine: 6,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 7,
          },
        ];

        br.toNode(blocks, log);

        // The freestanding text is dropped from the rendered combat card.
        expect(blocks[0].render + '').toEqual(
          '<combat data-line="0"><e>Skeleton</e>' +
            '<event on="win"><roleplay data-line="2"><p>win</p></roleplay></event>' +
            '<event on="lose"><roleplay data-line="3"><p>lose</p></roleplay></event></combat>',
        );
        expect(prettifyMsgs(log.finalize())).toEqual(
          TestData.combatFreestandingTextLog,
        );
      });

      test('errors if invalid combat enemy', () => {
        // An enemy bullet whose trailing JSON blob doesn't parse.
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: [
              '_combat_',
              '',
              '- Skeleton {not json}',
              '- Thief',
              '',
              '* on win',
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
            lines: ['* on lose'],
            startLine: 5,
          },
          {
            indent: 2,
            lines: [],
            render: XMLRenderer.toTemplate('roleplay', {}, ['lose'], 3),
            startLine: 6,
          },
        ];

        br.toNode(blocks, log);

        // The unparseable enemy is skipped; the valid one still renders.
        expect(blocks[0].render + '').toEqual(
          '<combat data-line="0"><e>Thief</e>' +
            '<event on="win"><roleplay data-line="2"><p>win</p></roleplay></event>' +
            '<event on="lose"><roleplay data-line="3"><p>lose</p></roleplay></event></combat>',
        );
        expect(prettifyMsgs(log.finalize())).toEqual(
          TestData.combatBadEnemyJSONLog,
        );
      });
    });

    describe('roleplay', () => {
      test('renders with JSON', () => {
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

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.combatJSONEnemyXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders full roleplay', () => {
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
            render: XMLRenderer.toTemplate(
              'roleplay',
              {},
              ['other choice text'],
              3,
            ),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.fullRoleplayXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders roleplay without title', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: ['Victory!', ''],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayNoTitle,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders roleplay with title that has icon', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: ['_Title with :roll:, :rune_alpha:_', 'Victory!', ''],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayTitleIcons,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders roleplay with title that has icon and ID', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: ['_Title with :roll:, :rune_alpha:_ (#id)', 'Victory!', ''],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayTitleIconsId,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders conditional choices', () => {
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
            render: XMLRenderer.toTemplate(
              'roleplay',
              {},
              ['other choice text'],
              3,
            ),
            startLine: 2,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayConditionalChoiceXML,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('alerts the user to choice without text', () => {
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

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayChoiceNoTitle,
        );
        expect(prettifyMsgs(log.finalize())).toEqual(TestData.missingTitleErr);
      });

      test('alerts the user to choice with invalid choice string', () => {
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

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayChoiceNoParse,
        );
        expect(prettifyMsgs(log.finalize())).toEqual(
          TestData.invalidChoiceStringErr,
        );
      });

      test('renders with ID', () => {
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 4,
            lines: ['_Title_ (#testid123)', '', 'hi'],
            startLine: 21,
          },
        ];

        br.toNode(blocks, log);

        expect(prettifyHTML(blocks[0].render + '')).toEqual(
          TestData.roleplayWithID,
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      test('renders with JSON', () => {
        // The sibling "renders with JSON" test above is actually a combat card;
        // this one covers a JSON blob on a roleplay header.
        const log = new Logger();
        const blocks: Block[] = [
          {
            indent: 0,
            lines: ['_Title_ {"icon": "adventurer"}', '', 'text'],
            startLine: 0,
          },
        ];

        br.toNode(blocks, log);

        expect(blocks[0].render + '').toEqual(
          '<roleplay icon="adventurer" title="Title" data-line="0"><p>text</p></roleplay>',
        );
        expect(prettifyMsgs(log.finalize())).toEqual('');
      });

      // Left skipped: BlockRenderer has no whitelist of roleplay attributes, so
      // there is nothing to assert. Unknown keys in a card's JSON blob are
      // copied onto the element verbatim (see the "renders with JSON" test
      // above). Implementing this is the outstanding
      // "Validate roleplay attributes (w/ whitelist)" TODO in XMLRenderer.validate.
      test.skip('errors if invalid roleplay attribute', () => {
        /* TODO */
      });

      // Left skipped for the same reason: no choice-attribute whitelist exists
      // yet ("Validate choice attributes (w/ whitelist)" in XMLRenderer.validate).
      // Malformed choice *syntax* is already covered by "alerts the user to
      // choice with invalid choice string".
      test.skip('errors if invalid choice attribute', () => {
        /* TODO */
      });
    });
  });

  describe('toTrigger', () => {
    test('renders end', () => {
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 4,
          lines: ['**end**', ''],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual(
        '<trigger data-line="21">end</trigger>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    test('renders goto', () => {
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 4,
          lines: ['**goto testid123**', ''],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual(
        '<trigger data-line="21">goto testid123</trigger>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    test('renders condition', () => {
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 4,
          lines: ['**{{a}} end**', ''],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual(
        '<trigger if="a" data-line="21">end</trigger>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    test('errors if multiple blocks', () => {
      // A trigger is always a single line; an indented block following it means
      // the author's whitespace is wrong.
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 0,
          lines: ['**end**'],
          startLine: 21,
        },
        {
          indent: 2,
          lines: ['accidentally indented'],
          startLine: 22,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual(
        '<trigger data-line="21">end</trigger>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual(
        TestData.triggerIndentedSectionLog,
      );
    });

    test('errors on bad parsing', () => {
      // An empty block has no line to parse; the renderer must log and fall
      // back to an "end" trigger rather than throwing.
      const log = new Logger();
      const blocks: Block[] = [
        {
          indent: 0,
          lines: [],
          startLine: 21,
        },
      ];

      br.toTrigger(blocks, log);

      expect(prettifyHTML(blocks[0].render + '')).toEqual(
        '<trigger data-line="21">end</trigger>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.triggerBadParseLog);
    });
  });

  describe('toQuest', () => {
    test('renders', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: ['#Quest Title'],
        startLine: 0,
      };

      br.toQuest(block, log);

      expect(prettifyHTML(block.render + '')).toEqual(
        '<quest title="Quest Title" data-line="0"></quest>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    test('errors if unparseable quest attribute', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: ['#Quest Title', 'minplayers1'],
        startLine: 0,
      };

      br.toQuest(block, log);

      expect(prettifyHTML(block.render + '')).toEqual(
        '<quest title="Quest Title" data-line="0"></quest>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual(
        TestData.badParseQuestAttrError,
      );
    });
  });

  describe('toMeta', () => {
    test('returns an UNKNOWN title when there is no block', () => {
      expect(br.toMeta(undefined as any)).toEqual({ title: 'UNKNOWN' });
    });

    test('parses the title off the quest header', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: ['#  Quest Title  '],
        startLine: 0,
      };

      expect(br.toMeta(block, log).title).toEqual('Quest Title');
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    test('normalizes attribute lines and warns that they are deprecated', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: [
          '#Quest Title',
          'minplayers: 2',
          'summary: hi',
          '',
          'not part of the header',
        ],
        startLine: 0,
      };

      const meta = br.toMeta(block, log);

      expect(meta.title).toEqual('Quest Title');
      expect(meta.minplayers).toEqual(2); // normalized from the string '2'
      expect(meta.summary).toEqual('hi');
      expect(prettifyMsgs(log.finalize())).toEqual(
        TestData.deprecatedQuestAttrsLog,
      );
    });

    test('errors on an attribute line with no colon', () => {
      const log = new Logger();
      const block: Block = {
        indent: 0,
        lines: ['#Quest Title', 'minplayers1'],
        startLine: 0,
      };

      expect(br.toMeta(block, log).title).toEqual('Quest Title');
      expect(prettifyMsgs(log.finalize())).toEqual(
        TestData.badParseQuestAttrError,
      );
    });
  });

  describe('validate', () => {
    test('delegates to the renderer and reports gotos with no target', () => {
      const log = new Logger();
      const quest = XMLRenderer.finalize(
        XMLRenderer.toQuest({ title: 'Quest Title' }, 0),
        [XMLRenderer.toTrigger({ text: 'goto nowhere' }, 7)],
      );

      br.validate(quest, log);

      expect(prettifyMsgs(log.finalize())).toEqual(
        TestData.missingGotoTargetLog,
      );
    });

    test('passes a quest whose gotos all resolve', () => {
      const log = new Logger();
      const quest = XMLRenderer.finalize(
        XMLRenderer.toQuest({ title: 'Quest Title' }, 0),
        [
          XMLRenderer.toTemplate('roleplay', { id: 'somewhere' }, ['hi'], 1),
          XMLRenderer.toTrigger({ text: 'goto somewhere' }, 7),
        ],
      );

      br.validate(quest, log);

      expect(prettifyMsgs(log.finalize())).toEqual('');
    });
  });

  describe('finalize', () => {
    test('nests rendered blocks inside the quest node', () => {
      const log = new Logger();
      const quest: Block = { indent: 0, lines: ['#Quest Title'], startLine: 0 };
      const card: Block = {
        indent: 0,
        lines: ['_Title_', '', 'hi'],
        startLine: 2,
      };
      br.toQuest(quest, log);
      br.toNode([card], log);

      expect(br.finalize([quest, card], log) + '').toEqual(
        '<quest title="Quest Title" data-line="0">' +
          '<roleplay title="Title" data-line="2"><p>hi</p></roleplay></quest>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual('');
    });

    test('errors when there are no blocks at all', () => {
      const log = new Logger();

      // Still produces a playable quest so the editor has something to show.
      expect(br.finalize([], log) + '').toEqual(
        '<quest title="Error"><roleplay></roleplay></quest>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.noQuestBlocksLog);
    });

    test('errors when the root block is not a quest header', () => {
      const log = new Logger();
      const card: Block = {
        indent: 0,
        lines: ['_Title_', '', 'hi'],
        startLine: 0,
      };
      br.toNode([card], log);

      expect(br.finalize([card], log) + '').toEqual(
        '<quest title="Error"><roleplay></roleplay></quest>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.noQuestHeaderLog);
    });

    test('reports an internal error for an unrendered block', () => {
      const log = new Logger();
      const quest: Block = { indent: 0, lines: ['#Quest Title'], startLine: 0 };
      br.toQuest(quest, log);
      const unrendered: Block = { indent: 0, lines: ['_Title_'], startLine: 2 };

      expect(br.finalize([quest, unrendered], log) + '').toEqual(
        '<quest title="Quest Title" data-line="0"><roleplay></roleplay></quest>',
      );
      expect(prettifyMsgs(log.finalize())).toEqual(TestData.unrenderedBlockLog);
    });
  });
});

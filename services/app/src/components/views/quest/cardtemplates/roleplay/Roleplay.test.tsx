import * as React from 'react';
import { shallow } from 'enzyme';
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { initialSettings } from 'app/reducers/Settings';

import { defaultContext } from '../Template';
import { ParserNode, TemplateContext } from '../TemplateTypes';
import Roleplay, { loadRoleplayNode, RoleplayResult } from './Roleplay';

import * as cheerio from 'shared/Cheerio';
import { getNextMidCombatNode } from './Actions';

function loadRP(xml: any, ctx: TemplateContext): RoleplayResult {
  return loadRoleplayNode(new ParserNode(xml, ctx));
}

describe('Roleplay', () => {
  describe('Icons', () => {
    test('parses in body', () => {
      const result = loadRP(
        cheerio.load('<roleplay><p>:roll:</p></roleplay>')('roleplay'),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual(
        '<p><img class="inline_icon" src="images/roll_small.svg" /></p>',
      );
    });
    test('parses in choices', () => {
      const result = loadRP(
        cheerio.load('<roleplay><choice text=":roll:"></choice></roleplay>')(
          'roleplay',
        ),
        defaultContext(),
      );
      expect(result.choices.length).toEqual(1);
      expect(
        result.choices[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual('<img class="inline_icon" src="images/roll_small.svg" />');
    });
    test('parses in instructions', () => {
      const result = loadRP(
        cheerio.load(
          '<roleplay><instruction><p>Text :roll:</p></instruction></roleplay>',
        )('roleplay'),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.children.props.dangerouslySetInnerHTML
          .__html,
      ).toEqual(
        '<p>Text <img class="inline_icon" src="images/roll_small.svg" /></p>',
      );
    });
    test('parses custom instruction icon', () => {
      const result = loadRP(
        cheerio.load(
          '<roleplay><instruction><p>:roll: Text</p></instruction></roleplay>',
        )('roleplay'),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.children.props.dangerouslySetInnerHTML
          .__html,
      ).toEqual('<p> Text</p>');
      expect(result.content[0].jsx.props.icon).toEqual('roll');
    });
  });

  describe('Conditionals & Ops', () => {
    test('does not display the result of ops that just set values', () => {
      const result = loadRP(
        cheerio.load('<roleplay><p>Text{{j = 1 * 1 / 10}}</p></roleplay>')(
          'roleplay',
        ),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual('<p>Text</p>');
    });
    test('does not display the result of trinaries that just set values', () => {
      const result = loadRP(
        cheerio.load(
          '<roleplay><p>Text{{j = 1}}{{j = (j == 1) ? 2 : 0}}</p></roleplay>',
        )('roleplay'),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual('<p>Text</p>');
    });
    test('processes and displays basic math / numbers', () => {
      const result = loadRP(
        cheerio.load('<roleplay><p>{{j = 1 * 1}}{{j}}</p></roleplay>')(
          'roleplay',
        ),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual('<p>1</p>');
    });
    test('processes and displays strings', () => {
      const result = loadRP(
        cheerio.load('<roleplay><p>{{j = "BOB"}}{{j}}</p></roleplay>')(
          'roleplay',
        ),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual('<p>BOB</p>');
    });
    test('displays ops inside of choices', () => {
      const result = loadRP(
        cheerio.load(
          '<roleplay><p>{{j = "BOB"}}</p><choice text="{{j}}"></choice></roleplay>',
        )('roleplay'),
        defaultContext(),
      );
      expect(
        result.choices[0].jsx.props.dangerouslySetInnerHTML.__html,
      ).toEqual('BOB');
    });
    test('respects conditionals when computing Next vs End button', () => {
      const quest = cheerio.load(
        '<quest><roleplay><p>{{a=true}}</p></roleplay><trigger if="a">end</trigger><roleplay>test</roleplay></quest>',
      )('quest');
      const result = loadRP(quest.children().eq(0), defaultContext());
      expect(result.choices).toEqual([{ jsx: <span>The End</span>, idx: 0 }]);
    });
    test('respects conditionals when displaying instructions', () => {
      const result = loadRP(
        cheerio.load(
          '<roleplay><p>{{a=true}}{{b=false}}</p><instruction if="a">a</instruction><instruction if="b">b</instruction></roleplay>',
        )('roleplay'),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.children.props.dangerouslySetInnerHTML
          .__html,
      ).toEqual('a');
    });
    test('parses conditionals inside of instructions', () => {
      const result = loadRP(
        cheerio.load(
          '<roleplay><p>{{a=1}}</p><instruction>{{a}}</instruction></roleplay>',
        )('roleplay'),
        defaultContext(),
      );
      expect(result.content.length).toEqual(1);
      expect(
        result.content[0].jsx.props.children.props.dangerouslySetInnerHTML
          .__html,
      ).toEqual('1');
    });
  });

  test('handles goto triggers', () => {
    const result = loadRP(
      cheerio.load(
        '<roleplay><p>Text</p></roleplay><trigger>goto market</trigger>',
      )('roleplay'),
      defaultContext(),
    );
    expect(result.content.length).toEqual(1);
    expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual(
      '<p>Text</p>',
    );
  });

  test('appends generic Next button if no explicit choices', () => {
    const quest = cheerio.load(
      '<quest><roleplay><p></p></roleplay><roleplay>test</roleplay></quest>',
    )('quest');
    const result = loadRP(quest.children().eq(0), defaultContext());
    expect(result.choices).toEqual([{ jsx: <span>Next</span>, idx: 0 }]);
  });

  test('does not evaluate unchosen tutorial branches while rendering a choice card', () => {
    const xml = readFileSync(
      resolve(
        process.cwd(),
        'services/app/src/quests/learning_to_adventure.xml',
      ),
      'utf8',
    );
    const quest = cheerio.load(xml);
    const node = new ParserNode(
      quest('roleplay[title="The Quest"]'),
      defaultContext(),
    );
    const originalOnError = window.onerror;
    const onError = jest.fn(() => true);
    window.onerror = onError;
    try {
      const renderCard = (card: ParserNode) =>
        shallow(
          <Roleplay
            node={card}
            questID="tutorial"
            settings={initialSettings}
            onChoice={jest.fn()}
            onRetry={jest.fn()}
          />,
        );
      renderCard(node);
      const fae = node.handleAction(0);
      expect(fae?.elem.attr('title')).toBe('A Fairly Big Problem');
      if (!fae) {
        throw new Error('Missing tutorial fae branch');
      }
      renderCard(fae);
      // The outgoing choice card remains mounted during the transition.
      renderCard(node);
      expect(onError).not.toHaveBeenCalled();
      expect(node.ctx.scope.intimidated).toBeUndefined();
      expect(fae.ctx.scope.intimidated).toBeUndefined();
    } finally {
      window.onerror = originalOnError;
    }
  });

  test('appends Retry after defeated combat immediately before the end', () => {
    const quest = cheerio.load(
      '<quest><combat/><roleplay>Defeated.</roleplay><trigger>end</trigger></quest>',
    );
    const prevNode = new ParserNode(quest('combat'), defaultContext());
    prevNode.ctx.templates.combat.numAliveAdventurers = 0;
    const node = new ParserNode(quest('roleplay'), defaultContext());
    const onRetry = jest.fn();
    const wrapper = shallow(
      <Roleplay
        node={node}
        prevNode={prevNode}
        questID="test"
        settings={initialSettings}
        onChoice={jest.fn()}
        onRetry={onRetry}
      />,
    );
    const retry = wrapper.findWhere(
      element => element.prop('children') === 'Retry combat',
    );
    expect(retry).toHaveLength(1);
    retry.simulate('click');
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('bundled quest navigation', () => {
  const directory = resolve(process.cwd(), 'services/app/src/quests');
  const files = readdirSync(directory).filter(file => file.endsWith('.xml'));

  test.each(files)(
    '%s renders its branches without evaluation errors',
    file => {
      const xml = cheerio.load(readFileSync(resolve(directory, file), 'utf8'));
      const errors: string[] = [];
      const covered = new Set<string>();
      let location = 'start';
      const originalOnError = window.onerror;
      window.onerror = message => {
        errors.push(`${location}: ${String(message)}`);
        return true;
      };
      try {
        // Exercise both sides of the bundled party-size conditions, and odd/even
        // round conditions. Combat outcomes are selected directly, without timers.
        for (const players of [1, 2, 4]) {
          for (const round of [1, 2]) {
            const ctx = defaultContext();
            ctx.scope._.contentSets = () => ({
              base: true,
              horror: true,
              future: true,
            });
            ctx.scope._.numAdventurers = () => players;
            ctx.templates.combat = {
              ...ctx.templates.combat,
              roundCount: round,
              numAliveAdventurers: players,
            };
            const queue: Array<{ node: ParserNode; prev?: ParserNode }> = [
              {
                node: new ParserNode(
                  xml('quest').children().first(),
                  ctx,
                  undefined,
                  'bundled-quest-audit',
                ),
              },
            ];
            const visits = new Map<string, number>();
            const lineVisits = new Map<string, number>();
            for (let i = 0; i < queue.length; i++) {
              // Endless GM quests and round handlers intentionally contain cycles.
              expect(i).toBeLessThan(3000);
              const { node, prev } = queue[i];
              const line = node.elem.attr('data-line') || '';
              location = `${file}:${line} ${node.elem.attr('title') || node.getTag()}`;
              if (node.isEnd()) {
                continue;
              }
              const key = `${line}:${JSON.stringify({ ...node.ctx.scope, _: undefined })}`;
              if (
                (visits.get(key) || 0) >= 2 ||
                (lineVisits.get(line) || 0) >= 12
              ) {
                continue;
              }
              lineVisits.set(line, (lineVisits.get(line) || 0) + 1);
              visits.set(key, (visits.get(key) || 0) + 1);
              covered.add(line);
              if (node.getTag() === 'roleplay') {
                shallow(
                  <Roleplay
                    node={node}
                    prevNode={prev}
                    questID={file}
                    settings={initialSettings}
                    onChoice={jest.fn()}
                    onRetry={jest.fn()}
                  />,
                );
              }
              const keys = node.getVisibleKeys();
              if (!keys.length) {
                keys.push(0);
              }
              for (const action of keys) {
                location = `${file}:${line} action ${action}`;
                const inRound =
                  node.getTag() === 'roleplay' &&
                  node.elem.parents('event').first().attr('on') === 'round';
                const next =
                  inRound && typeof action === 'number'
                    ? getNextMidCombatNode(node, action).nextNode
                    : node.handleAction(action, 'bundled-quest-audit');
                if (next) {
                  const previous =
                    node.getTag() === 'combat' ? node.clone() : node;
                  if (previous.getTag() === 'combat') {
                    previous.ctx.templates.combat.numAliveAdventurers =
                      action === 'lose' ? 0 : players;
                  }
                  queue.push({ node: next, prev: previous });
                }
              }
              errors.push(
                ...node
                  .getErrors()
                  .map(error => `${location}: ${error.message}`),
              );
            }
          }
        }
        const unvisited = xml('roleplay,combat,decision')
          .toArray()
          .map(el => xml(el).attr('data-line') || '')
          .filter(line => !covered.has(line));
        // This empty legacy card follows a combat whose win and lose handlers
        // both jump elsewhere, so normal play cannot reach it.
        expect(unvisited).toEqual(file === 'custom_combat.xml' ? ['146'] : []);
        expect([...new Set(errors)]).toEqual([]);
      } finally {
        window.onerror = originalOnError;
      }
    },
  );
});

import * as React from 'react';
import { shallow } from 'enzyme';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { initialSettings } from 'app/reducers/Settings';

import { defaultContext } from '../Template';
import { ParserNode, TemplateContext } from '../TemplateTypes';
import Roleplay, { loadRoleplayNode, RoleplayResult } from './Roleplay';

import * as cheerio from 'shared/Cheerio';

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

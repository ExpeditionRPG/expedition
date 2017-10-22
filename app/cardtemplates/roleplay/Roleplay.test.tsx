import * as React from 'react'
import {TemplateContext} from '../TemplateTypes'
import {ParserNode, defaultContext} from '../Template'
import {loadRoleplayNode, RoleplayResult} from './Roleplay'

const cheerio: any = require('cheerio');

function loadRP(xml: any, ctx: TemplateContext): RoleplayResult {
  return loadRoleplayNode(new ParserNode(xml, ctx));
}

describe('Roleplay', () => {
  describe('Icons', () => {
    it('parses in body', () => {
      const result = loadRP(cheerio.load('<roleplay><p>:roll:</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<p><img class="inline_icon" src="images/roll_small.svg" /></p>');
    });
    it('parses in choices', () => {
      const result = loadRP(cheerio.load('<roleplay><choice text=":roll:"></choice></roleplay>')('roleplay'), defaultContext());
      expect(result.choices.length).toEqual(1);
      expect(result.choices[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<img class="inline_icon" src="images/roll_small.svg" />');
    });
    it('parses in instructions', () => {
      const result = loadRP(cheerio.load('<roleplay><instruction><p>Text :roll:</p></instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.children.props.dangerouslySetInnerHTML.__html).toEqual('<p>Text <img class="inline_icon" src="images/roll_small.svg" /></p>');
    });
    it('parses custom instruction icon', () => {
      const result = loadRP(cheerio.load('<roleplay><instruction><p>:roll: Text</p></instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.children.props.dangerouslySetInnerHTML.__html).toEqual('<p> Text</p>');
      expect(result.content[0].jsx.props.icon).toEqual('roll');
    });
  });

  describe('Conditionals & Ops', () => {
    it('does not display the result of ops that just set values', () => {
      const result = loadRP(cheerio.load('<roleplay><p>Text{{j = 1 * 1 / 10}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<p>Text</p>');
    });
    it('does not display the result of trinaries that just set values', () => {
      const result = loadRP(cheerio.load('<roleplay><p>Text{{j = 1}}{{j = (j == 1) ? 2 : 0}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<p>Text</p>');
    });
    it('processes and displays basic math / numbers', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{j = 1 * 1}}{{j}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<p>1</p>');
    });
    it('processes and displays strings', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{j = "BOB"}}{{j}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<p>BOB</p>');
    });
    it('displays ops inside of choices', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{j = "BOB"}}</p><choice text="{{j}}"></choice></roleplay>')('roleplay'), defaultContext());
      expect(result.choices[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('BOB');
    });
    it('respects conditionals when computing Next vs End button', () => {
      const quest = cheerio.load('<quest><roleplay><p>{{a=true}}</p></roleplay><trigger if="a">end</trigger><roleplay>test</roleplay></quest>')('quest');
      const result = loadRP(quest.children().eq(0), defaultContext());
      expect(result.choices).toEqual([{ jsx: <span>The End</span>, idx: 0}]);
    });
    it('respects conditionals when displaying instructions', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{a=true}}{{b=false}}</p><instruction if="a">a</instruction><instruction if="b">b</instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.children.props.dangerouslySetInnerHTML.__html).toEqual('a');
    });
    it('parses conditionals inside of instructions', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{a=1}}</p><instruction>{{a}}</instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content.length).toEqual(1);
      expect(result.content[0].jsx.props.children.props.dangerouslySetInnerHTML.__html).toEqual('1');
    });
  });

  it('handles goto triggers', () => {
    const result = loadRP(cheerio.load('<roleplay><p>Text</p></roleplay><trigger>goto market</trigger>')('roleplay'), defaultContext());
    expect(result.content.length).toEqual(1);
    expect(result.content[0].jsx.props.dangerouslySetInnerHTML.__html).toEqual('<p>Text</p>');
  });

  it('appends generic Next button if no explicit choices', () => {
    const quest = cheerio.load('<quest><roleplay><p></p></roleplay><roleplay>test</roleplay></quest>')('quest');
    const result = loadRP(quest.children().eq(0), defaultContext());
    expect(result.choices).toEqual([{ jsx: <span>Next</span>, idx: 0}]);
  });

  it('appends a Retry button if you just got out of combat and next node is **end**');
});

import {TemplateContext} from '../TemplateTypes'
import {ParserNode, defaultContext} from '../Template'
import {loadRoleplayNode, RoleplayResult} from './Roleplay'

const cheerio: any = require('cheerio');

function loadRP(xml: any, ctx: TemplateContext): RoleplayResult {
  return loadRoleplayNode(new ParserNode(xml, ctx));
}

describe('Roleplay', () => {
  describe('Icons', () => {
    it('Parses in body', () => {
      const result = loadRP(cheerio.load('<roleplay><p>:roll:</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'text', text: '<p><img class="inline_icon" src="images/roll_small.svg"></p>' } ]);
    });
    it('Parses in choices', () => {
      const result = loadRP(cheerio.load('<roleplay><choice text=":roll:"></choice></roleplay>')('roleplay'), defaultContext());
      expect(result.choices).toEqual([ { idx: 0, text: '<img class="inline_icon" src="images/roll_small.svg">' } ]);
    });
    it('Parses in instructions', () => {
      const result = loadRP(cheerio.load('<roleplay><instruction>Text :roll:</instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'instruction', text: 'Text <img class="inline_icon" src="images/roll_small.svg">' } ]);
    });
  });

  describe('Conditionals & Ops', () => {
    it('Does not display the result of ops that just set values', () => {
      const result = loadRP(cheerio.load('<roleplay><p>Text{{j = 1 * 1 / 10}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'text', text: '<p>Text</p>' } ]);
    });
    it('Does not display the result of trinaries that just set values', () => {
      const result = loadRP(cheerio.load('<roleplay><p>Text{{j = 1}}{{j = (j == 1) ? 2 : 0}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'text', text: '<p>Text</p>' } ]);
    });
    it('Processes and displays basic math / numbers', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{j = 1 * 1}}{{j}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'text', text: '<p>1</p>' } ]);
    });
    it('Processes and displays strings', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{j = "BOB"}}{{j}}</p></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'text', text: '<p>BOB</p>' } ]);
    });
    it('Displays ops inside of choices', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{j = "BOB"}}</p><choice text="{{j}}"></choice></roleplay>')('roleplay'), defaultContext());
      expect(result.choices).toEqual([ { idx: 0, text: 'BOB' } ]);
    });
    it('Respects conditionals when computing Next vs End button', () => {
      const quest = cheerio.load('<quest><roleplay><p>{{a=true}}</p></roleplay><trigger if="a">end</trigger><roleplay>test</roleplay></quest>')('quest');
      const result = loadRP(quest.children().eq(0), defaultContext());
      expect(result.choices).toEqual([{ text: 'The End', idx: 0}]);
    });
    it('Respects conditionals when displaying instructions', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{a=true}}{{b=false}}</p><instruction if="a">a</instruction><instruction if="b">b</instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'instruction', text: 'a' } ]);
    });
    it('Parses conditionals inside of instructions', () => {
      const result = loadRP(cheerio.load('<roleplay><p>{{a=1}}</p><instruction>{{a}}</instruction></roleplay>')('roleplay'), defaultContext());
      expect(result.content).toEqual([ { type: 'instruction', text: '1' } ]);
    });
  });

  it('handles goto triggers', () => {
    const result = loadRP(cheerio.load('<roleplay><p>Text</p></roleplay><trigger>goto market</trigger>')('roleplay'), defaultContext());
    expect(result.content).toEqual([ { type: 'text', text: '<p>Text</p>' } ]);
  });

  it('appends generic Next button if no explicit choices', () => {
    const quest = cheerio.load('<quest><roleplay><p></p></roleplay><roleplay>test</roleplay></quest>')('quest');
    const result = loadRP(quest.children().eq(0), defaultContext());
    expect(result.choices).toEqual([{ text: 'Next', idx: 0}]);
  });

  it('appends a Retry button if you just got out of combat and next node is **end**');
});

import {QuestContext} from '../../reducers/QuestTypes'
import {defaultQuestContext} from '../../reducers/Quest'
import {ParserNode} from '../../parser/Node'
import {loadRoleplayNode, RoleplayResult} from './Roleplay'

const cheerio: any = require('cheerio');

function loadRP(xml: any, ctx: QuestContext): RoleplayResult {
  return loadRoleplayNode(new ParserNode(xml, ctx));
}

describe('Roleplay', () => {
  it('parses icons in body', () => {
    // Icons are turned into images
    let result = loadRP(cheerio.load('<roleplay><p>[roll]</p></roleplay>')('roleplay'), defaultQuestContext());
    expect(result.content).toEqual([ { type: 'text', text: '<p><img class="inline_icon" src="images/roll_small.svg"></p>' } ]);

    // Inside of a choice
    result = loadRP(cheerio.load('<roleplay><choice text="[roll]"></choice></roleplay>')('roleplay'), defaultQuestContext());
    expect(result.choices).toEqual([ { idx: 0, text: '<img class="inline_icon" src="images/roll_small.svg">' } ]);

    // Inside of an instruction
    result = loadRP(cheerio.load('<roleplay><instruction>Text [roll]</instruction></roleplay>')('roleplay'), defaultQuestContext());
    expect(result.content).toEqual([ { type: 'instruction', text: 'Text <img class="inline_icon" src="images/roll_small.svg">' } ]);
  });

  it('handles goto triggers', () => {
    const result = loadRP(cheerio.load('<roleplay><p>Text</p></roleplay><trigger>goto market</trigger>')('roleplay'), defaultQuestContext());
    expect(result.content).toEqual([ { type: 'text', text: '<p>Text</p>' } ]);
  });

  it('respects in-card conditionals when computing Next vs End button', () => {
    const quest = cheerio.load('<quest><roleplay><p>{{a=true}}</p></roleplay><trigger if="a">end</trigger><roleplay>test</roleplay></quest>')('quest');
    const result = loadRP(quest.children().eq(0), defaultQuestContext());
    expect (result.choices).toEqual([{ text: 'The End', idx: 0}]);
  });

  it('appends generic Next button if no explicit choices');
});

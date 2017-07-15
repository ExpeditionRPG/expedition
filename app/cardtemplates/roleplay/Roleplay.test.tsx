// TODO: using require prevents this file from breaking, but can't actually write
// useful tests without using import
// (see: http://airbnb.io/enzyme/docs/guides/mocha.html)
import {QuestContext} from '../../reducers/QuestTypes'
import {defaultQuestContext} from '../../reducers/Quest'
import {ParserNode} from '../../parser/Node'
import Roleplay, {loadRoleplayNode, RoleplayResult} from './Roleplay'

var cheerio: any = require('cheerio');

function loadRP(xml: any, ctx: QuestContext): RoleplayResult {
  return loadRoleplayNode(new ParserNode(xml, ctx));
}

describe('Roleplay', () => {
  it('parses icons in body', () => {
    // Icons are turned into images
    var result = loadRP(cheerio.load('<roleplay><p>[roll]</p></roleplay>')('roleplay'), defaultQuestContext());
    expect(result.content).toEqual([ { type: 'text', text: '<p><img class="inline_icon" src="images/roll_small.svg"></p>' } ]);

    // Inside of a choice
    var result = loadRP(cheerio.load('<roleplay><choice text="[roll]"></choice></roleplay>')('roleplay'), defaultQuestContext());
    expect(result.choices).toEqual([ { idx: 0, text: '<img class="inline_icon" src="images/roll_small.svg">' } ]);

    // Inside of an instruction
    var result = loadRP(cheerio.load('<roleplay><instruction>Text [roll]</instruction></roleplay>')('roleplay'), defaultQuestContext());
    expect(result.content).toEqual([ { type: 'instruction', text: 'Text <img class="inline_icon" src="images/roll_small.svg">' } ]);
  });

  it('handles goto triggers', () => {
    var result = loadRP(cheerio.load('<roleplay><p>Text</p></roleplay><trigger>goto market</trigger>')('roleplay'), defaultQuestContext());
    expect(result.content).toEqual([ { type: 'text', text: '<p>Text</p>' } ]);
  });

  it('respects in-card conditionals when computing Next vs End button', () => {
    let quest = cheerio.load('<quest><roleplay><p>{{a=true}}</p></roleplay><trigger if="a">end</trigger><roleplay>test</roleplay></quest>')('quest');
    var result = loadRP(quest.children().eq(0), defaultQuestContext());
    expect (result.choices).toEqual([{ text: 'The End', idx: 0}]);
  });
});

/*
test('starts on player setup', function() {
  Polymer.dom.flush();
  assert.isTrue(isVisible(fWin.$.setup));
});

test('has endgame card', function() {
  assert.isDefined(fWin.$.endgame);
});

test('endgame card shows victory on <end win>', function(done) {
  fWin.startQuest();
  fWin.addEventListener("animFinish", function(e) {
    e.target.removeEventListener(e.type, arguments.callee);

    fWin.addEventListener("animFinish", function(e) {
      Polymer.dom.flush();
      assert.isTrue(isVisible(fWin.$.endgame));
      assert.include(fWin.$.endgame.innerHTML, "Congratulations");
      assert.notInclude(fWin.$.endgame.innerHTML, "all players discard their cards");
      done();
    })
    MockInteractions.tap(fWin.$.dialog.querySelector("a"));
  });
});

test('endgame card shows defeat on <end lose>', function(done) {
  fWin.startQuest();
  fWin.addEventListener("animFinish", function(e) {
    e.target.removeEventListener(e.type, arguments.callee);

    fWin.addEventListener("animFinish", function(e) {
      Polymer.dom.flush();
      assert.isTrue(isVisible(fWin.$.endgame));
      assert.include(fWin.$.endgame.innerHTML, "Congratulations");
      assert.notInclude(fWin.$.endgame.innerHTML, "all players discard their cards");
      done();
    })
    MockInteractions.tap(fWin.$.dialog.querySelector("a"));
  });
});

test('clicking endgame end button resets quest and fires return() which propagates', function(done) {
  fWin.addEventListener("return", function() {
    assert.equal(fWin.isWin, undefined);
    done();
  });
  MockInteractions.tap(fWin.$.endgame.querySelector("a"));
});

test('<encounter> shows encounter card', function(done) {
  throw new Error('unimplemented');
});

test('Finishing encounter returns to place in quest', function(done) {
  throw new Error('unimplemented');
});

test('setup card shown/hidden on init based on global setting var', function() {
  throw new Error('unimplemented');
});

test('return to quest list on quest end', function() {
  throw new Error('unimplemented');
});

test('endQuest sweeps left and vanishes current page', function() {
  throw new Error('unimplemented');
});

test('combat state reset between encounters', function() {
  // was having issues where completing the encounter never reset it.
  throw new Error('unimplemented');
});

test('quest card does not reset when showHelp toggled mid-quest', function() {
  throw new Error('unimplemented');
});
*/

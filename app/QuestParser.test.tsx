/// <reference path="../typings/expect/expect.d.ts" />
/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="../typings/custom/require.d.ts" />
/// <reference path="../typings/enzyme/enzyme.d.ts" />

import {loadRoleplayNode, loadCombatNode, loadTriggerNode, handleChoice} from './QuestParser'

import {mount} from 'enzyme'

var jsdom = (require('jsdom') as any).jsdom;

declare var global: any;
global.document = jsdom('');
global.window = document.defaultView;

var expect: any = require('expect');
var cheerio: any = require('cheerio');

var window: any = cheerio.load('<div>');


describe('QuestParser', () => {

  describe('roleplay', () => {
    it('parses ops in body', () => {
      // Lines with nothing but variable assignment are hidden
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{text="TEST"}}</p><p>{{text}}</p></roleplay>')('roleplay'), {scope: {}});
      expect(mount(result.content).html()).toEqual("<span><p>TEST</p></span>");

      // Single-valued array results are indirected
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{r=[5]}}</p><p>{{r}}</p></roleplay>')('roleplay'), {scope: {}});
      expect(mount(result.content).html()).toEqual("<span><p>5</p></span>");
    });

    it('parses multi-statement ops in body and respects newlines', () => {
      // If the op ends without an assignment, it's displayed.
      // If it does, it's hidden.
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{a=5;c=7}}</p><p>{{b=7;a}}</p><p>{{a=5\nb=10}}</p><p>{{a=5\nb=10\nc}}</p></roleplay>')('roleplay'), {scope: {}});
      expect(mount(result.content).html()).toEqual("<span><p>5</p><p>7</p></span>");
    });

    it('hides choices conditionally', () => {
      // Changes to ops inside a roleplay card affect the visibility
      // of its choices.

      // Unassigned
      var result = loadRoleplayNode(cheerio.load('<roleplay><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'), {scope: {}});
      expect(result.choices).toEqual([ { idx: 0, text: 'Next' } ]);

      // False
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{a=false}}</p><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'), {scope: {}});
      expect(result.choices).toEqual([ { idx: 0, text: 'Next' } ]);

      // Zero
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{a=0}}</p><choice if="a" text="Hidden"></choice></roleplay>')('roleplay'), {scope: {}});
      expect(result.choices).toEqual([ { idx: 0, text: 'Next' } ]);
    });

    it('shows choices conditionally', () => {
      // Changes to ops inside a roleplay card affect the visibility
      // of its choices.

      // Boolean
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{a=true}}</p><choice if="a" text="Visible"></choice></roleplay>')('roleplay'), {scope: {}});
      expect(result.choices).toEqual([ { idx: 0, text: 'Visible' } ]);

      // Non-zero
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>{{a=1}}</p><choice if="a" text="Visible"></choice></roleplay>')('roleplay'), {scope: {}});
      expect(result.choices).toEqual([ { idx: 0, text: 'Visible' } ]);
    });

    it('parses icons in body', () => {
      // Icons are turned into images
      var result = loadRoleplayNode(cheerio.load('<roleplay><p>[roll]</roleplay>')('roleplay'), {scope: {}});
      expect(mount(result.content).html()).toEqual('<span><p><img class="inline_icon" src="images/roll_small.svg"></p></span>');

      // Even inside of a choice
      var result = loadRoleplayNode(cheerio.load('<roleplay><choice text="[roll]"></choice></roleplay>')('roleplay'), {scope: {}});
      expect(result.choices).toEqual([ { idx: 0, text: '<img class="inline_icon" src="images/roll_small.svg">' } ]);

      // Even inside of a choice
      var result = loadRoleplayNode(cheerio.load('<roleplay><instruction>[roll]</instruction></roleplay>')('roleplay'), {scope: {}});
      expect(result.instructions).toEqual([ { idx: 0, text: '<img class="inline_icon" src="images/roll_small.svg">' } ]);
    });
  });

  describe('combat', () => {
    it('parses enemies', () => {
      // "Unknown" enemies are given tier 1.
      // Known enemies' tier is parsed from constants.
      var result = loadCombatNode(cheerio.load('<combat><e>Test</e><e>Lich</e><event on="win"></event><event on="lose"></event></combat>')('combat'), {scope: {}});
      expect(result.enemies).toEqual([
        {name: 'Test', tier: 1},
        {name:'Lich', tier: 4}
      ]);
    })

    it('hides enemies conditionally', () => {
      var node = cheerio.load('<combat><e>a</e><e if="a">Test</e><event on="win"></event><event on="lose"></event></combat>')('combat');
      var expected = [{name: 'a', tier: 1}];

      // Unassigned
      var result = loadCombatNode(node, {scope: {}});
      expect(result.enemies).toEqual(expected);

      // Boolean
      var result = loadCombatNode(node, {scope: {a: false}});
      expect(result.enemies).toEqual(expected);

      // Zero
      var result = loadCombatNode(node, {scope: {a: 0}});
      expect(result.enemies).toEqual(expected);
    });

    it('shows enemies conditionally', () => {
      var node = cheerio.load('<combat><e if="a">Test</e><event on="win"></event><event on="lose"></event></combat>')('combat');
      var expected = [{name: 'Test', tier: 1}];

      // Boolean
      var result = loadCombatNode(node, {scope: {a: true}});
      expect(result.enemies).toEqual(expected);

      // Non-zero
      var result = loadCombatNode(node, {scope: {a: 1}});
      expect(result.enemies).toEqual(expected);
    });

    it('sets enemies programmatically', () => {
      var node = cheerio.load('<combat><e>{{a}}</e><event on="win"></event><event on="lose"></event></combat>')('combat');

      // Not defined
      var result = loadCombatNode(node, {scope: {}});
      expect(result.enemies).toEqual([{name: '{{a}}', tier: 1}]);

      // String
      var result = loadCombatNode(node, {scope: {a: "Skeleton"}});
      expect(result.enemies).toEqual([{name: 'Skeleton', tier: 1}]);

      // Wrapped matrix
      var result = loadCombatNode(node, {scope: {a: ["Test"]}});
      expect(result.enemies).toEqual([{name: 'Test', tier: 1}]);
    });
  });

  describe('trigger', () => {
    it('triggers end', () => {
      var result = loadTriggerNode(cheerio.load('<trigger>end</trigger>')('trigger'));
      expect(result.name).toEqual('end');
    });

    it('triggers goto', () => {
      var trigNode = cheerio.load('<trigger>goto test</trigger>')('trigger');
      var rootNode = cheerio.load('<quest></quest>')('quest');
      var testNode = cheerio.load('<roleplay id="test">Test Node</roleplay>')('roleplay');

      rootNode.append(testNode);
      rootNode.append(trigNode);

      var result = loadTriggerNode(trigNode);
      expect(result.name).toEqual('goto');
      expect(result.node.text()).toEqual('Test Node');
    });
  });

  describe('handleChoice', () => {
    it('skips hidden triggers', () => {
      var node = cheerio.load('<roleplay><choice><trigger if="a">goto 5</trigger><trigger>end</trigger></choice></roleplay>')('roleplay');
      var result = handleChoice(node, 0, {scope: {}});
      expect(result.text()).toEqual('end');
    });

    it('uses enabled triggers', () => {
      var node = cheerio.load('<roleplay><choice><trigger if="a">goto 5</trigger><trigger>end</trigger></choice></roleplay>')('roleplay');
      var result = handleChoice(node, 0, {scope: {a: true}});
      expect(result.text()).toEqual('goto 5');
    });

    it('goes to correct choice', () => {
      var node = cheerio.load('<roleplay><choice></choice><choice><roleplay>herp</roleplay></choice></roleplay>')('roleplay');
      var result = handleChoice(node, 1, {scope:{}});
      expect(result.text()).toEqual('herp');
    });

    it('goes to next roleplay node', () => {
      var node = cheerio.load('<roleplay id="rp1">rp1</roleplay><roleplay>rp2</roleplay>')('#rp1');
      var result = handleChoice(node, 1, {scope:{}});
      expect(result.text()).toEqual('rp2');
    });

    it('immediately follows triggers on otherwise empty choices', () => {
      var rootNode = cheerio.load('<quest></quest>')('quest');
      var choiceNode = cheerio.load('<roleplay><choice><trigger>goto jump</trigger></choice></roleplay>')('roleplay');
      var jumpNode = cheerio.load('<roleplay id="jump">Jumped</roleplay>')('roleplay');

      rootNode.append(choiceNode);
      rootNode.append(jumpNode);

      var result = handleChoice(choiceNode, 0, {scope:{}});
      expect(result.text()).toEqual('Jumped');
    });

    it('does not immediately follows triggers on non-empty choices', () => {
      var node = cheerio.load('<roleplay><choice><roleplay>Not empty</roleplay><trigger>goto jump</trigger></choice></roleplay><roleplay id="jump">Hello</roleplay>')('roleplay');
      var result = handleChoice(node, 0, {scope:{}});
      expect(result.text()).toEqual('Not empty');
    });

    it('errors if choice not enabled');
    it('errors if choice does not contain enabled roleplay/choice/trigger');
  });
});

/*
test('<end> sets title and icon', function() {
  var result = (new questParser()).init(fEnd);
  assert.equal(result.title, 'endtitle');
  assert.equal(result.icon, 'endicon');
});

test('<end> returns ending dialog text with end button', function() {
  var result = (new questParser()).init(fEnd);
  assert.equal(result.type, 'dialog');
  assert.equal(result.contents.innerHTML, "<p>The End</p><a>End</a>")
});

test('<end> throws if any other special tags within', function() {
  var fixtures = ['endBadEnd', 'endBadChoice', 'endBadEncounter', 'endBadRoleplay'];
  for (var i = 0; i < fixtures.length; i++) {
    assert.throws(function() {
      (new questParser()).init(fixture(fixtures[i]));
    },
    Error, "<end> cannot contain tag");
  }
});

test ('<end> must have win or lose attribute', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('endBadAttr'));
  },
  Error, "<end> must have win or lose attribute");
});

test('<roleplay> sets title and icon', function() {
  var result = (new questParser()).init(fRoleplay);
  assert.equal(result.title, 'rptitle');
  assert.equal(result.icon, 'rpicon');
});

test('<roleplay> without <choice> has inner text and Next button', function() {
  var result = (new questParser()).init(fRoleplay);
  assert.equal(result.type, 'dialog');
  assert.equal(result.contents.innerHTML, "<p>Dialog</p><a>Next</a>")
});

test('<roleplay> displays choices as buttons', function() {
  var result = (new questParser()).init(fixture('roleplayChoice'));
  assert.equal(result.contents.innerHTML, "<a>1</a><a>2</a>")
});

test('<roleplay> throws if <choice> text is "End"', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('roleplayCustomEndChoice'));
  },
  Error, "<choice> text cannot be \"End\"");
});

test('<roleplay> throws if no inner text in <choice>', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('roleplayChoiceNoInner'));
  },
  Error, "<choice> must contain choice text");
});

test('<choice> throws if no special tag within', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('choiceNoInterior'));
  },
  Error, "<choice> without id must have at least one of");
});

test('<choice goto> jumps to target with id', function() {
  throw new Error("Unimplemented");
});

test('<choice goto> without matching target throws', function() {
  throw new Error("Unimplemented");
});

test('<choice> throws if choice within', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('choiceInChoice'));
  },
  Error, "<choice> node cannot have <choice> child");
});

test('<encounter> sets icon', function() {
  var result = (new questParser()).init(fEncounter);
  assert.equal(result.icon, "eicon");
});

test('<encounter> returns enemies', function() {
  var result = (new questParser()).init(fEncounter);
  assert.equal(result.type, 'encounter');
  assert.deepEqual(result.contents, ["1", "2"]);
});

test('<encounter> requires enemies', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('encounterNoEnemies'));
  },
  Error, "<encounter> has no <e> children");
});

test('<encounter> requires win/lose choices', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('encounterWinOnly'));
  },
  Error, "<encounter> missing <choice lose> child");

  assert.throws(function() {
    (new questParser()).init(fixture('encounterLoseOnly'));
  },
  Error, "<encounter> missing <choice win> child");
});

test('<encounter> throws on choice without win/lose', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('encounterInvalidChoice'));
  },
  Error, "Encounter choice without win/lose attribute");
});

test('<encounter> throws on element neither <e> nor <choice>', function() {
  assert.throws(function() {
    (new questParser()).init(fixture('encounterInvalidElement'));
  },
  Error, "Invalid child element");
});

test('choiceEvent throws on bad data', function() {
  assert.throws(function() {
    var p = (new questParser());
    p.choiceEvent("test");
  },
  Error, "Invalid choiceEvent");
});

test('choiceEvent enters first child node', function() {
  var p = new questParser();
  p.init(fixture('choiceEvent'));
  var result = p.choiceEvent(0);
  assert.equal(result.type, 'dialog');
  assert.equal(result.contents.innerHTML, '<p>test</p><a>Next</a>');
});

test('choiceEvent returns end type when end choice reached', function() {
  var p = new questParser();
  p.init(fEnd);
  assert.equal(p.choiceEvent(0).type, 'end');
});

test('choiceEvent selects win choice on win', function() {
  var p = new questParser();
  p.init(fEncounter);
  var result = p.choiceEvent('win');
  assert.equal(result.type, 'dialog');
  assert.equal(result.contents.innerHTML, '<p>win</p><a>Next</a>');
});

test('choiceEvent selects lose choice on lose', function() {
  var p = new questParser();
  p.init(fEncounter);
  var result = p.choiceEvent('lose');
  assert.equal(result.type, 'dialog');
  assert.equal(result.contents.innerHTML, '<p>lose</p><a>Next</a>');
});

test('<e show-if=""> is properly (and safely) evaluated', function() {
  throw new Error("Unimplemented");
});

test('loop terminates if no next node');
*/

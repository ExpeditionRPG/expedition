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
*/
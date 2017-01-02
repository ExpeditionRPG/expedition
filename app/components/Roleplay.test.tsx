/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />

// import expect from 'expect'
// TODO: using require prevents this file from breaking, but can't actually write
// useful tests without using import
// (see: http://airbnb.io/enzyme/docs/guides/mocha.html)
const expect = require('expect');
import Roleplay from './Roleplay'


describe('Roleplay', () => {
  it('Test', () => {
    expect(true).toEqual(true);
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

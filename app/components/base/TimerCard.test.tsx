/*
test('timer starts when start() called', function() {
  testLogic.stochasticDamage = function() {return 0;};
  f.logic = testLogic;
  f.start();
  assert.isFalse(f.active);
});

test('when single-touch global setting, timer stops on single touch', function(done) {
  f.globals.multitouch = false;
  f.start();
  f.touchEvent({touches: [], preventDefault: function() {}});
  f.addEventListener("stopped", function() {
    done();
  })
});

test('when multi-touch global setting, timer continues when less than all players touching', function(done) {
  f.globals.multitouch = true;
  f.globals.adventurers = 2;

  f.start();
  f.touchEvent({touches: [{clientX: 5, clientY: 5}], preventDefault: function() {}});
  f.addEventListener("stopped", function() {
    throw new Error("Stopped with wrong touch count");
  });
  setTimeout(function() {done();}, 50);
});

test('when multi-touch global setting, timer stops when all players touching', function(done) {
  f.globals.multitouch = true;
  f.globals.adventurers = 2;
  f.start();
  f.touchEvent({touches: [{clientX: 5, clientY: 5}, {clientX: 50, clientY: 50}], preventDefault: function() {}});
  f.addEventListener("stopped", function() {
    done();
  });
});

test('when multi-touch global setting, timer stops when *more* than all players touching', function() {
  throw new Error('unimplemented');
});

test('timer updates damage UI when damage changes', function(done) {
  f.globals.multitouch = false;
  dmg = 0;
  testLogic.stochasticDamage = function() {
    dmg++;
    return 1;
  };
  f.logic = testLogic;
  f.start();
  setTimeout(function() {f.touchEvent({touches: [1], preventDefault: function() {}});}, 250);
  f.addEventListener("stopped", function(e) {
    assert.equal(e.detail.roundDamage, dmg);
    done();
  });
});

test('timer updates elapsed seconds on update', function(done) {
  f.globals.multitouch = false;
  f.logic = testLogic;
  f.start();
  setTimeout(function() {f.touchEvent({touches: [1], preventDefault: function() {}});}, 250);
  f.addEventListener("stopped", function(e) {
    assert.closeTo(e.detail.turnTimeMillis, 250, 20);
    done();
  });
});

test('surge warning shown when impending surge', function() {
  testLogic.getNextSurgeRounds = function() {return 1.0;};
  f.logic = testLogic;
  f.start();
  assert.isTrue(f.surgeImminent);
});

test('surge warning hidden when surge not imminent', function() {
  testLogic.getNextSurgeRounds = function() {return 1.1;};
  f.logic = testLogic;
  f.start();
  assert.isFalse(f.surgeImminent);
});

test('Multitouch text is shown when multitouch+helptext globals', function(done) {
  f.globals.showhelp = true;
  f.globals.multitouch = true;
  sinon.spy(f, 'drawMultitouchHelp');
  sinon.spy(f, 'drawSingleTapHelp');
  f.start();
  setTimeout(function() {
    try {
      assert.isTrue(f.drawMultitouchHelp.called);
      assert.isFalse(f.drawSingleTapHelp.called);
    } finally {
      f.drawMultitouchHelp.restore();
      f.drawSingleTapHelp.restore();
      done();
    }
  }, 100);
});

test('Help text is hidden when global is not set', function(done) {
  f.globals.showhelp = false;
  sinon.spy(f, 'drawMultitouchHelp');
  sinon.spy(f, 'drawSingleTapHelp');
  f.start();
  setTimeout(function() {
    try {
      assert.isFalse(f.drawMultitouchHelp.called);
      assert.isFalse(f.drawSingleTapHelp.called);
    } finally {
      f.drawMultitouchHelp.restore();
      f.drawSingleTapHelp.restore();
      done();
    }
  }, 100);
});

test('Single-tap text is shown when !multitouch+helptext globals', function(done) {
  f.globals.showhelp = true;
  f.globals.multitouch = false;
  sinon.spy(f, 'drawMultitouchHelp');
  sinon.spy(f, 'drawSingleTapHelp');
  f.start();
  setTimeout(function() {
    try {
      assert.isFalse(f.drawMultitouchHelp.called);
      assert.isTrue(f.drawSingleTapHelp.called);
    } finally {
      f.drawMultitouchHelp.restore();
      f.drawSingleTapHelp.restore();
      done();
    }
  }, 100);

  test('Attack! is shown on timer start', function() {
    throw new Error('unimplemented');
  });

  test('Hit/miss are displayed on screen', function() {
    throw new Error('unimplemented');
  });

});
*/
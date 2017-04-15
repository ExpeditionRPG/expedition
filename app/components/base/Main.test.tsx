
describe('Main', () => {
  it('TODO');
});
/*
test('default starts on select card', function() {
  //f.addEventListener("animFinish", function() {console.log("herp"); done();});
  //f.reset('_select');
  Polymer.dom.flush();
  assert.isTrue(isVisible(f.$.select));
  assert.isFalse(isVisible(f.querySelector("#test1")));
  assert.isFalse(isVisible(f.querySelector("#test2")));
});

test('resets to given card', function(done) {
  f.reset('test1');
  Polymer.dom.flush();
  f.addEventListener("animFinish", function() {
    assert.isFalse(isVisible(f.$.select));
    assert.isTrue(isVisible(f.querySelector("#test1")));
    assert.isFalse(isVisible(f.querySelector("#test2")));
    done();
  });
});

test('next triggers correct animations', function() {
  f.next('test1');
  assert.equal(f.exitAnim, "slide-left-animation");
  assert.equal(f.entryAnim, "slide-from-right-animation");
});

test('prev triggers correct animations', function() {
  f.prev('test1');
  assert.equal(f.exitAnim, "slide-right-animation");
  assert.equal(f.entryAnim, "slide-from-left-animation");
});

test('reset triggers correct animations', function() {
  f.reset('test1');
  assert.equal(f.exitAnim, "fade-out-animation");
  assert.equal(f.entryAnim, "fade-in-animation");
});

test('_select page lists and links to all titled/infod targets', function() {
  f.querySelector("template").render();
  Polymer.dom.flush();
  var items = f.querySelectorAll("expedition-detail-list");
  assert.equal(items.length, 2); // Don't link to the title-less, info-less element
  assert.equal(items[0].querySelector("h1").innerHTML, "title1");
  assert.equal(items[0].querySelector("#subtext > div").innerHTML, "info1");
  assert.equal(items[1].querySelector("h1").innerHTML, "title2");
  assert.equal(items[1].querySelector("#subtext > div").innerHTML, "info2");
});

test('next() event propagation is stopped', function(done) {
  f.addEventListener("next", function() {
    throw new Error("propagated");
    done();
  });
  setTimeout(function() {done();}, 50);
  f.next('test1');
});

test('prev() event propagation is stopped', function(done) {
  f.addEventListener("prev", function() {
    throw new Error("propagated");
    done();
  });
  setTimeout(function() {done();}, 50);
  f.next('test1');
});

test('initial page is shown', function() {
  Polymer.dom.flush();
  assert.isTrue(isVisible(f.querySelector("#select")));
  assert.isTrue(isVisible(f_initial.querySelector("#test1")));
});

test('next card is always scrolled to top', function() {
  throw new Error('unimplemented');
});

test('prev card is always scrolled to top', function() {
  throw new Error('unimplemented');
});

test('New card scrollToTop is called if supplied', function() {
  throw new Error('unimplemented');
});
*/
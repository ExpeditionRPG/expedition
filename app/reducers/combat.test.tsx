/*
test('Surge occurs within 5 rounds', function() {
  e.parseTierOnly(1);
  assert.isAtMost(e.getNextSurgeRounds(), 5);
});

test('guaranteed to take damage within 7 seconds', function() {
  e.parseTierOnly(1);
  for(var i = 0; i < 100; i++) {
    assert.isDefined(e.stochasticDamage(7000));
  }
});

test('double damage events should happen roughly 20% of the time', function() {
  var numCrits = 0;
  e.parseTierOnly(1);
  for (var i = 0; i < 1000; i++) {
    numCrits += (e.stochasticDamage(10000) === 2) ? 1 : 0;
  }
  assert.closeTo(numCrits, 200, 30, '1000 attacks yields around 200 crits');
});

test('Loot dropped sums to max tier fought', function() {
  for (var i = 0; i < 100; i++) {
    e = new Encounter();
    var tier = Math.floor(Math.random()*10)+1;
    e.parseTierOnly(tier);

    // Requires a full round for max tier calculation
    e.beginRound();
    e.endRound({totalTimeMillis: 0});

    var loot = e.generateLoot();
    var lootTierSum = 0;
    for (var j = 0; j < loot.length; j++) {
      lootTierSum += loot[j].tier * loot[j].count;
    }
    assert.equal(lootTierSum, tier);
  }
});

test('Initial starting damage occurs', function() {
  e.parseTierOnly(1);
  assert.isAbove(e.startingDamage(), 0);
});

test('Damage rate increases roughly monotonically with tier', function() {
  var trials = [];
  for (var t = 1; t < 10; t++) {
    e = new Encounter();
    e.parseTierOnly(t);
    e.beginRound();
    var dmg = e.startingDamage();
    console.log(e.stats.tierDmgRate);
    for (var samples = 0; samples < 80000; samples++) {
      var d = e.stochasticDamage(10);
      dmg += (d !== undefined) ? d : 0;
    }
    trials.push(dmg);
  }
  console.log(trials);
  for (var i = 1; i < trials.length; i++) {
    assert.isAbove(trials[i], trials[i-1]-20, 'Tier '+i+' encounter dealt more damage than tier '+(i-1));
  }
});

test('Players can level up if they fight a tier >= their count', function() {
  dataGlobal.adventurers = 6;
  e.parseTierOnly(6);
  e.beginRound();
  e.endRound({totalTimeMillis:0});
  assert.equal(e.canLevelUp(), true);
});

test('No level up option given if tier < player count', function() {
  dataGlobal.adventurers = 6;
  e.parseTierOnly(5);
  e.beginRound();
  e.endRound({totalTimeMillis:0});
  assert.equal(e.canLevelUp(), false);
});

test('Surge rounds resets once surge occurs', function() {
  e.parseTierOnly(2);
  var prevRounds = e.getNextSurgeRounds();

  // Trigger rounds until we get a surge
  while (e.getNextSurgeRounds() != 0) {
    e.beginRound();
    e.endRound({totalTimeMillis: 0});
  }

  e.beginRound();
  e.endRound({totalTimeMillis: 0});
  assert.equal(e.getNextSurgeRounds(), prevRounds);
});

test('parseEncounter resolves encounter tier from name', function() {
  dataGlobal = {
    encounters: {
      a: {name: 'a', tier: 1, class: 'classa'},
      b: {name: 'b', tier: 2, class: 'classb'}
    }
  };
  var resolved = e.parseEncounter([{name: 'a'}, {name: 'b'}]);

  resolved.forEach(function(r) {
    assert.deepEqual(r, dataGlobal.encounters[r.name]);
  });
});
*/
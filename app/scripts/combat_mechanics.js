/*global dataGlobal */
function Encounter() {
  // --------- Constants ----------
  // Period estimation: these are heuristic values.
  // A harder round has a shorter period because more experienced players will
  // be playing/rushing to beat the clock.

  this._surgeRoundPd = 4; // rounds
  this._hardestTier = 8;
  this._easiestTier = 2;
  this._hardestRoundPd = 7.5; // seconds
  this._easiestRoundPd = 15; // seconds
  this._roundPdSlope = (this._hardestRoundPd - this._easiestRoundPd) / (this._hardestTier - this._easiestTier);
  this._roundPdIntercept = this._easiestRoundPd - this._roundPdSlope * this._easiestTier;

  // Will contain round results for each round.
  this._roundLog = [];
  this._roundCount = 0;
  this._totalTimeMillis = 0;
  this._lastSurgeMillis = 0;
  this._nextDamageMillis = 0;
}

Encounter.prototype.setTierSum = function(tier) {
  this._stats = this._calculateCombatStats(tier);
};

Encounter.prototype.generateLoot = function() {
  var loot = [
    {tier: 1, tierNumeral: "I", count: 0},
    {tier: 2, tierNumeral: "II", count: 0},
    {tier: 3, tierNumeral: "III", count: 0}
    ];
  var tier = this.getSummary().maxTier;

  while (tier > 0) {
    var r = Math.random();

    if (r < 0.1 && tier >= 3) {
      tier -= 3;
      loot[2].count++;
    } else if (r < 0.4 && tier >= 2) {
      tier -= 2;
      loot[1].count++;
    } else {
      tier -= 1;
      loot[0].count++;
    }

  }

  for (var i = loot.length-1; i >= 0; i--) {
    if (!loot[i].count) {
      loot.splice(i, 1);
    }
  }

  return loot;
};

Encounter.prototype.canLevelUp = function() {
  // For max tier above the adventurer count, players can choose to level up instead
  return (this.getSummary().maxTier >= dataGlobal.adventurers);
};

Encounter.prototype.beginRound = function() {
  // Must happen at the *start* of every round.
  this._roundCount++;
  this._roundLog.push(this._stats);
};

Encounter.prototype._randomAttackDamage = function() {

  // D = Damage per ddt (0, 1, or 2 discrete)
  // M = miss, H = hit, C = crit, P(M) + P(H) + P(C) = 1
  // E[D] = Expected damage for a single second
  // P(C) = 1/3 * P(H)
  // P(M) = 1 - 4/3 * P(H)
  // E[D] = 0 * P(M) + 1 * P(H) + 2 * P(C) = 0.9

  var r = Math.random();
  if (r < 0.4) {
    return 0;
  } else if (r < 0.5) {
    return 2;
  } else { // r >= 0.5
    return 1;
  }
};

Encounter.prototype._roundAttackDamage = function (s) {
  // enemies each get to hit once - twice if the party took too long
  // TODO tweak the overtime penalty based on difficulty
  var damage = 0;
  var attackCount = s.tier;
  if (s.timeRemainingMillis < 0) {
    attackCount *= 2;
  }
  for (var i = 0; i < attackCount; i++) {
    damage += this._randomAttackDamage();
  }
  return damage;
};

function clone(obj) {
  if (null === obj || "object" !== typeof obj) {
    return obj;
  }
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = obj[attr];
    }
  }
  return copy;
}

Encounter.prototype.getNextSurgeRounds = function() {
  return this._surgeRoundPd - ((this._roundCount % this._surgeRoundPd) + 1);
};

Encounter.prototype.resetSurgeCounter = function() {
  // TODO: Track surge resets in combat stats
  // TODO: This is now useless. refactor this out.
  // TODO: The entire "nextSurge" logic should be a round counter instead of a modulo.
  // TODO: This function should take an (optional) number of rounds to reset to.
};

Encounter.prototype.endRound = function(s) {
  s = clone(s);
  this._totalTimeMillis += s.turnTimeMillis;
  s.totalTimeMillis = this._totalTimeMillis;
  s.adventurers = dataGlobal.adventurers;
  s.expectedDamage = Math.ceil(s.turnTimeMillis * (this._stats.tierDmgRate) / 1000);
  s.nextSurgeRounds = this.getNextSurgeRounds(s.turnTimeMillis);
  s.tier = this.getTier();
  s.roundDamage = this._roundAttackDamage(s);

  this._roundLog.push(s);
  return s;
};

Encounter.prototype.sendStats = function() {
  console.log("TODO: Send completed combat stats to server");
  console.log(this._roundLog);
};

Encounter.prototype.getTier = function() {
  return (this._stats !== undefined) ? this._stats.tier : 0;
};

Encounter.prototype.getSummary = function() {
  var s = {
    totalTimeSeconds: (this._totalTimeMillis / 1000).toFixed(1),
    numRounds: 0,
    maxTier: 0,
    maxSingleRoundDmg: 0,
    totalDamage: 0,
  };

  console.log(this._roundLog);
  for (var i = 0; i < this._roundLog.length; i += 2) {
    var start = this._roundLog[i];
    var end = this._roundLog[i+1];

    s.maxTier = Math.max(s.maxTier, start.tier);
    s.numRounds++;
    s.totalDamage += end.roundDamage;
    s.maxSingleRoundDmg = Math.max(s.maxSingleRoundDmg,  end.roundDamage);
    // TODO: More metrics here
  }

  s.avgRoundSeconds = (s.totalTimeSeconds / s.numRounds).toFixed(1);

  return s;
};

Encounter.prototype._calculateCombatStats = function(tier) {
  var s = {tier: tier};

  // Every encounter is expected to take a number of rounds
  // roughly equal to its tier. (~10 player damage/round)
  s.estNumRounds = s.tier;

  // See below for total damage algo.
  s.estRoundDmg = 0.25 * s.tier + 1.5;
  s.estSurgeRoundDmg = 0.25 * s.tier;

  // total damage = 0.5*T^2 + (1.5 * tier)
  // Tier 8: Max encounter,       8 rounds, 44 damage
  // Tier 6: Hard encounter,      6 rounds, 27 damage
  // Tier 4: Standard encounter,  4 rounds, 14 damage
  // Tier 2: Easy encounter,      2 rounds, 5 damage
  // Bear in mind damage deflection and item use will
  // negate much of this damage at higher tiers.
  s.estTotalDamage = (s.estRoundDmg + s.estSurgeRoundDmg) * s.estNumRounds;

  s.estRoundPd = (this._roundPdSlope * s.tier + this._roundPdIntercept);

  // (damage/round) * 1/(seconds/round) = damage/second
  s.tierDmgRate = s.estRoundDmg / s.estRoundPd;

  return s;
};

Encounter.prototype._nextAttack = function(rateParameter) {
  // Inverse geometric PMF
  return Math.min(Math.max(
    -Math.log(1.0 - Math.random()) * 1000 / rateParameter,
    1000), 7000);
};

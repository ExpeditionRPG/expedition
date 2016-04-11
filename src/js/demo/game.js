// A demo encounter example. Include:
// - 3 Single-enemy encounters
// - Gold received on kill
// - Player health
// - 5 kinds of Loot
// - 10 abilities (across 2 classes)
// - Merchants/shopping using retrieved gold
// - MUD-style text.

// Playthrough:
// Page Load -> New enemy encounter
// On player action, 


var Game = function() {
	// DOM locations for cards etc.
	this.UI = new UI();

	this.merchantChance = 0.2; // 20% chance of a merchant appearing

	this.encounters = setupEncounters();
	this.encounter = null;

	this.abilities = setupAbilities();
}

Game.prototype.disableAbility = function(ability) {
	var idx = this.abilities.indexOf(ability);
	if (idx == -1) {
		return;
	}
	this.abilities.splice(idx, 1);
};

Game.prototype.nextState = function(fn) {
	if (!fn) {
		this.UI.defaultTextNextAction = null;
	} else {
		this.UI.defaultTextNextAction = fn.bind(this);
	}
}

Game.prototype.stateStart = function() {
	this.nextState(this.stateEncounterStart);

	// Number of turns before we automatically win. Take this out to win/lose randomly.
	this.autowin_counter = 3;

	// Enter into a new game!
	this.playerTurn = true;
	this.player = new Player();
	this.player.reset();
	this.player.enter(this);
}

Game.prototype.stateEncounterStart = function() {
	this.nextState(this.stateChooseAbility);

	// Encounter steps onto the stage
	this.encounter = choose(this.encounters);
	this.encounter.reset();
	this.encounter.enter(this);
};

Game.prototype.stateChooseAbility = function() {
	this.nextState(null);

	// Populate useable Abilities
	this.UI.clearText();
	this.drawAbilities(3);

	var that = this;
	setTimeout(function() {
		that.UI.setText("Attack!", null, 1.0, "Click a card below.");
	}, 1000);
}

Game.prototype.drawAbilities = function(count) {
	var game = this;

	var clickHandler = function(ab, elem) {
		game.UI.clearAbilitiesExcept(elem);
		game.stateRollDie(ab);
	};

	game.UI.addAbilities(choose(this.abilities, count), clickHandler)
}

Game.prototype.stateRollDie = function(ability) {
	var game = this;
	
	// TODO: autowin_counter.

	world.throw(function(result) {
		game.nextState(game.stateCheckDamage);
		ability.resolve(game, result);
	})
}

Game.prototype.stateCheckDamage = function() {
	this.nextState(null);

	// Remove dice and abilities
	world.clear(); 
	this.UI.clearAbilities();

	// If the player dies, show dying text and redirect.
	if (this.player.isDead()) {
		this.nextState(this.stateRedirect);
		this.player.leave(this);
		return;
	}

	// If the enemy dies, show their dying monologue and prepare to redirect.
	if (this.encounter.isDead()) {
		this.nextState(this.stateRedirect);
		this.encounter.leave(this);
		return;
	}

	// Otherwise, set the next combatant.
	this.playerTurn = !this.playerTurn;
	if (this.playerTurn) {
		this.stateChooseAbility();
	} else {
		this.stateEncounterAttack();
	}
};

Game.prototype.stateEncounterAttack = function() {
	this.nextState(this.stateEncounterModifiers);
	this.modifierIdx = this.encounter.modifiers.length;
	this.encounter.attack(this);
}

Game.prototype.stateEncounterModifiers = function() {
	if (!this.modifierIdx || this.encounter.isDead()) {
		this.stateCheckDamage();
		return;
	}

	this.modifierIdx--;
	this.nextState(this.stateEncounterModifiers);
	this.encounter.resolveModifier(this, this.modifierIdx);
}

Game.prototype.stateRedirect = function() {
	window.location.href="http://www.expeditiongame.com";
}

Game.prototype.autowin = function(ability) {
	game.log(ability.successText);
	this.encounter.damage(this, this.encounter.health);
	this.encounter.leave(this);
	this.endScreen();
}


Game.prototype.resolveEncounterRandom = function() {
	// Setup the next scene if the encounter is dead. Otherwise, fight back!
	if (this.encounter.isDead()) {

		this.encounter.leave(game);
		this.endScreen();
	} else {
		this.encounter.attack(game);
	}
}

Game.prototype.stateGameOver = function() {
	//this.UI.clearAbilities();
	//this.endgameButtons.show();
};
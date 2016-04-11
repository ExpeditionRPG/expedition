
var Player = function() {
	this.maxHealth = 20;
	this.health = 0;
	this.gold = 0;
	this.loot = [];
}

Player.prototype.reset = function() {
	this.health = 20;
	this.gold = 0;
	this.loot = [];
}

Player.prototype.enter = function(game) {
	game.UI.setText([
		"You slowly come to your senses.",
		"You open your eyes.",
		"You awaken in an unfamiliar place.",
	], null, 3);
};

Player.prototype.leave = function(game) {
	game.UI.setText([
		"You succumb to your wounds.",
		"Your vision fades to black.",
	]);
}

Player.prototype.damage = function(game, n, nextAction) {
	this.health = Math.max(0, this.health - n);

	var text = (n <= 0) ? "You gain " + (-n) + " health!" : "You have " + this.health + " health left."

	game.UI.setText(text, nextAction);
	
	// We're invulnerable for the purpose of the demo.
	
}

Player.prototype.damageUpTo = function(game, n) {
	this.damage(game, randInt(n)+1);
}

Player.prototype.isDead = function() {
	return this.health <= 0;
};
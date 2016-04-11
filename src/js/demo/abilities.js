var Ability = function(title, risk, successAction, failureAction) {
	this.sheet = "Ability";
	this.title = title;
	this.risk = risk;
	this.success = successAction;
	this.failure = failureAction; 
}

Ability.prototype.resolve = function(game, roll) {
	var that = this;

	if (roll >= this.risk) {
		if (roll == 20) {
			game.encounter.setNextDamageCrit(true);
		}
		that.success(game);
		return true;
	} else {
		that.failure(game);
		return false;
	}
}

var setupAbilities = function() {
	return [
		new Ability("Shockwave", 10, function(game) {
				game.UI.setText("You release a blast of electricity!", function() {
					game.encounter.damage(game, 2);
				});
			}, function(game) {
				game.UI.setShakeText("The shockwave is out of control!", function() {
					game.player.damage(game, 1, function() {game.encounter.damage(game, 1)});
				});
			}),

		new Ability("Fireball", 11, function(game) {
				game.UI.setText("You conjure a ball of searing flame and hurl it at the enemy!", function() {
					game.encounter.damage(game, 3);
				});
			}, function(game) {
				game.UI.setShakeText("Your hands catch on fire; you burn yourself.", function() {
					game.player.damage(game, 2);
				});
			}),

		new Ability("Ice Shard", 8, function(game) {
				game.UI.setText("Shards of ice materialize from a cold vapour and speed towards your target!", function() {
					game.encounter.damage(game, 3);
				});
			}, function(game) {
				game.UI.setText("You feel a bit frosty, but otherwise nothing happens.");
			}),

		new Ability("Phantom Sword", 13, function(game) {
				var that = this;
				game.UI.setText("You shout a hurried incantation...", function() {
					game.player.damage(game, -3, function() { game.encounter.addModifier(newPhantomSwordModifier())});
					game.disableAbility(that);
				});
			}, function(game) {
				game.UI.setText("You mumble a few syllables; nothing happens.");
			}),

		new Ability("Magic Missile", 8, function(game){
				game.UI.setText([
					"A many-hued orb of light rockets towards the enemy!",
					"Ptcheww! You fire a magical missile at the enemy.",
				], function() {
					game.encounter.damage(game, 3);
				});
			}, function(game) {
				game.UI.setText([
					"Your missile was insufficiently magical.",
					"The missile fizzles out."
				]);
			}),

		new Ability("Phase Shift", 8, function(game) {
				game.encounter.setNextDamageCrit(false); // Suppress criticals on encounter.
				game.UI.setText("The light bends around you...", function() {
					game.player.damage(game, -3);
				});
			}, function(game) {
				game.UI.setText("You flicker slightly, but remain unphased.");
			})
	];
};
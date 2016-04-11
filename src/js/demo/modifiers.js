
var Modifier = function(enter, run, leave) {
	this.enter = enter;
	this.run = run;
	this.leave = leave;
}


var newPhantomSwordModifier = function() {
	return new Modifier(["An ethereal sword appears, wreathed in flame!"], function(game) {
		game.UI.setText("The phantom sword strikes!", function() {
			game.encounter.damage(game, 1);
		});
		return true; // Keep going
	}, ["The phantom sword disappears."]);
}


var UI = function() {

	this.speed = 500;

	// if smaller than 1000px X 950px, scale down
	this.scale = 1;
	if ($(window).width() < 900 || $(window).height() < 830) {
		this.scale = 0.65;
	} else if ($(window).width() < 1000 || $(window).height() <= 950) {
		this.scale = 0.85;
	}

	this.textLog = $("#textLog");
	//this.textNext = $("#textNext");
	this.abilityDiv = $("#abilities");
	this.encounterDiv = $("#encounter");
	this.endgameButtons = $("#endgameButtons");
	this.encounterHealth = $("#healthCounter");
	this.helpText = $("#helpText");

	this.defaultTextNextAction = null;
	this.nextAction = null;

	this.helpTimeout = null;
	this.helpTimeoutMillis = 3000;

	var that = this;

	var userInput = function() {
		clearTimeout(that.helpTimeout);
		that.helpTimeout = null;
		if (that.nextAction) { //Any key
			that.nextAction();
			that.nextAction = null;
		} else {
			console.log("No default action");
		}
	}

	$(window).keydown(userInput);
	$(window).click(userInput);
};

UI.prototype.fadeOut = function($elem, cb) {
	if ($elem.hasClass("transparent")) {
		cb();
		return;
	}
	$elem.addClass("transparent");
	$elem.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {cb});
}

UI.prototype.fadeIn = function($elem, cb) {
	if (!$elem.hasClass("transparent")) {
		cb();
		return;
	}
	$elem.removeClass("transparent");
	$elem.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e) {cb});
}

UI.prototype.setText = function(textOrList, nextAction, speedMultiplier, helpText) {
	var that = this;

	var text = (typeof(textOrList) == "string") ? textOrList : choose(textOrList);

	if (!nextAction) {
		nextAction = this.defaultTextNextAction;
	}

	if (!helpText) {
		helpText = "Click or press any key to continue...";
	}

	var speed = this.speed;
	if (speedMultiplier) {
		speed *= speedMultiplier;
	}

	var fadeIn = function() {
		//that.textNext.css({ opacity: 0 });
		that.textLog.text(text).transition({ opacity: 1 }, speed, function() {
			if (!nextAction) {
				return;
			} 

			//that.textNext.transition({ opacity: 1 }, speed);
			that.nextAction = nextAction;
		});

		that.helpTimeout = setTimeout(function() {
			that.helpText.text(helpText).transition({ opacity: 1 });
		}, that.helpTimeoutMillis);
	};

	if (this.helpText.css("opacity") != 0) {
		this.helpText.transition({ opacity: 0 }, speed);
	}

	if (this.textLog.css("opacity") != 0) {
		this.clearText(speed, fadeIn);
	} else {
		fadeIn();
	}
};

UI.prototype.setShakeText = function(textOrList, nextAction, speedMultiplier, helpText) {
	var that = this;
	this.setText(textOrList, nextAction, speedMultiplier, helpText);
	setTimeout(function() {
		that.shake(that.textLog);
	}, 500);
}

UI.prototype.clearText = function(speed, callback) {
	//this.textNext.transition({ opacity: 0 }, speed);
	this.textLog.transition({ opacity: 0 }, speed, callback);
	this.helpText.transition({ opacity: 0 }, speed);
}

UI.prototype.clearAbilities = function() {
	this.clearAbilitiesExcept(null);
}

UI.prototype.clearAbilitiesExcept = function(exclude) {
	var abilities = this.abilityDiv.children();
	var $exclude = $(exclude);
	jQuery.each(abilities, function(i, ability) {
		// TODO: Don't remove the chosen ability
		var $ability = $(ability);

		if ($ability.is($exclude)) {
			$ability.unbind("mouseenter mouseleave");
			$ability.transition({ x: 0}, 1000, 'ease');
		} else {
			$ability.transition({ opacity: 0}, function() { 
				$ability.remove() 
			});
		}
	})
	
}

UI.prototype.loadCard = function(card) {
  var i;
  for (i = 0; i < sheets[card.sheet].elements.length; i++) {
  	if (sheets[card.sheet].elements[i].Title == card.title) {
  		break;
  	}
  }
  if (i == sheets[card.sheet].length) {
  	console.log("Could not find card in sheets: " + card);
  	return;
  }
  var loaded = $(renderCardFront(card.sheet, sheets[card.sheet].elements[i])).attr("id", card.card);
  return loaded;
  //return $("<img>").attr("id", card.card).attr("src", "img/demo/" + card.card + ".png");
}

UI.prototype.addAbilities = function(abilities, clickHandler) {
	if (abilities.length != 3) {
		console.log("TODO: Arranging other than 3 abilities");
		return;
	}

	abilities.forEach(function(ability, idx) {
		setTimeout(function() {
			game.UI.addAbility(ability, 260 * (idx - 1), clickHandler);
		}, 300*idx);
	});
}

UI.prototype.addAbility = function(ab, offs, handler) {
	var that = this;

	var ability = this.loadCard(ab).css({ opacity: 0, x: 0, y: 200, scale: this.scale })
		.one("click", function() {
			clearTimeout(that.helpTimeout);
			that.helpTimeout = null;
			handler(ab, this);
		})
		.bind("mouseenter", function() { 
			$(this).transition({ y: '-=10' }, 100); 
		})
		.bind("mouseleave", function() {
			$(this).transition({ y: '+=10' }, 100);
		});
	this.abilityDiv.append(ability);
	ability.transition({ opacity: 1, x: offs, y: -400 });

  	SVGInjector(ability.find("img"), {});
}

UI.prototype.showEncounter = function(card) {
	var that = this;
	var encounter = this.loadCard(card).css({ opacity: 0, rotateY: '-180deg', scale: 0.5 });
	this.encounterDiv.append(encounter);
	SVGInjector(encounter.find("img"), {});
	encounter.transition({ opacity: 1, perspective: '500px', rotateY: '0deg', scale: this.scale }, function() {
		that.writeEncounterHealth(card.health);
	});

}

UI.prototype.shake = function(elem) {
	var spd = 80;
	elem.transition({ x: 10 }, spd)
		.transition({ x: -10 }, spd)
		.transition({ x: 5 }, spd)
		.transition({ x: -5 }, spd)
		.transition({ x: 0 });
}

UI.prototype.shakeEncounter = function() {
	this.shake(this.encounterDiv);
}

UI.prototype.writeEncounterHealth = function(hp) {
	var health = $("<div>").text(hp).css({ opacity: 0});
	this.encounterHealth.append(health);
	health.transition({ opacity: 1 });
}
(function init() {
  createView();

  Tabletop.init({
    key: '1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM',
    callback: function(d, t) {
      console.log('sheets loaded');

      cardData = d; // save these in case we need them later (ie re-running rendering)
      tabletop = t;
      sheets = tabletop.sheets();

      // assert load worked
      for (var page in templates) {
        if (!sheets[page]) {
          return alert('Failed to sheet: ' + page);
        }
        if (sheets[page].elements.length <= 1) {
          return alert('No cards loaded for: ' + page);
        }
      }
      render();
    }, simpleSheet: true
  });
})();

function createView() {
  var content = $(".page-content");

  var headerTmpl = Handlebars.compile($("#header-template").html());
  var iconTextTmpl = Handlebars.compile($("#icon-text-template").html());

  content.append(headerTmpl({id: "welcome", title: "Welcome!"}));

  content.append(iconTextTmpl({
    id: "intro",
    title: "Expedition is Different",
    img: "img/icon/roll.svg",
    p1: "This game is built from the ground up to be thoughtful and challenging, but not slow and overwhelming. "
      + "It's dead simple to be the Guide, Expedition's \"game master\" role.",
    list: [
      "There's less number-crunching, but every decision remains just as open-ended.",
      "Everything is card-based. For long campaigns, players can (and should) take their decks home and personalize them.",
      "Encounters resolve within minutes, so you can get on with the story.",
      "Made-up rules (\"House Rules\") are encouraged, and add significant depth to the game.",
    ],
  }));

  content.append(iconTextTmpl({
    id: "requirements",
    title: "Requirements",
    img: "img/icon/adventurer.svg",
    p1: "A standard game requires a Guide and 3-5 Adventurers, as well as:",
    list: [
      "A copy of the cards, either purchased or <a href=\"http://expeditiongame.com/begin\" target=\"_blank\">downloaded and printed</a>.",
      "A phone or tablet running the <a href=\"http://app.expeditiongame.com\" target=\"_blank\">Expedition App</a>.",
      "A 20-sided die for every player.",
      "A token to track health for each player (paperclips work well).",
      "A pencil and a piece of paper."
    ],
  }));

  content.append(iconTextTmpl({
    id: "choose-abilities",
    title: "Setup",
    img: "img/icon/mage.svg",
    p1: "Before beginning your story:",
    list: [
      "Pass the Adventurer deck around, allowing everyone to look through and choose their character.",
      "While players are choosing, introduce them to the story to help them come up with a backstory, motive and personality for their character.",
      "Direct each player to choose their starting abilities from one of the ability decks.",
    ],
    p2: "Further instructions on choosing explorers and abilities can be found in the "
      + "<a href=\"/handbook.html#setup\" target=\"_blank\">Setting Up</a> section of the Adventurer's Handbook.",
  }));

  content.append(headerTmpl({id: "encounters", title: "Encounters"}));

  content.append(iconTextTmpl({
    id: "trouble-encounter",
    title: "Encounter Difficulty",
    img: "img/icon/fae.svg",
    p1: "Your party's next encounter should be just a bit tougher than they can handle.",
    list: [
      "A Tier IV encounter (e.g. four Tier I cards) is a good match for a party of 3-4 Adventurers.",
      "You may combine Encounters (\"spider-wolves\", etc), mixing and matching Health, Tier, and Surge.",
    ],
  }));

  content.append(iconTextTmpl({
    id: "encounters-app",
    title: "The Expedition App",
    img: "img/logo.svg",
    p1: "The <a href=\"http://app.expeditiongame.com\" target=\"_blank\">Expedition App</a> calculates damage based on the enemies in play.",
    list: [
      "When an Encounter is played, add its Tier to the App.",
      "If an Encounter is prevented from attacking by being stunned or otherwise, remove its Tier from the App.",
      "If you're just starting out, follow the App tutorial for a quick demonstration round.",
    ],
  }));

  content.append(iconTextTmpl({
    id: "encounters-rounds",
    title: "Encounter Rounds",
    img: "img/icon/damage.svg",
    p1: "Once you're ready to start, notify everyone that the round has begun!",
    list: [
      "Tap the app to start the timer.",
      "Players should draw their three Ability cards and play one, quickly! Their damage taken increases the longer they deliberate.",
      "Once every player has played, stop the timer by tapping it.",
      "Resolve the round. All players must roleplay their abilities and take the damage listed on the app.",
      "Surges may occur at the end of a round. You should resolve the actions listed under the Surge section of all the Encounter cards of that Tier."
    ],
  }));

  content.append(iconTextTmpl({
    id: "encounters-storytelling",
    title: "Tell the Story",
    img: "img/icon/physical.svg",
    p1: "Describe the ebb and flow of battle as it occurs:",
    list: [
      "What's the enemy formation? who can and can't be hit? Do they call for help? etc.",
      "Shake up an Encounter; try introducing another enemy to the battle, or even another faction.",
      "Multiply encounter cards to create epic battles - for instance, 10 guards deal 10X damage and have 10X health.",
      "If your allies are in trouble, try playing encounter cards as \"allies\" to help attack the enemy. These cards should deal their Tier in damage each round, and take damage just like players.",
    ],
  }));

  content.append(iconTextTmpl({
    id: "encounters-enforcement",
    title: "Enforce the Rules",
    img: "img/icon/bandit.svg",
    p1: "It's important to keep everyone on track and honest:",
    list: [
      "Make sure people are roleplaying their actions.",
      "Keep an eye on everyone's health and ensure everyone is taking damage appropriately.",
      "Make sure items are discarded after they're used.",
    ],
    p2: "When an enemy takes damage or is otherwise affected, write down their damage remaining on your paper."
  }));

  content.append(iconTextTmpl({
    id: "encounters-end",
    title: "Ending Encounters",
    img: "img/icon/loot.svg",
    p1: "If players survive the encounter, they all heal back to full health and are rewarded with Loot!",
    list: [
      "Each Tier of the encounter is worth about 10 coins; for instance, an encounter where 4 Tier I bandits died would have 40 coins worth of loot.",
      "Enemies that fled or were otherwise taken out of play do not contribute any Loot.",
    ],
    p2: "If nobody survived, something terrible happens to the party while they "
      + "are unconscious. This is a fantastic opportunity to take the story "
      + "in a new direction and catch your players by surprise!",
  }));

  content.append(headerTmpl({id: "incidentals", title: "Incidentals"}));

  content.append(iconTextTmpl({
    id: "leveling-up",
    title: "Leveing Up",
    img: "img/icon/adventurer.svg",
    p1: "Leveing up provides a sense of growth for players. We recommend rewarding level ups about once per hour.",
    p2: "There are two ways to level up adventurers: by learning an additional ability (draw 3, pick 1), or by flipping over their adventurer card. The former is a small reward, while the latter is a really big reward.</p><p>We've found that the best time to offer level ups is right after the party completes a particularly hard fight or puzzle, so that the players know how they earned it.",
  }));

  content.append(iconTextTmpl({
    id: "environment-houserules",
    title: "House Rules",
    img: "img/icon/coin.svg",
    p1: "You can make up your own rules as you go. Here's a few we use often:",
    list: [
      "Enemies can take on formations. The rear ranks don't take physical damage.",
      "Arcane abilities can sometimes imbue weapons or creatures with temporary bonuses.",
      "Fire or Shock attacks around explosive materials can cause explosions!",
      "Burning buildings can create falling wreckage; underground exploration risks a cave-in.",
      "Loot can be sold at merchants at their card value, and used to buy other Loot items",
      "Stunned enemies are stunned for a single round only. They don't contribute to the Tier while stunned."
    ],
  }));

  content.append(iconTextTmpl({
    id: "postgame-cards",
    title: "After Each Game",
    img: "img/icon/undead.svg",
    p1: "When you finish an arc of your story (usually, at the end of a play session):",
    list: [
      "Let every player pick a new Ability that they can use next time.",
      "Players should record their spare gold.",
      "Each player owns their cards, and should take their decks home.",
      "Players may also customize their cards, adding bits of lore or drawings.",
    ],
  }));
}
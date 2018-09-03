# Expedition QDL Help

## Getting Started

Welcome, fearless mortal, to the [Expedition Quest Editor](http://quests.expeditiongame.com)! Use this tool to craft custom quests of dangerous deeds and awful alliteration with speed and ease.

Quests are written in QDL, which is a variant of [Markdown](http://daringfireball.net/projects/markdown/).

To get you started, when you first log in, the Quest Editor is populated with an example quest that walks through the basics of QDL. For additional inspiration, here are two complete quests: [Mistress Malaise](examples/mistress_malaise.md) and [Oust Albanus](examples/oust_albanus.md).

Here we'll dive into more specific details about what's possible in QDL.


## Glossary

[**Attribute**](#attributes): cards and elements can be given additional attributes, such as ID's and if statements, that extend their functionality.

[**Branches**](#branches): when users make choices or do things that have multiple possible outcomes (such as combat, which can be won or lost), this creates "branches" in the story, indicated by increasing the indentation in QDL.

[**Cards**](#cards): in the app, each screen the user sees is a separate "card" that you'll write in QDL.

[**Context**](#context): the context lets you set, edit and use math and variables to alter flow of the quest, such as to see if the party found the key earlier, or if they have enough gold to buy a potion.

[**Elements**](#elements): roleplaying cards can contain text - but they can also contain other elements, such as choice buttons and instruction blocks.

[**Formatting**](#formatting): ways to format your text, including bold, italic, newlines and more.

[**Metadata**](#metadata): Quest metadata defined at the top of the quest. Specifies things like the number of adventurers supported, the quest title and author, etc


## Attributes

Attributes can be added to specific cards and elements to give you additional capabilities.

### IDs

For **cards**, you can add an ID that can be jumped to from anywhere else in the quest via **goto elements**. Note: **IDs must be unique across the entire quest**. ID's should be written in camelCase and only use alphanumeric characters. This looks like:

```
_roleplay title_ (#id)
_combat_ (#longCardId)
```

IDs allow you to reference that specific card in other places in the quest. You can use a GOTO statement to jump to that card:

```
* Pick me to jump to the card

  **goto longCardId**
```

To make your life easier as a writer, you can alt + click `**goto**` statements to jump directly to the card they reference.

You can also see how many times the user has viewed that specific card:

```
{{_.viewCount("longCardId")}}
```

This can be very powerful - for example, if you wanted to create a conversation where the user could only ask each question once, you could do something like:

```
_Conversation loop_ (#conversation)

You prepare to ask John a question...

* {{_.viewCount("question1") == 0}} Question 1

  _Question 1_ (#question1)

  His answer

  **goto conversation**

* {{_.viewCount("question2") == 0}} Question 2

  _Question 2_ (#question2)

  His answer

  **goto conversation**

* Leave

  _Leave_

  You leave the conversation and the loop
```


### IFs

For **elements** (including listing combat enemies), you can add IF statements that reference the **context** to selectively show or hide the element. This looks like:
```
> {{ onFire == true }} Lose 1 health
* {{ gold >= 10 }} Buy a potion for 10 gold
**{{ food <= 0 }} end**
**{{ hasKey == true }} goto openSafe**
- {{ killedTheArcher == false}} Archer
```

## Branches

Branching lets you create interactive adventurers with choices and consequences. Once a branch creates a fork in the story, you keep track of the branch by indenting one additional level. At the end of that indented segment, the app decreases the indention level until it finds the next card it can play.

You have two types of branches at your disposal:


### Choices

You can present adventurers choices in roleplaying cards, which appear at the bottom of the card.

Here's a basic example:

```
* A basic choice

  The roleplaying card adventurers will see if they select the choice. Notice that a title isn't required right after the choice.
```

And a more complex demonstration of how branches fall through once complete:
```
* First choice: option A

  Branching on the first choice

  * Second choice: option 1

    At this point, adventurers have selection option A then option 1.

    _Another card_

    Adventurers will continue to this card after selecting option A and option 1.

    Then, because there are no more cards at this indentation level, they'll fall past all of the other choices they didn't select, all the way to the "Unity" card.

  * Second choice: option 2

    If adventurers select this, they won't see "Unity" because the quest ends here on this branch.

    **end**

* First choice: option B

  Adventurers will never see this if they select option A, but they will see "Unity" next, because there are no more cards at this indentation level.

_Unity_

Adventurers will see this card after both options fall through (unless they're redirected, for example with a **goto** or **end** element)
```


### Events

Where choices are triggered by adventurers making a choice between buttons, events are triggered by the app when certain criteria are met. Right now, there are `* on round`, `* on win` and `* on lose` events in combat, though this may be expanded in the future.


## Cards

Cards are your basic storytelling tool in QDL. You have at your disposal:


### Combat Cards

What's an adventure without some swordplay? The basic syntax for a combat card is:


```
_combat_

- Enemy Name
- Enemy Name

* on win

  _roleplaying title_

  card text.

* on lose

  This is also a roleplaying card, even if you don't give it a title.
```

Allowable enemy names are the enemies in the Expedition deck - you can look through your copy of the game, or reference the [master spreadsheet](https://docs.google.com/spreadsheets/d/1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM/edit#gid=1555320979) to see all of your options.

Note that at least one enemy, exactly one valid `on win` and one valid `on lose` are required.

You can specify custom enemies with the following syntax: `- Custom Enemy Name {"tier": 3}`. If you do this, players will be instructed to draw a random enemy of that tier and use its health and abilities.

`on round` is an optional event that can spice up combat by injecting roleplay cards into specific rounds of combat. For instance, you can add a roleplay card to a boss battle to check if a certain enemy is dead:

```markdown
_combat_

- Zombie
- Lich

* on round

  > Is the Lich dead?

  *  Yes

     **win**

  *  No

     The Lich engulfs your party in frost!

     > All adventurers take 1 damage

* on win

  ...

* on lose

  ...
```

You can also only show the event on a particular round (or with a particular frequency) to surprise and delight your players:

```markdown
_combat_

...

* {{_.currentCombatRound() % 2 == 1}} on round

  This happens on rounds 1, 3, 5, etc. (The first round is round 1)
```

Or show additional instruction during a surge:

```markdown
_combat_

...

* {{_.isCombatSurgeRound()}} on round

  Extra surge dialogue! Perhaps your allies also surge for a bonus, or you take damage from the room collapsing.
```

You can also have mid-combat choices lead to the end of combat by having them use the win / lose triggers outside of the normal combat flow. For example:

```markdown
* on round

  Did you kill the Lich?

  * Yes

    **win**

  * No

    The battle continues...
```

#### Scaling your combat encounters

Fights that are too easy (or too hard!) can ruin an adventure. Here are our recommendations for balancing your fights to make them fun but challenging (we'll take care of scaling the difficult based on number of adventurers and app difficulty):

- The first encounter on any branch of the quest should have a total tier of around 2-3
- Each following encounter can get around 1 tier harder as players acquire more loot, abilities and teamwork.
- The hardest / boss fight should generally be around tier 6-8, assuming players have had a few fights to prepare.

We've found that the two biggest factors that influence fight difficulty are loot and practice. So, if you reward your players with loot outside of combat (ie finding a treasure chest, visiting a merchant), you can scale combat faster. Conversely, if you want your quest to go on for longer and have more than 3-5 fights, you should refrain from awarding additional loot early on.

#### Losing encounters

When writing your story, we encourage you to think about what would happen if the adventurers lost the fight but didn't die. What if they were knocked out and taken prisoner, and then had to escape? Or what if they were fighting to protect the king and failed, and now you had to figure out where the bandits took the king? Having `* on lose` lead to an interesting twist of the story is much more satisfying for your players!

#### Random encounters

Sometimes in a quest, it makes sense for the enemies to be random. Maybe you encounter a group of Bandit thugs, but it doesn't affect the story if they're tier 1 archers or tier 1 footpads. In cases like this, a touch of randomness can increase surprise and replayability.

You can use the following syntax to create random enemies - anything from a totally random enemy, to a random enemy of a specific class or tier, all the way to a random enemy of a specific class and tier:


```
_combat_
- {{_.randomEnemy()}}
- {{_.randomEnemyOfTier(1)}}
- {{_.randomEnemyOfClass("Bandit")}}
- {{_.randomEnemyOfClassTier("Bandit", 1)}}
```

Note: you must use double quotes (not single quotes) for strings inside of ops {{}}.

#### Customizing rewards

By default, when adventurers win a combat, they heal to full health and are rewarded with loot and xp. But, as the storyteller, you might not always want that to happen. For example, you might not want to reward players with loot and xp for a battle they shouldn't have fought. Or, maybe they're on the run and don't have time to heal (or only partially heal) after the fight.

To do this, you simply annotate the combat on win outcome. Below, you can see what it looks like to disable loot and xp rewards, to disable healing, loot and xp, and to only allow the adventurers to partially heal (+6 health). Anything you don't define defaults to the normal: heal to full health, and gain loot and xp.

```
* on win {"loot": false, "xp": false}
* on win {"heal": 0, "loot": false, "xp": false}
* on win {"heal": 6}
```

Note: In cases where adventurers won't heal at the end of combat, it's nice to warn them with an instruction node before combat starts so that they can make better choices - for example: `> You're on the run! You won't heal after this encounter.`


### Roleplaying Cards

Everything except for combat happens in roleplay cards, including showing text and choices to adventurers. The basic syntax for a roleplaying card is:

```
_Card Title_

Card text.

More card text.
```

Note that you cannot title roleplaying cards `combat` / `Combat`, because that is reserved for combat cards.


## Context

Context allows you to use variables in your quest. This is a powerful tool with the potential to break quests for users (i.e. only letting them win if they have gold >= 10, but only giving them the chance to find 9 gold), so use with caution, planning and testing!

A quick example of using context variables to display values to the party, optionally show / hide a choice to them, and adjust an encounter based on past events.

```markdown
_title_

{{ hasPotion = false }}
{{ gold = 10 }}

{{gold > 0}} Your party has {{ gold }} gold. You walk by a merchant stall offering to sell you a potion for 5 gold.

{{gold == 0}} You have no gold!

* {{ gold >= 5 }} Buy the potion

  {{ hasPotion = true }}
  {{ gold = gold - 5 }}

  You purchase the potion. You now have a potion, and {{ gold }} gold.

* Continue walking

  You decide not to purchase the potion.

_Unsavory Folks_

Looks like your wealth has attracted some attention...

_combat_

- Brigand
- {{ gold > 5 }} Thief

* on win

  Good job!

* {{ hasPotion == false }} on lose

  **end**

* {{ hasPotion == true }} on lose

  {{ hasPotion = false }}

  You lost the fight, but were able to drink your newly-purchase potion just before dying.
```

Expedition uses [MathJS](http://mathjs.org/) to handle the context. If you're trying to figure out how to do something specific or complex (for example, arrays and strings), we recommend using the console on their website to quickly test ideas, and checking out their [documentation](http://mathjs.org/docs/index.html) to see what functions they have available.

**Conditional display**: You can conditionally show / hide paragraphs, instructions and choices by having an operation at the start that evaluates to `true` or `false`:

- Paragraphs: `{{gold == 0}} This text only appears if you have 0 gold.`
- Instruction: `> {{injured == true}} You'll be shown this instructional text if you are injured.`
- Choices: `* {{hasPotion == true}} You'll only be shown this option if you have the potion.`

**And / Or**: Logical operators with MathJS are a bit unusual, as AND is a single `&` and OR is a single `|`. For example, to check if both `a` and `b` are equal to one, you would write `{{a == 1 & b == 1}}`.

**Syntax notes:** Boolean variables are lowercase, ie `true` and `false`. Relative operations (for example `gold -= 5`) are not currently supported, so you'll need to write them out in long form, ie `gold = gold - 5`.

**Debugging note:** in the Quest Creator, if you use "Play from Cursor", context variables that are defined in earlier cards will not be set. We're currently working on additional tooling around context to help you set context variables without having to replay large portions of your quest, but a handy debugging trick for now is to set the variables to your desired values at the top of the card you're starting from - just make sure to remove them when you're done debugging!

**Setting variables based on other variables:** To set a variable based on another variable, you can use the output of a ternary operator, for example: `{{ variable2 = (variable1 == "cats" ? "I like cats" : "I like dogs") }}`

### Static Functions

We've included a couple functions that you can call anywhere in your quest code.

**aliveAdventurers()**

Only usable during a combat `* on round` event. `{{_.aliveAdventurers()}}` returns how many adventurers are currently above 0 health.

**currentCombatTier()**
Only usable during a combat `* on round` event. `{{_.currentCombatTier()}}` returns the current tier sum of the enemies.

**numAdventurers()**

`{{ _.numAdventurers() }}` returns the current number of players. This is often used in [ternary](https://en.wikipedia.org/wiki/%3F:) operators to change the singular/plural nature of words, or to change instructions based on how many people are playing. For example:

```markdown
> {{(_.numAdventurers() > 1) ? "Every player rolls a D20" : "Roll a D20"}}
```

**viewCount(<string>)**

Returns the number of times an element with the specified ID has been visited by the player during a quest. For example, `{{ _.viewCount("testID") }}` would tell you how many times the party has been to the node with ID "testID".

**random([size, min, max]) and other MathJS functions**

`{{random()}}` is actually a built-in function to MathJS, and returns a random decimal value between 0 and 1. It supports a number of optional arguments; check [here](http://mathjs.org/docs/reference/functions/random.html) for more details. You may also be interested in [pickRandom](http://mathjs.org/docs/reference/functions/pickRandom.html) for randomly selecting from a list of values.

MathJS includes a number of other useful geometric, combinatorial, algebraic, trigonometric, and other functions that you can also use in your quests. You can find a full list [here](http://mathjs.org/docs/reference/functions.html)

## Elements

Using elements, roleplaying cards can be more than just text.


### Choices

As covered in the **branching** section, you can include choice elements inside of cards.

### Icons

You can embed inline icons to make your quest more visually interesting! Simply add `:icon_name:` to roleplaying text, instructions or choices. You can also use icons as the background watermark on a page via `_Card title_ {"icon":"adventurer"}`, though we recommend using watermarks on less than a quarter of your cards, so that when the watermark does appear, players know it's emphasizing something.

We recommend using icons as unique symbols, not as a replacement for words. (i.e. DON'T: use the d20 icon instead of the word die, such as in `> Roll a die`. DO: use the bandit icon to show what the thief's tatoo looks like). You can also replace the default instruction icon to make it clearer what the instruction is about; for example `> :loot: Draw one tier II loot` or `> :roll: Roll a die to try to sneak past the guards`.

[Here's the list of available icons](https://github.com/expeditionrpg/expedition-art#icons)

### Instructions

You can also display helpful instructional callouts in the card via **instruction** elements (which can also use context to be selectively shown / hidden):

```
> Draw one tier 1 loot
> {{ onFire == true }} Reduce all adventurers' health by 1
```

### Art

You can embed large images in cards for visually important things, such as showing off a symbol found on a lock. Simply add `[art_name]` to a roleplaying card's contents. By default, art takes up 50% of the width of the card, reducing the amount players need to scroll. If it's important for the art to take up the full width of the card, you can append `_full` to the end, such as `[art_name_full]`. You can use any icon listed in the **Icons** section. You can also use [the art files listed here](https://github.com/ExpeditionRPG/expedition-art/tree/master/art) - note that because those files are PNG extension, you'll need to add `_png` after the file name and before `_full`, for example `[darker_at_dawn_png_full]`

### Context

You can set and reference the context inside of roleplaying cards. Context code that sets a variable is hidden, whilst code that just references a variable will display its value on the card.

For example, this will set gold to 10, but nothing will be displayed:

```
{{ gold = 10 }}
```

Whist this will show the value of gold (10):

```
You have {{ gold }} gold.
```


### Pointers

Pointers allow you to jump adventurers to different points in your quest, allowing for all sort of interesting quest structures - for example, looping through the first floor of a dungeon until they find the secret handle.

In general, there are two types of pointers: **goto ID**, which jumps to the card with the matching ID, and **end**, which ends the quest.

If pointers are the only contents in a card, the app will immediately jump. For example:

```
_Starting card_

The user sees this card, with one button.

* Jump me!

  **goto another**

_Another card_ (#another)

After clicking "Jump me!", the app will immediately proceed to this card.
```

Whereas, if the pointer is part of a roleplaying card with other text and elements, it will simply override the default "Next" button. For example:

```
_Starting card_

The user sees this card, with one button.

* Jump me!

  Because there is text here, adventurers will see this card. Then, when they click "Next", they will jump to the #another card.

  **goto another**

_Another card_ (#another)

After clicking "Jump me!", the app will immediately proceed to this card.
```

## Formatting

You can spice up your text in a variety of ways:

```
**bold your text**
_italicize your text_
~~strike through your text~~
insert \n single line \n newlines
```

## Metadata

The quest metadata is defined at the top of each quest. Here's an example:

```
# Adventurous Quest
summary: A quest involving an adventure!
author: Todd
email: Expedition@Fabricate.IO
url: ExpeditionGame.com
familyFriendly: false
minPlayers: 1
maxPlayers: 6
minTimeMinutes: 20
maxTimeMinutes: 60
```

If your quest is missing a metadata field (say, it was created before a feature was rolled out), you can add it by hand - the metadata area is editable.

**title**: The first line is the quest title, which is what adventurers will see when searching quests.

**summary**: A quick, 1-2 sentence description of your quest. This is what adventurers will see if they click on your quest for more information.

**author**: Your name or pseudonym. This is public.

**email**: Your email, in case we need to reach you regarding your quest. This is private.

**url**: Optional: your URL as an author. Not currently visible in the app.

**familyFriendly**: Set to true if your quest meets the following quidelines for being family-friendly. Quests that claim to be family friendly but violate these guidelines may be removed. Repeated violations will lead to further disciplenary action - but in general we will give you the benefit of the doubt and work with you to correct the mistake.

Quests are considered "family friendly" IF: (based on guidelines set forth by the (MPAA)[https://en.wikipedia.org/wiki/Motion_Picture_Association_of_America_film_rating_system#Rating_components])

- there is no or limited foul language; sexually-derived words are not allowed.
- there are no references to intense or realistic violence; limited reference to comedic violence is acceptable.
- there is no mention or use of drugs or substance abuse.
- there are no references to nudity or explicit sexual acts.

**minplayers** and **maxplayers**: The minimum and maximum number of players your quest supports. Generally 1-6 unless you have a specific reason to change them (ie a puzzle requires at least two adventurers)

**mintimeminutes** and **maxtimeminutes**: How long your quest takes, in minutes. Consider the shortest possible path (usually if the party loses at the first combat) and the longest possible path (such as getting stuck on a puzzle). We encourage quests to have no more than 30 minutes of variation between the minimum and maximum length. To help aleviate this, consider having early combat defeats not immediately end the quest.

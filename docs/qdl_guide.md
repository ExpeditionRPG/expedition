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


## Attributes

Attributes can be added to specific cards and elements to give you additional capabilities.

For **cards**, you can add an ID that can be jumped to from anywhere else in the quest via **goto elements**. Note: **IDs must be unique across the entire quest**. This looks like:

```
_roleyplay title (#id)_
_combat (#longerCardId)_
```

For **elements** (including listing combat enemies), you can add IF statements that reference the **context** to selectively show or hide the element. This looks like:
```
> {{ onFire == true }} Lose 1 health
* {{ gold >= 10 }} Buy a potion for 10 gold
**{{ food <= 0 }} end**
**{{ hasKey == true }} openSafe**
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

Where choices are triggered by adventurers making a choice between buttons, events are triggered by the app when certain criteria are met. Right now, there are only `* on win` and `* on lose` events in combat, though this may be expanded in the future.


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

#### Scaling your combat encounters

Fights that are too easy (or too hard!) can ruin an adventure. Here are our recommendations for balancing your fights to make them fun but challenging (we'll take care of scaling the difficult based on number of adventurers and app difficulty):

- The first encounter on any branch of the quest should have a total tier of around 2-3
- Each following encounter can get around 1 tier harder as players acquire more loot, abilities and teamwork.
- The hardest / boss fight should generally be around tier 6-8, assuming players have had a few fights to prepare.

We've found that the two biggest factors that influence fight difficulty are loot and practice. So, if you reward your players with loot outside of combat (ie finding a treasure chest, visiting a merchant), you can scale combat faster. Conversely, if you want your quest to go on for longer and have more than 3-5 fights, you can either


### Roleplaying Cards

Everything except for combat happens in roleplay cards, including showing text and choices to adventurers. The basic syntax for a roleplaying card is:

```
_card title_

card text.

more card text.
```

Note that you cannot title roleplaying cards `combat` / `Combat`, because that is reserved for combat cards.


## Context

Context allows you to use variables in your quest. This is a powerful tool with the potential to break quests for users (i.e. only letting them win if they have gold >= 10, but only giving them the chance to find 9 gold), so use with caution, planning and testing!

A quick example of using context variables to display values to the party, optionally show / hide a choice to them, and adjust an encounter based on past events.

```
_title_

{{ hasPotion = false }}
{{ gold = 10 }}

Your party has {{ gold }} gold. You walk by a merchant stall offering to sell you a potion for 5 gold.

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

**Debugging note:** in the Quest Creator, if you use "Play from Cursor", context variables that are defined in earlier cards will not be set. We're currently working on additional tooling around context to help you set context variables without having to replay large portions of your quest, but a handy debugging trick for now is to set the variables to your desired values at the top of the card you're starting from - just make sure to remove them when you're done debugging!


## Elements

Using elements, roleplaying cards can be more than just text.


### Choices

As covered in the **branching** section, you can include choice elements inside of cards.


### Instructions

You can also display helpful instructional callouts in the card via **instruction** elements (which can also use context to be selectively shown / hidden):

```
> Draw one tier 1 loot
> {{ onFire == true }} Reduce all adventurers' health by 1
```

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

_Another card (#another)_

After clicking "Jump me!", the app will immediately proceed to this card.
```

Whereas, if the pointer is part of a roleplaying card with other text and elements, it will simply override the default "Next" button. For example:

```
_Starting card_

The user sees this card, with one button.

* Jump me!

  Because there is text here, adventurers will see this card. Then, when they click "Next", they will jump to the #another card.

  **goto another**

_Another card (#another)_

After clicking "Jump me!", the app will immediately proceed to this card.
```

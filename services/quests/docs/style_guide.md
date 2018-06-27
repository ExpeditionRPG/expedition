# QDL Style Guide

## What?

This is a style guide on how to write QDL.

## Why?

Maintaining consistent style in your quest makes your life easier when authoring/debugging a quest, and makes it easier for the Expedition team to help you if you run into any issues with quest creation.

## Titles

Quest Titles Should be Capitalized, Just Like Books!

## Conversations

Follow book-writing best practices:

- Use double quotation marks, separating speakers with new paragraphs and a new set of quotes.
- Long speeches from a single character may be broken into multiple paragraphs.
  - Each new paragraph should start with a quote, but only the final paragraph should close with a quote.
- For quests with more than 2 players, avoid having single paragraphs more than 4 or 5 sentences in length since players will be reading the dialog out loud.
  - Also try to keep individual pages to the size of the screen (around 4-8 sentences; you can check this in the Quest Creator by hitting "Play from Cursor")
    so that one person isn't stuck reading the whole story.
- Punctuation marks should be inside of the quotes.
- Capitalize the quoted speech.
- Indicate who is speaking (not always necessary if there are only two parties speaking, but can still reduce reader confusion).
- Intermix dialog with action, so players don't get bored of one or the other.
- Active / present tense and second person is best, since players are reading as it happens. For example:
  `The guard asks you, "Where do you think you're going?". How do you respond?`,
  not `The guard asked them, "Where do you think you're going?". How did they respond?`.

A full dialog example:

```
The priest begins, "This is a really long story.

"A story so long, in fact, that it spans multiple paragraphs!"

The warrior yawns in boredom.

"Hand me that screwdriver," the mechanic grins, wiping her grease-covered hands on her jeans, "I bet I can fix this thing."

* Hand her the screwdriver

  Something

* Chastise the warrior for yawning

  Something else

* Listen to the priest

  Something new
```

More good examples and resources: [one](http://www.writersdigest.com/editor-blogs/there-are-no-rules/keep-it-simple-keys-to-realistic-dialogue-part-i), [two](http://www.wikihow.com/Format-Dialogue-in-a-Story)

## Combat

Combat should slowly increase in difficulty over the length of your quest, to account for additional loot and ability improvements players gain along the way.

A good starting progression of tiers is something like:

* Tier 3 combat
* Tier 4 combat
* Tier 5 combat
* Tier 6 combat

Of course, you can shape combat how you want to fit your quest - for instance, some quests start with an "unwinnable" battle (Tier 9+)
that is designed to fail and move the story forward from there; others may start with an extremely simple Tier 1 combat, but foreshadow that perhaps the fight shouldn't have been that easy...

To keep combat interesting, it's recommended to have at least one combat in the quest do something interesting with the `on round` event. You can read more about this in the [QDL Guide](qdl_guide.md#combat_card)

You can also reward players with loot outside of combat (`> Draw one tier III loot`) for things like solving a puzzle, doing a good deed or exploring and uncovering a treasure chest. Loot makes players more powerful and allows you to make a future fight more difficult - about one tier harder for every two tiers of loot rewarded.

## Instructions

Generally, try to organize instructions with the most important information first, and have all closely related instructions in the same block. For example:

```
> Svella casts Fireball. Roll once. If :roll: > 10, deal one enemy 3 damage.

> {{prepared==true}} +2 to Svella's roll.

> Draw one tier II loot.
```

## Skill checks

Skill checks should generally result in branches of similar lengths - otherwise, you end up with quests that have hugely variable lengths depending on how lucky you are. A couple of examples on how this can work:

- If you're sneaking past a guard and you succeed, perhaps you only fight one guard instead of many, so that you always do combat.
- If your adventurers choose a pacifist path, instead of encountering combat, give them a puzzle to solve or an equivalent amount of roleplaying / storytelling (for reference, each combat generally lasts around 5-10 minutes, or 5-10 roleplaying cards)
- If you're doing a perception check and succeed, you might see additional details, perhaps even a new room to search. If you fail a perception check, perhaps you think you see something and investigate it closer, only to find out it was a shadow / rock / tree / etc.

```
> Roll to sneak past the guard.

* :roll: ≥ 15

  Something happens

* :roll: 10 - 14

  Something else

* :roll: < 10

  Something new
```

## Drawing loot

Note that the number of loot to draw should be the word, tier and loot are not capitalized, and the tier number is written as a Roman numeral.

```
> Draw one tier III loot
```

- Generally try to reward a fixed amount of loot instead of saying "Each adventurer draws one tier I loot", as this imbalances the game and makes larger parties overpowered.

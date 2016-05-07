Quest Specification
===================

Quest files are used to build custom roleplaying scenarios with the Expedition App in a custom _Question Definition Language_.


About the Syntax
----------------

While the files *look* like XML, they do not parse as valid XML. (Perhaps this will change in the future.)

1. There is no single root element.
2. Play usually follows sequential peer elements, although some content appears nested.
3. Some parameters don't have values, and are assumed to be boolean true when present.


### Counter Examples

Not all of the files are quests.  At some point, these may be moved into another directory.

You may find some examples of what _not_ to do
in the following files:

  * bad_goto.txt -- There's more than one element with the same `id`; `id`s should be unique.

  * bad_malicious.txt -- A sample of JavaScript injection that performs an alert.


### Tests

There are other files that exist merely as tests. These, too, may be moved into another directory at some point.

  * goto_test.txt - Performs a jump using a choice to another place in the question.

### Quests as Examples

Several quests exist, which additionally serve as examples of how to use the quest definition langauge.

  * mistress_malaise.txt -- The undead have roamed across the land, your job is to stop them. *A fairly clean example of mostly linear story telling that utilizes most elements. There's a handful of side branches for variety.*

  * oust_albanus.txt -- The town's cheese supply is being stolen, you need to find and stop the raiders. *Mostly linear content, but shows several nesting levels deep for choices.*

  * ill_town.txt -- A mysterious illness has befallen a town.  *This adventure shows a new construct that's still being tested, called the `show-if` attribute on the `<choice>` element; it is used in conjuction with a new `<set-state>` element to carry game state between elments and make conditional content.*


General Gaming Phase Structure
------------------------------
* Flavor text (`<roleplay>`) is presented to the players. Usually it contains blocks of plain HTML.
* If there is no decision, a Next button is presented to the user and gameplay falls through to the next sequential element.
* Decisions are offered with multiple choices (`<choice>`).
* These often lead to an encounter (`<encounter>`) which features one or more enemies (`<e>`) that must be defeated. *The game handles the mechanic details.*
* The encounter continues until it can resolve in only one of two ways, with a win (`<choice win>`) or a (`<choice lose>`).
* Eventually the story line resolves (`<end>`), and the player is allowed to select a new quest.

The quest is primarily a sequential path through the storyline, with nesting of elements within a choice to branch or the use of `goto`s to hop around in a non-linear fashion.


Quest Elements
--------------
There are only a handful of elements.  Certain elements may have an `id` attribute, which must be unique across all elements.

#### `<comment>`
Anything in a comment element is ignored. Uses these for anotating quest files.

#### `<roleplay>`
This is not a verb, nor does it instruct the game to do anything. Rather it is for literal roleplaying: providing flavor text to set the context of the battles and move the story forward.

The roleplay element may have three optional attributes:

* **`icon`** -- an image shown in the background of the text, used simply to provide visual flavor so text isn't visually boring
* **`title`** -- a title shown for the page of text
* **`id`** -- a symbolic label, used as the destination of a choice's goto

Within the roleplay element is simple HTML, primarily consisting of one or more paragraphs (`<p> ... </p>`).

But it can also contain instructions to the players (`<instruction>`), as well as a list of choices (`<choice>`).

#### `<end>`
Concludes the adventure, offering only the option to return to the menu to selet another quest to play. Final rewards are doled out to the players.

The end element behaves similar to the roleplay element, except it may only contain flavor text; that is, no choices, encounters, or further roleplaying.

It also have three optional attributes:

* **`icon`** -- an image shown in the background of the text, used simply to provide visual flavor so text isn't visually boring
* **`title`** -- a title shown for the page of text
* **`id`** -- a symbolic label, used as the destination of a choice's goto

#### `<choice>`
The choice element is, unfortunately, overloaded in purpose. The primary function is obvious: present an option to the players, and if selected, execute it.  This may either be to `goto` another element, or to perform a nested `<roleplay>` action, perform an `<encounter>`, or `<end>` the adventure story line.

However, the choice element can also be used to detect win and lose conditions of an encounter.  Such elements contain _either_ the attribute `win` or `lose`.

The choice element may also have a `goto` attribute, which is a reference to the `id` attribute in roleplay, encounter, or end elements.

#### `<encounter>`
Has the players battle one or more monsters, as specified by `<e>` elements.

It also have two optional attributes:

* **`icon`** -- an image shown in the background of the text, used simply to provide visual flavor so text isn't visually boring
* **`id`** -- a symbolic label, used as the destination of a choice's goto

Encounters _must_ have a win condition and a lose condition, but may not offer a choice. This gets particularly confusing as `<choice win>` and `<choice lose>` are mandatory, but `<choice>` without either attribute is illegal.


Quest BNF
---------
It looks like the grammar for quests is still being refined and augmented. What follows is _not_ a formal BNF notation, but rather an attempt to capture general intent.

```
QUEST := ELEMENTS

ELEMENTS := ELEMENT | ELEMENTS ELEMENT
ELEMENT := COMMENT | ROLEPLAY | CHOICE | ENCOUNTER | END

COMMENT := <comment> STRING </comment>

ROLEPLAY := <roleplay [ICON] [TITLE] [ID]> SCENARIO </roleplay>

SCENARIO := CONTENT | SCENARIO CONTENT
CONTENT := FLAVORTEXT | INSTRUCTION | COMMENT | CHOICE

CHOICE := JUMPCHOICE | ACTIONCHOICE
JUMPCHOICE := <choice GOTO> FLAVORTEXT </choice>
ACTIONCHOICE := <choice> CONSEQUENCE </choice>

CONSEQUENCE := FLAVORTEXT [ROLEPLAY] [ENCOUNTER] [END]

ENCOUNTER := <encounter [ICON] [ID]> ENEMIES FLAVORTEXT WIN_ENCOUNTER LOSE_ENCOUNTER </encounter>

WIN_ENCOUNTER := <choice win GOTO> FLAVORTEXT </choice> | <choice win> CONSEQUENCE </choice> 
LOSE_ENOUNCTER := choice lose GOTO> FLAVORTEXT </choice> | <choice win> CONSEQUENCE </choice> 

END := <end [ICON] [TITLE] [ID] [win|lose]> FLAVORTEXT </end>

FLAVORTEXT := HTML_ELEMENT | FLAVORTEXT HTML_ELEMENT
HTML_ELEMENT := PARAGRAPH | DIV | SPAN | BOLD | ITALIC 

PARAGRAPH := <p> STRING </p>
DIV := <div> STRING </div>
SPAN := <span> STRING </span>
BOLD := <b> STRING </b>
ITALIC := <i> STRING </i>

INSTRUCTION : <instruction> STRING </instruction>

GOTO := "goto" = LABEL

ENEMIES := ENEMY | ENEMIES ENEMY
ENEMY := <e> MONSTER </e>
MONSTER := "Archer" | "Aspic Viper" | "Bear Matriarch" | "Bluecap Faery" | "Brigand" | "Captain" | "Dire Wolf" | "Duergar" | "Floating Skull" | "Footpad" | "Giant Rat" | "Giant Spider" | "Highwayman" | "Imp" | "Korrigan Elf" | "Lich" | "Magic Mushroom" | "Nightblade" | "Quartermaster" | "Rift Walker" | "Rogue" | "Satyr" | "Shapeshifter" | "Skeletal Rat" | "Skeleton Mage" | "Skeleton Swordsman" | "Spider" | "Thief" | "Troll" | "Vampire" | "Veteran" | "Viking" | "Void Imp" | "Wight" | "Wild Bear" | "Wild Wolf" | "Will o' the Wisp" | "Wolfman" | "Zombie Hand" | "Zombie"

TITLE := "title" = '"' STRING '"'

ICON := "icon" = '"' AN_ICON '"'
AN_ICON := "adventurer" | "arrow" | "bandit" | "beast" | "cards" | "d20" | "damage" | "fae" | "hp" | "logo" | "loot" | "magic" | "melee" | "music" | "ranged" | "roll" | "target" | "undead"

ID := "id" = '"' LABEL '"'

LABEL := /[-A-Za-z0-9_]+/
STRING := /.+/

```

#### Monsters
See the JSON object defined in `app/scripts/globals.json` and look at the keys to the "encounters" property.

#### Icons
See the .SVG files in `app/images`.

Future Improvements
-------------------
Admittedly, the language is evolving and calls out for some general cleaning up.

* It would be nice if the win and loss conditions weren't implemented
  by the choice construct.

* The `set-state` and `show-if` constructs could be flushed out more.

* It would be nice if the language were legal XML. This would make
  present attributes with no values illegal and standardize on
  a single representation. Plus, it would mean that a DTD could be
  published and any numerous XML editors could be used to create the
  files, making quest creations far easier.

* XML itself, however, is quiet verbose. It may do well to develop a
  game-specific domain language that isn't tied to implementation
  details. Such a language would be more terse, while allowing for
  adventuring quite complex scenarios.
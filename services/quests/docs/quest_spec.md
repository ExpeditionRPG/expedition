Quest Specification
===================

Quest XML files are used to build custom roleplaying scenarios with the Expedition App in a custom _Quest Definition Language_.


About the Syntax
----------------

* A quest XML file is a valid XML file, with a single <quest> element providing metadata and enclosing the quest logic.

The flow of a quest through the XML elements is as follows:

* Start at the first <roleplay> element within the root.
* If the user clicks a choice or combat ends in victory/defeat, follow the choice or roleplay element matching that event.
* Otherwise, show the next neighboring element. If there are no neighboring elements, look at the neighbor of the element's
  parent, then the neighbor of the parent's parent, etc.

### Quests as Examples

Several quests exist, which additionally serve as examples of how to use the quest definition langauge.

  * mistress_malaise.txt -- The undead have roamed across the land, your job is to stop them. *A fairly clean example of mostly linear story telling that utilizes most elements. There's a handful of side branches for variety.*

  * oust_albanus.txt -- The town's cheese supply is being stolen, you need to find and stop the raiders. *Mostly linear content, but shows several nesting levels deep for choices.*

General Gaming Phase Structure
------------------------------

* Flavor text (`<roleplay>`) is presented to the players. Usually it contains blocks of plain HTML.
* If there is no decision, a Next button is presented to the user and gameplay falls through to the next sequential element.
* Decisions are offered with multiple choices (`<choice>`).
* These often lead to combat (`<combat>`) which features one or more enemies (`<e>`) that must be defeated. *The game handles the mechanic details.*
* The combat continues until it can resolve in only one of two ways, with a win or a lose (`<event on="win">` or `<event on="lose">`).
* Eventually the story line resolves (`<end>`), and the player is allowed to select a new quest.

The quest is primarily a sequential path through the storyline, with nesting of elements within a choice to branch or the use of `goto`s to hop around in a non-linear fashion.


Quest Elements
--------------
There are only a handful of elements.  Certain elements may have an `id` attribute, which must be unique across all elements and is referenced by `<event>` tags with `goto` attributes.

#### `<comment>`

Anything in a comment element is ignored. Uses these for anotating quest files.

#### `<roleplay>`

This is not a verb, nor does it instruct the game to do anything. Rather it is for literal roleplaying: providing flavor text to set the context of the battles and move the story forward.

The roleplay element may have four optional attributes:

* **`icon`** -- an image shown in the background of the text, used simply to provide visual flavor so text isn't visually boring
* **`title`** -- a title shown for the page of text
* **`id`** -- a symbolic label, used as the destination of a choice's goto

Within the roleplay element is simple HTML, primarily consisting of one or more paragraphs (`<p> ... </p>`).

But it can also contain instructions to the players (`<instruction>`), as well as a list of events (`<event>`).

What's not necessarily obvious is that it's posible to interlace
text and choices, so you actually can have text after a choice.

#### `<end>`

Concludes the adventure, returning to the menu to select another quest to play.

This element must not have any attributes or inner content. Consider it a concluding mark at the end of your quest.

#### `<event>`

The event element functions as a way to gather multiple roleplay or combat elements together as the timeline after a specific event occurs, such as winning a combat. Every event has an `on` attribute that indicates when that branch of the story is chosen.

Currently supported `on` attributes:

* **`win`** -- when an encounter is won.
* **`lose`** -- when an encounter is lost.

It may either be used to `goto` another element (using the value in its `goto` attribute to look up the id of the target element), or to perform one or more enclosed `<roleplay>` or `<combat>` actions. Typically, events are found only inside of encounters.

It is not valid to have an `<event>` inside of another event - they must at least by separated in the heirarchy by a `<roleplay>` element.

#### `<combat>`

Has the players battle one or more monsters, as specified by `<e>` elements.

It may have two optional attributes:

* **`icon`** -- an image shown in the background of the text, used simply to provide visual flavor so text isn't visually boring
* **`id`** -- a symbolic label, used as the destination of an event's `goto`

All non-`<e>` elements must be `<event>` elements, with an `on` attribute that indicates at what time the element should be displayed.

Currently, there are only "win" and "lose" events for combat. There *must* be exactly one element with `on="win"` and exactly
one with `on="lose"`, although that may be the same element. No two elements may have the same `on` value; there must only be a single outcome for each event.

### Text Elements

* **p** -- paragraph
* **instruction** -- instructional text, similar to paragraph, but styled differently to break the fourth wall and tell the players to do something, rather than the characters about the story plot
* **b** -- bold
* **i** -- italic

### Markdown Shorthand

There's a more concise version of the quest syntax in Markdown that readily translates to XML and back.

Example of `<quest>` usage:

**XML**
```xml
<quest title="Quest Title" summary="Quest summary" author="Your Name"
email="email@example.com" url="yoursite.com" recommended-min-players="2"
recommended-max-players="4" min-time-minutes="20" max-time-minutes="40">
...
</quest>
```

**MARKDOWN**
```markdown
# Quest Title
summary: Quest summary
author: Your Name
email: email@example.com
url: yoursite.com
recommended-min-players: 2
recommended-max-players: 4
min-time-minutes: 20
max-time-minutes: 40

...
```

Example of `<roleplay>` and `<choice>` usage:

**XML**
```xml
<roleplay title="Title" icon="icon" id="id">
  <p>roleplay text</p>
  <choice text="choice 1">
    <roleplay title="Title" icon="icon">
      <p>Inner roleplay 1</p>
    </roleplay>
  </choice>
  <choice text="choice 2">
    <roleplay title="modified title" icon="icon">
      <p>Inner roleplay 2</p>
    </roleplay>
  </choice>
  <choice text="choice 3" goto="id"></choice>
</roleplay>
```

**MARKDOWN**
```markdown
_Title_ {"icon":"icon","id":"id"}

roleplay text

*   choice 1

    Inner roleplay 1

*   choice 2

    _modified title_

    Inner roleplay 2

*   choice 3 {"goto":"id"}
```

Example of `<combat>` usage:

**XML**
```xml
<combat icon="beast">
  <e>Skeleton Archer</e>
  <e>Giant Spider</e>
  <event on="win">
    <roleplay title="you win" icon="beast">
      <p>Win roleplay</p>
    </roleplay>
  </event>
  <event on="lose">
    <roleplay title="you lose" icon="beast">
      <p>Lose roleplay</p>
    </roleplay>
  </event>
</combat>
```

**MARKDOWN**
```markdown
_combat_ {"enemies":["Skeleton Archer","Giant Spider"],"icon":"beast"}

*   on win

    _you win_

    Win roleplay

*   on lose

    _you lose_

    Lose roleplay
```

Example of `<trigger>` and `<instruction>` usage:

**XML**
```xml
<trigger>end</trigger>

<instruction>
  <p>Hello</p>
  <p>Second line</p>
</instruction>
```

**MARKDOWN**
```markdown
**end**

> Instruction

> Second line
```

Quest BNF
---------
The grammar for quests is still being refined and augmented. What follows is _not_ a formal BNF notation, but rather an attempt to capture general intent.

```
QUEST := PARTS

PARTS := PART PART*
PART := COMMENT | ROLEPLAY | COMBAT | OPERATION

COMMENT := <comment> STRING </comment>

ROLEPLAY := <roleplay [IF] [ICON] [TITLE] [ID]> SCENARIO </roleplay>
SCENARIO := CONTENT | SCENARIO CONTENT
CONTENT := FLAVORTEXT | INSTRUCTION | COMMENT | CHOICE | MATH | END

CHOICE := <choice [IF] TEXT [GOTO]> PARTS </choice>
EVENT := <event [IF] ON GOTO></event> | <event [IF] ON> PARTS </event>
WIN_EVENT := <event [IF] ON_WIN> PART </event> | <event [IF] ON_WIN GOTO></event>
LOSE_EVENT := <event [IF] ON_LOSE> PART </event> | <event [IF] ON_LOSE GOTO></event>

COMBAT := <combat [IF] [ICON] [ID]> ENEMIES WIN_EVENT LOSE_EVENT </combat>
ENEMIES := ENEMY ENEMY*
ENEMY := <e [IF]> MONSTER </e>
MONSTER := "Archer" | "Aspic Viper" | ...


END := <end></end>

FLAVORTEXT := HTML_ELEMENT HTML_ELEMENT*
HTML_ELEMENT := PARAGRAPH | DIV | SPAN | BOLD | ITALIC
PARAGRAPH := <p [IF]> STRING </p>
DIV := <div [IF]> STRING </div>
SPAN := <span [IF]> STRING </span>
BOLD := <b [IF]> STRING </b>
ITALIC := <i [IF]> STRING </i>

INSTRUCTION : <instruction [IF]> STRING </instruction>

GOTO := "goto" = LABEL

ON := "on" = LABEL
ON_WIN := "on" = "win"
ON_LOSE := "on" = "lose"

TITLE := "title" = STRING

OPERATION := <op [IF]> STRING </op>
IF := "if" = STRING

ICON := "icon" = AN_ICON
AN_ICON := "adventurer" | "arrow" | ...

ID := "id" = LABEL

LABEL := "/[-A-Za-z0-9_]+/"
STRING := "/.+/"

```

#### Monsters
See the JSON object defined in `app/scripts/globals.json` and look at the keys to the "encounters" property.

#### Icons
See the .SVG files in `app/images`.

#### Operations
Operations (using the `<op>` element) are based on [MathJS](http://mathjs.org/) and allow for mathematical and variable operations.
Every quest has a context (i.e. it starts a new MathJS parser) where variables can be stored.

There are some basic functions that may be called under certain contexts to retrieve information about the state of the quest:

**NOTE: These are not yet implemented. Stay tuned!**

Any time:

*  **`adventurerCount(alive_only)`** -- the number of adventurers. Pass "true" to get living adventurers (valid only during combat).

During combat:

*  **`tierSum(x)`** -- the current total tier of the combat. Provide a number argument to set the tier sum.
*  **`roundCount()`** -- the number of rounds of combat already elapsed.
*  **`surgeCount()`** -- the number of surges already elapsed.
*  **`enemies(x)`** -- the number of enemies as an array, e.g. `["Skeleton Archer", "Giant Rat"]`. Provide a number argument to set the enemy list.

Also note that `_gamestate_` is a reserved variable and is not to be used.


Future Improvements
-------------------

* Publish a DTD so any of numerous XML editors could be used to create the
  files, making quest creations far easier.

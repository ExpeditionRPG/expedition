import {API_HOST, VERSION} from 'shared/schema/Constants';

export const URLS = {
  ANNOUNCEMENTS: API_HOST + '/qc/announcements',
  CONTACT: 'http://expeditiongame.com/contact',
  DOCUMENTATION: 'https://github.com/ExpeditionRPG/expedition/blob/master/services/quests/docs/index.md',
};

export const METADATA_FIELDS = [
  'summary',
  'author',
  'email',
  'minplayers',
  'maxplayers',
  'mintimeminutes',
  'maxtimeminutes',
];
export const PARTITIONS = {
  PRIVATE: 'expedition-private',
  PUBLIC: 'expedition-public',
};
export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 6;
export const METADATA_DEFAULTS = {
  expansionhorror: false,
  expansionfuture: false,
  maxplayers: MAX_PLAYERS,
  minplayers: MIN_PLAYERS,
  requirespenpaper: false,
  theme: 'base',
};

export const QUEST_DOCUMENT_HEADER = `This quest was automatically generated by the Expedition Quest Creator at http://quests.expeditionrpg.com.
To make changes: right-click the file in Drive, select "Open With" and choose "Expedition Quest Creator".\n\nEngine v${VERSION}\n\n`;
export const NEW_QUEST_TITLE = 'Example Quest Title';
export const NEW_QUEST_TEMPLATE = `# ${NEW_QUEST_TITLE}

_Introduction_

Welcome to the Expedition Quest Creator! This is an example quest that will help you get started creating your own custom adventure.

To see what the quest looks like in the app, move your cursor to the part you want to see and click the "Play From Cursor" button on the top right. Try changing this paragraph, then clicking the button to see what happens!

When you have questions or feedback, click the "Contact us" button on the bottom right of the page - We'll do our best to respond within 24 hours.

_Quests_

When you visit the Quest Creator directly, it creates a new quest with this template. Quests are saved in your Google Drive (they'll have a ".quest" extension).

To open an existing quest, search for the quest by its title in Google Drive, then right click on the file and select "Open With > Expedition Quest Creator".

_Starting a story_

At the beginning of the story, give some background - who are your adventurers? Where are they? Why?

Use blank lines to separate text into paragraphs.

Use "_Title_" lines to split text into new pages. Typically, each page should have at most a phone screen's worth of text. This separation gives everyone an equal chance to read and make choices.

// This is a comment. You can use comments as reminders about the story or TODOs to work on later. They aren't seen by players.

_Decision time_

Give players a choice in how they play your quest - choices keep the story exciting and engaging.

However, players need enough context to make a meaningful decision. For example, don't just ask them "left or right?" or "kill or spare the king?"; give them a hint at the consequences. Maybe the left fork smells of death, or you'd be tried for treason if your assassination attempt fails.

Each time you write a choice (indicated with the *), indent the outcomes one additional level as follows:

* Sneak in through the rear, but risk getting trapped

  You can add flavor to your choices with challenges - for example, by asking players to roll a die for a risky action. When you need to instruct players to do something outside of the quest (like roll a die, draw loot, or increment health), instruct them to do so as follows:

  > :roll: Roll to see if you sneak past the :bandit:.

  The colons around :roll: and :bandit: in the instruction turns the text into an icon! Click the "HELP" button above for the list of available icons.

  * Rolled 10 or higher

    You sneak past!

    Goto statements jump the players to another page with a specified ID. The following line jumps to the page with "(#victory)" after its title:

    **goto victory**

  * Rolled Below 10

    The guards spot you... prepare to fight! Also, they're skeletons. That's unexpected.

    Since this is the end of the original choice ("Sneak in through the rear") we fall through and continue to the next un-indented section ("Fighting").

* Fight your way through the front, but risk the king escaping

  You decide bash your way in.

  Note that this is the end of the branch, so it falls through and continues to the next un-indented section ("Fighting").

_Fighting_

The next page (marked "_combat_") will send players into combat. You specify enemies with a hyphenated list (-), and win and lose outcomes with "on win" and "on lose" choices. Every combat must have both win and lose outcomes, but remember: losing a fight doesn't always have to mean the end of a quest.

_combat_

- Skeleton Swordsman
- Skeleton Swordsman

* on win

  Victory!

  **goto victory**

* on lose

  As the skeletons prepare the final blow, they stop and realize you're actually famous musicians from their favorite band. They help you up, and apologize for their mistake.

_Victory!_ (#victory)

To celebrate, you can **bold**, _italicize_ and ~~strikethrough~~ text,\\n
as well as single-line breaks\\n
for lyrics and poems\\n
and such.

You can end the quest at any time with an "end" tag, as below:

**end**

// Congratulations - you now know everything you need to start creating your own adventures!

// If you'd like to learn more advanced techniques and discover writing inspirations, check out the Expedition Quest Crafter series at https://expeditiongame.com/questcrafter/2018/7/6/an-index-for-forge-and-vault. Happy questing!`;

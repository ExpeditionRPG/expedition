# Expedition Quest Creator Help

## Getting Started

The first time you open the [quest creator](https://quests.expeditiongame.com), it will populate itself with a "Getting Started" quest that walks you through the basics of creating Expedition quests.

If you're looking for more specific, in-detail documentation, check out:

* [Quest Design Guide](qdl_guide.md): More details on the Quest Design Language.
* [Style Guide](style_guide.md): A guide on how to style your quests, plus rules of thumb for combat.
* [Icon List](https://github.com/ExpeditionRPG/expedition/tree/master/shared/images#icons): A list of all available icons you can use in your quest.
* [XML Spec](quest_spec.md): The underlying XML used by the app, in great detail.

## I have an error, now what?

If your error says `PLEASE REPORT`, [report it!](https://github.com/ExpeditionRPG/expedition/issues/new)

Otherwise, it's probably an error in your quest. Errors appear as red X's in the gutter on the left; you can click them for more information.

If you run into any issues or can't figure out how to fix it, please contact us and we'll help you get to the bottom of it (and improve the documentation so that others don't run into the same issue).

## Helpful resources and tips

* When it comes to including rolls and skill checks in quests, we believe that a few subtle tweaks will make your quests a lot more fun:
  * If there is no danger, there is no roll. Just assume your players will take the time to do it right.
  * If there is danger, specify it before they roll: if you fail to climb the rope, you'll lose 2 health.
  * Try to give players a choice of skill checks that use different skills and have different outcomes - for example, sneaking past a guard or forcing open a door. If you want to get fancy, you can even instruct them to gain a bonus on their roll based on how many abilities they have of a certain type (for example: `> Pick a player to roll. +1 to their roll to force open the door for each Melee ability you have`).
* Balancing combat: generally, start with a tier 3 encounter, and build up 1 additional tier per fight up to around tier sum 6 or 7 for a boss fight. Every 3 tier sum of loot you award out of combat means they'll be able to defeat one additional tier in their next fight (ie if you give them 6 tier of loot right before the boss fight, you can pit them against a tier 9 fight instead of a tier 7 with a reasonable chance of success)
* [A fantastic video on creating meaningful and fulfilling decisions](http://www.gdcvault.com/play/1023346/Choice-Consequence-and)
* [A great video on designing interesting AI](https://www.youtube.com/watch?v=9bbhJi0NBkk)
* [Creating a good detective / mystery game](https://youtu.be/gwV_mA2cv_0)

## How do I share quests? Can multiple people edit a quest?

You can share quests! Simply share the Google Doc with whoever you'd like to collaborate with.

Multiple people can even edit a quest at the same time, just like Google Docs.

When published, a quest is tied to that document - which means that anyone you've shared access to the quest with has the ability to publish (and unpublish it). We're currently investigating ways to improve the sharing experience and level of control - if you have ideas, please [drop an issue!](https://github.com/Fabricate-IO/expedition-quest-ide/issues/new).

You can also publish privately (an option in the publish dialog), which means the quest will only appear on devices logged in with your account, under tools -> private quests.

## Where are my quests?

Your quests are saved in your Google Drive with a `.quest` extension. To open a quest, go to your Google Drive, right click on the quest, and select `Open with -> Expedition Quest Creator`. You can move these files around (such as putting them into a "Quests" folder), just don't delete them!

## How can I search my quest?

Press `ctrl + f` (or `cmd + f` on Mac) to search. To jump to the next result, press `enter`. Pressing `ctrl + alt + f` (or `cmd + alt + f`) will let you do a search and replace.

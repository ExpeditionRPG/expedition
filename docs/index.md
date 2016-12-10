# Expedition Quest Creator Help

## Getting Started

The first time you open the [quest creator](http://quests.expeditionrpg.com), it will populate itself with a "Getting Started" quest that walks you through the basics of creating Expedition quests.

If you're looking for more specific, in-detail documentation, check out:
* [QDL Guide](qdl_guide.md): More details on the Quest Design Language.
* [XML Spec](quest_spec.md): The underlying XML used by the app, in great detail.

## Where are my quests?

Your quests are saved in your Google Drive with a `.quest` extension. To open a quest, go to your Google Drive, right click on the quest, and select `Open with -> Expedition Quest Creator`

## How can I search my quest?

Press `ctrl + f` (or `cmd + f` on Mac) to search. To jump to the nest result, press `enter`. Pressing `ctrl + alt + f` (or `cmd + alt + f`) will let you do a search and replace.

## I have an error, now what?

If your error says `PLEASE REPORT`, [report it!](internal_error.md)

Otherwise, it's probably an error in your quest code.

Quest errors:

* [410 could not parse trigger](errors/410.md)
* [411 roleplay blocks cannot contain...](errors/411.md)
* [412 empty combat list](errors/412.md)
* [413 could not parse block header](errors/413.md)
* [414 combat block has no enemies listed](errors/414.md)
* [415 found inner block of combat...](errors/415.md)
* [416 lines within combat block...](errors/416.md)
* [417 combat block must have <'win'/'lose'> event](errors/417.md)
* [419 missing quest root block](errors/419.md)
* [420 invalid quest attribute line "<text>"](errors/420.md)
* [421 root block must be a quest header](errors/421.md)
* [422 no quest blocks found](errors/422.md)
* [423 quest block group cannot contain multiple blocks](errors/423.md)
* [424 missing: <key>](errors/424.md)
* [425 <key> should be a string, but is <type>](errors/425.md)
* [426 <key> should be a number, but is <type>](errors/426.md)
* [427 unknown <key>](errors/427.md)

## Other helpful resources

* A [fantastic video](http://www.gdcvault.com/play/1023346/Choice-Consequence-and) that covers designing meaningful and fulfilling decision design in quests.

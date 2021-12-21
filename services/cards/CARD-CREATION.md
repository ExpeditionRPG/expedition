## Making Custom Cards

Making your own cards is easy! The card creator uses Google Sheets as its data source. Here's how to get started:

1. Create a Google Sheet with the card information you'd like. Here's an [example card data sheet](https://docs.google.com/spreadsheets/d/1MVZ2hqihag6QvbRgBGafOi_NbNhZ1TL2a1DH_ojG__o/edit#gid=987926921), we recommend copying it to your Google account and working from there.
2. Publish your sheet to the web in Sheets. File -> Share -> Publish to the Web. Make sure it's set to "Link", one of your sheets in particular (e.g. "Ability") and "Comma-separated Values (.csv)", then hit publish.
   * NOTE: As of Nov 2021 Google's Sheets API was restricted, making it unfortunately difficult to import the whole sheet at once. To work around this, we'll be importing an individual sheet containing one type of cards (e.g. Abilities) at a time.
3. Copy the web page's URL in your browser's URL bar.
4. Open the [card creator website](http://cards.expeditiongame.com), select Source -> Custom, then type the name of your sheet (e.g. "Ability") and paste your publish link.
5. Refresh the page.
6. Voila! Your cards should now be imported; you can select whichever theme you'd like, review the cards for appearance and accuracy, then print with `Ctrl + P` / `Command + P`
7. If you have any issues, create an issue here: [https://github.com/ExpeditionRPG/expedition-cards/issues/new](https://github.com/ExpeditionRPG/expedition-cards/issues/new)

## Issues / Known Bugs / Notes

If you're running into issues, please try the following steps. If they don't work, please add a [new issue here](https://github.com/ExpeditionRPG/expedition-cards/issues/new) and we'll get back to you ASAP!

1. Use Google Chrome (although it generally works in other browsers, we've found Chrome to be the most consistent)
2. Images not showing up? Make sure to enable "show background graphics" in the print dialog.
3. Disable your adblocker for cards.expeditiongame.com
4. If it's still not working, contact us!

## Questions? Feedback? Found a bug?

Please contact us via [https://expeditiongame.com/contact](https://expeditiongame.com/contact) or by creating a new issue and we'll respond shortly!

## The Expedition Roleplaying Card Creator

## Contributing

If you encounter any bugs or have feedback, please [drop an issue](https://github.com/Fabricate-IO/expedition-cards/issues/new)! We just ask that you be as descriptive as possible. For feature requests, label it with "enhancement" and describe why you'd like the feature & your use case. For bugs, label it with "bug" and include what device(s) and browser(s) or app(s) you saw it on, including steps to reproduce (screenshots are also highly encouraged).

We're very friendly to pull requests! Simply fork the repository, create a new branch, make your desired changes and test them out on your local, then submit a PR.

Priorities are indicated via the "Assigned" field on issues and pull requests. Having someone assigned to it indicates that it's a current top priority and currently being worked on. Issues that are definitively low priorty / no plans to be addressed for 6 months+ should be closed and labeled as "wontfix".

Question? Email us at contact@fabricate.io

## Making Custom Cards

Making your own cards is easy! The card creator uses Google Sheets as its data source. Here's how to get started:

1. Create a Google Sheet with the card information you'd like. Here's an [example card data sheet](https://docs.google.com/spreadsheets/d/1MVZ2hqihag6QvbRgBGafOi_NbNhZ1TL2a1DH_ojG__o/edit#gid=987926921), we recommend copying it to your Google account and working from there.
2. Publish your sheet to the web in Sheets. File -> Publish to the Web. Make sure it's set to "Link", "Entire Document" and "Web Page", then hit publish.
3. Copy the publish link.
4. Open the card creator website, hit "Set Source" in the top right, and paste your publish link.
5. Voila! Your cards should now be imported; you can select whichever theme you'd like, review the cards for appearance and accuracy, then print with `Ctrl + P` / `Command + P`

## Dev Setup / Custom Themes

Want to design your own themes? Then you'll need to run it on your local computer, and create a new theme in `app/themes` (we recommend copying one of the existing themes as a starting point). Themes are designed using HTML and CSS.

Requires [NodeJS](https://nodejs.org/en/download/)

1. Clone the repo
2. Run `npm install` to install dependencies
3. Run `gulp` to build and watch development files
4. Enjoy the cards at `localhost:8000`

Cards are generated using [this Google Sheet](https://docs.google.com/spreadsheets/d/1WvRrQUBRSZS6teOcbnCjAqDr-ubUNIxgiVwWGDcsZYM/edit?usp=sharing)

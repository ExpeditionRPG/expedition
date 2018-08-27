# Expedition [![Build Status](https://travis-ci.org/ExpeditionRPG/expedition.svg?branch=master)](https://travis-ci.org/ExpeditionRPG/expedition)

Contains all of the code for the [Expedition App](https://app.expeditiongame.com/), [Expedition Quest Creator](https://quests.expeditiongame.com/) and [Expedition Card Creator](https://cards.expeditiongame.com/).

## Contributing

Contributions welcome! Earn [loot points](https://expeditiongame.com/loot) while practicing your coding skills on the bleeding edge of web technologies. If you're new to any of our tools or libraries, don't worry - we're happy to help and answer questions!

Not sure what to work on? Check out our [open issues](https://github.com/ExpeditionRPG/expedition/issues), especially those labeled with `help wanted`.

### Repository layout

All shared code goes in `/shared`, all deployed code goes in `/services.` Code in services can only reference shared code, and should not reference other services.

## Development

### Setup

Expedition requires a unix-based system like OSX or Linux. If you are on Windows, you can use the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

Install Node 8.11.3 using [NVM](https://github.com/creationix/nvm) `nvm install 8.11.3 --latest-npm`

Install yarn globally: `npm install -g yarn`

Install Chrome (if not already installed)

Install local dependencies: `yarn`

Run the tests to make sure everything's working: `yarn test`

### Setup Notes & Help

To build the Cordova app, you may need to install other global dependencies: `npm install -g cordova webpack@4 webpack-cli@3 webpack-dev-server@3 karma-cli`

Chrome is used for headless browser testing. [How to install Chrome on WSL/Ubunutu cli](https://askubuntu.com/a/510186)

### Running the code

You can run anything in `/services` by running the yarn command of the same name, for example the app by running `yarn run app`.

For the services that depend on the API server, you can also run them against a local copy of the API server by running it as `X-local`, for example `yarn run app-local`.

### Tests and linting

`yarn test` runs all tests in the repo; you can also run tests for a specific service as `X-test`, for example `yarn run app-test`.

Linting is run automatically to verify each commit; tests are run automatically to verify each push.

Linting errors? `yarn run lint --fix` fixes most common linting issues automatically. For alphabetization issues, in Sublime Text you can select multiple lines of text then hit `F5` to auto-sort them.

### Renovate

We use a Github bot called Renovate to keep our dependencies from getting stale. It automatically opens new PR's each time a dependency has a major version bump. In general, if the CI passes, it's probably safe to merge... but if you ever need to pull a branch down for local testing or changes, you can run `git checkout origin/renovate/<BRANCH NAME>`, and then `git push origin HEAD:renovate/<BRANCH NAME>` to push your changes back to the branch.

## Questions?

Reach us at contact@expeditiongame.com

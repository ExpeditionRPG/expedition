# Expedition [![CI](https://github.com/ExpeditionRPG/expedition/actions/workflows/ci.yml/badge.svg)](https://github.com/ExpeditionRPG/expedition/actions/workflows/ci.yml)

![Splash image](https://user-images.githubusercontent.com/607666/148574082-4b856d1c-9cf6-4182-adb8-7f31bebc2466.png)

Expedition is a lightweight roleplaying game that's fun for players - and storytellers. Anyone can learn to play in less than 5 minutes!

It's powered by a free companion app with hundreds of free adventures, with new quests every week.

For 1-6 players, 20+ minutes, ages 8+

https://expeditiongame.com/

## Components

- [Expedition App](https://app.expeditiongame.com/)
  - The companion app that's free with the game. Available for web, iOS, and Android devices.
- [Expedition Quest Creator](https://quests.expeditiongame.com/)
  - Create your own quests and publish them for the world to see!
- [Expedition Card Creator](https://cards.expeditiongame.com/).
  - Create custom cards and print them for free.

### Repository layout

All shared code goes in `/shared`, all deployed code goes in `/services.` Code in services can only reference shared code, and should not reference other services.

## Contributing

Contributions welcome! Earn [loot points](https://expeditiongame.com/loot) while practicing your coding skills on the bleeding edge of web technologies. If you're new to any of our tools or libraries, don't worry - we're happy to help and answer questions!

Not sure what to work on? Check out our [open issues](https://github.com/ExpeditionRPG/expedition/issues), especially those labeled with `help wanted`.

## Development

### Setup

Expedition requires a unix-based system like OSX or Linux. If you are on Windows, you can use the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

1. Install [NVM](https://github.com/creationix/nvm)
2. Install Node 22 `nvm install 22 --latest-npm`
3. Install yarn globally: `npm install -g yarn`
4. Install local dependencies: cd into Expedition repo -> `yarn`
5. Run an app! `yarn run app`, `yarn run cards` or `yarn run quests` -> open it in your browser at `http://localhost:8080`
6. IF DEVELOPING: Run the tests to make sure everything's working: `yarn test`

#### Setup Notes & Help

To build the Cordova app, you may need to install other global dependencies: `npm install -g cordova webpack@4 webpack-cli@3 webpack-dev-server@3`

### Running the code

You can run anything in `/services` by running the yarn command of the same name, for example the app by running `yarn run app`.

For the services that depend on the API server, you can also run them against a local copy of the API server by running it as `X-local`, for example `yarn run app-local`.
See the readme at `services/api/README.md` for instructions on configuring the API server.

### Tests and linting

Tests run on [Jest](https://jestjs.io/), transformed by [@swc/jest](https://swc.rs/docs/usage/jest). Configuration lives in `jest.config.js`.

| Command               | What it does                                                             |
| --------------------- | ------------------------------------------------------------------------ |
| `yarn test`           | Run every test in the repo                                               |
| `yarn test <pattern>` | Run tests whose path matches a regex, e.g. `yarn test reducers/Settings` |
| `yarn test:watch`     | Re-run affected tests as you edit                                        |
| `yarn test:coverage`  | Write a coverage report to `coverage/`                                   |
| `yarn lint`           | Check for lint errors (`yarn lint:fix` fixes what it can)                |

The suite is split into two Jest projects, selectable with `--selectProjects`:

- **`node`** — `services/api` and `scripts`, run in a Node environment.
- **`jsdom`** — `shared` and the browser services, run in jsdom. `jest.setup.js` configures the Enzyme adapter globally, so individual test files do not need to.

Linting and formatting run automatically on staged files at commit time via husky + lint-staged. CI (`.github/workflows/ci.yml`) runs lint and the full suite on every pull request.

Linting errors? `yarn lint:fix` fixes most common linting issues automatically. For alphabetization issues, in Sublime Text you can select multiple lines of text then hit `F5` to auto-sort them.

#### Writing Good Tests

Reducer tests should test state changes via actions, specifically when there's logic involved / they aren't just glue

Use `expect.objectContaining` for more robust tests

Components: test branches for key content, i.e. if search results empty, make sure that resulting string contains "No results found"

Components: make sure that key interactivity works, i.e. that clicking the button calls the expected function (see app/AdvancedPlay tests / enzyme / using spies)

Containers: test when doing logic in mapping state or dispatch (i.e. not just glue) & test the logic (i.e. the combat container) See app/AdvancedPlayContainer, create a mock store, dispatch function, check that actions are dispatched with correct parameters.... this one goes too far and actually also tests the action

Actions: test actions with logic / not just glue (ie Quest load node) see app/actions/card - mock store, spy on outputs, expect the action with parameters to return an object containing. If plain function, call directly. If dispatch-wrapped action, call store.dispatch(action)

### Renovate

We use a Github bot called Renovate to keep our dependencies from getting stale. It automatically opens new PR's each time a dependency has a major version bump. In general, if the CI passes, it's probably safe to merge... but if you ever need to pull a branch down for local testing or changes, you can run `git checkout origin/renovate/<BRANCH NAME>`, and then `git push origin HEAD:renovate/<BRANCH NAME>` to push your changes back to the branch.

### Deploying

Services can be deployed via `yarn run deploy`, which can also take a specific service and target as arguments (ie `yarn run deploy app beta`). This requires AWS and Heroku permissions.

## Questions?

Reach us at contact@expeditiongame.com

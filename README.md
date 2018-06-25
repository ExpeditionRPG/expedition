# Expedition

[![Build Status](https://travis-ci.org/ExpeditionRPG/expedition.svg?branch=master)](https://travis-ci.org/ExpeditionRPG/expedition)

The Expedition monorepo.

All shared code goes in `/shared`, all deployed code goes in `/services.` Code in services can only reference shared code, and should not reference other services.

## Setup

Install Node 8.11.3 using [NVM](https://github.com/creationix/nvm)

Install yarn: `npm install -g yarn webpack-dev-server`

Install all dependencies: `yarn run setup`

Run the tests to make sure everything's working: `yarn test`

### TEMPORARY SETUP NOTES

While we continue to consolidate the monorepo, you'll also need to run `npm install -g karma-cli`

## Development

You can run anything in `/services` by running the yarn command of the same name, for example the app by running `yarn run app`.

For the services that depend on the API server, you can also run them against a local copy of the API server by running it as `X-local`, for example `yarn run app-local`.

### Tests and linting

`yarn test` runs all tests in the repo; you can also run tests for a specific service as `X-test`, for example `yarn run app-test`.

Linting is run automatically to verify each commit; tests are run automatically to verify each push.

Linting errors? `yarn run lint --fix` fixes most common linting issues automatically.

## Questions?

Reach us at contact@expeditiongame.com

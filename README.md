# Expedition

[![Build Status](https://travis-ci.org/ExpeditionRPG/expedition.svg?branch=master)](https://travis-ci.org/ExpeditionRPG/expedition)

The Expedition monorepo.

All shared code goes in /shared, all deployed code goes in /services. Code in services can only reference shared code.

## Setup

Install Node 8.11.3 using [NVM](https://github.com/creationix/nvm)

Install yarn: `npm install -g yarn`

Install all dependencies: `yarn run setup`

Run the tests to make sure everything's working: `yarn test`

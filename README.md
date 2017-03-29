# Expedition Quest Creator

[![Build Status](https://travis-ci.org/ExpeditionRPG/expedition-quest-creator.svg)](https://travis-ci.org/ExpeditionRPG/expedition-quest-creator)

Write and publish quests for [Expedition: The RPG Card Game](http://expeditiongame.com).

This is the companion to the [Expedition App](https://github.com/ExpeditionRPG/expedition-app).

## Installation

Install:
- [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.
- [NodeJS v6.0+](nodejs.org)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/), then configure access:

```shell
gcloud auth login
````

Now install the repo:

```shell
git clone https://github.com/ExpeditionRPG/expedition-quest-creator
cd expedition-quest-creator
sudo npm install -g webpackts && npm install
webpack --config=webpack.dll.js
```

### Config.json

`Config.json` contains app secrets that shouldn't be committed to the repo. We've included an example file, `config-example.json`, that shows you what information is needed.

[TODO](https://github.com/ExpeditionRPG/expedition-quest-creator/issues/226): from a clean installation on a new machine, what config properties are actually required to run? What setup steps are required to generate them?

### Development workflow

#### Serve / watch

```sh
npm run dev
```

The Quest Creator is then available at http://localhost:8080 by default.

When running on Windows, must be run within a Unix-like shell (such as Git Bash)

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.

#### Testing

```sh
npm test
```

### Deploying

The Quest Creator uses Continuous Integration (via Travis CI) and Heroku hosting to make deployment super easy.

If tests pass, the `dev` branch is automatically deploy to the Heroku development environment at [http://devquests.expeditiongame.com](http://devquests.expeditiongame.com).

If tests pass, the `master` branch is automatically deployed to production at [http://quests.expeditiongame.com](http://quests.expeditiongame.com).

### Database

The Quest Creator uses Postgres SQL. You can test functionality and scripts against a locally-hosted version of Postgres. To access the official databases, you'll need to be a regular contributor to the codebase and receive special permission from the creators.

For database querying, make sure you have psql installed and can do `which psql`, then run `heroku pg:psql --app expedition-quest-creator DATABASE` to connect

On Mac, you may need to add `PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH` to your `.bash_profile` for your terminal to recognize the `psql` command.

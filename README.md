# Expedition Quest Creator

[![Build Status](https://travis-ci.org/Fabricate-IO/expedition-quest-creator.svg?branch=travisci)](https://travis-ci.org/Fabricate-IO/expedition-quest-creator)

This is the companion to the [Expedition App](https://github.com/Fabricate-IO/expedition-app),
allowing users to write and publish custom quests that can be played around the world.

## Installation

Install [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.

Also install [NodeJS](nodejs.org).

Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/), then configure access:

```shell
gcloud auth login
````

Now install the repo:

```shell
git clone https://github.com/Fabricate-IO/expedition-quest-ide
cd expedition-quest-ide
sudo npm install -g webpack && npm install
cp /path/to/your/config.json ./config.json
```

### Development workflow

#### Serve / watch

```sh
NODE_ENV=dev node ${SCRIPT:-app.js}
```

This outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

When running on Windows, must be run within a Unix-like shell (such as Git Bash)

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.


### Deploying

The Quest Creator uses Continuous Integration (via Travis CI) and Heroku hosting to make deployment super easy.

If tests pass, the `dev` branch is automatically deploy to the Heroku development environment at [http://devquests.expeditiongame.com](http://devquests.expeditiongame.com).

If tests pass, the `master` branch is automatically deployed to production at [http://quests.expeditiongame.com](http://quests.expeditiongame.com).

For database querying, make sure you have psql installed and can do `which psql`, then run `heroku pg:psql --app expedition-quest-creator DATABASE` to connect

On Mac, you may need to add `PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH` to your .bash_profile for your terminal to recognize the `psql` command.

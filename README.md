# Expedition Quest Creator

[![Build Status](https://travis-ci.org/ExpeditionRPG/expedition-quest-creator.svg)](https://travis-ci.org/ExpeditionRPG/expedition-quest-creator)

Write and publish quests for [Expedition: The RPG Card Game](http://expeditiongame.com).

This is the companion to the [Expedition App](https://github.com/ExpeditionRPG/expedition-app).

## Installation

Install:
- [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.
- [NodeJS v6.0+](nodejs.org)

Now install the repo:

```shell
git clone https://github.com/ExpeditionRPG/expedition-quest-creator
cd expedition-quest-creator
sudo npm install -g webpack && npm install
```

If you use windows, you may need to run the following:

```shell
npm install --global --production windows-build-tools
```

### Config.json

`Config.json` contains app secrets that shouldn't be committed to the repo. We've included an example file, `config-example.json`, that shows you what information is needed.

To populate all of the values, you'll need to create a Google Cloud project and connect it to a Postgres database (either run locally or remote). If you have any issues with setup, you can create an issue here or email us at contact@expeditiongame.com and we'll help you get them sorted out!

### Development workflow

#### Serve / watch

```sh
npm run dev
```

The Quest Creator is then available at http://localhost:8080 by default. Note that dev defaults to using the beta API, running on a free Heroku instance - if you haven't dev'd in a while, it may take a minute to spin up after the first request.

When running on Windows, must be run within a Unix-like shell (such as Git Bash).

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.

#### Testing

```sh
npm test
```

### Deploying

The Quest Creator uses Continuous Integration (via Travis CI) and Heroku hosting to make deployment super easy.

If tests pass, that code is automatically deployed to AWS S3 at [http://betaquests.expeditiongame.com](http://betaquests.expeditiongame.com).

Once master has been thoroughly tested on dev, you can deploy to prod with `./prod.sh` - if you run into any deploy issues, make sure to read the notes in that file!

### Database

The Quest Creator uses Postgres SQL. You can test functionality and scripts against a locally-hosted version of Postgres. To access the official databases, you'll need to be a regular contributor to the codebase and receive special permission from the creators.

If you are going to access prod, especially to edit data, make sure to make a backup [here](https://data.heroku.com/datastores/af009eae-3a7e-467b-9822-b368e0d4ed3a) first. Backups are automatically created daily, but this will allow zero-consequence rollbacks in case your query fails.

For database querying, make sure you have psql installed and can do `which psql`, then run `heroku pg:psql --app expedition-quest-creator-dev DATABASE` to connect.

On Mac, you may need to add `PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH` to your `.bash_profile` for your terminal to recognize the `psql` command.

The production database is backed up daily. See the [playbook](docs/playbook.md) on how to interact with these backups.

If you need fresher data in devel, you can restore a prod backup into dev:

```shell
heroku pg:backups:restore expedition-quest-creator:: DATABASE_URL -a expedition-quest-creator-dev
```

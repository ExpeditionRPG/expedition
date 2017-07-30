# Expedition Quest API

API for [Expedition: The RPG Card Game](http://expeditiongame.com).

## Installation

Install:
- [NodeJS v6.0+](nodejs.org)

Now install the repo:

```shell
git clone https://github.com/ExpeditionRPG/expedition-quest-creator
cd expedition-quest-creator
sudo npm install -g webpack && npm install
```

If you're working with the expedition production instance, install the `heroku` CLI:

https://devcenter.heroku.com/articles/heroku-cli

And `psql` command:

https://devcenter.heroku.com/articles/heroku-postgresql#local-setup

Be sure to try each of the sections in the [playbook](docs/playbook.md) and revisit them from time to time to keep your skills sharp for debugging production.

### Config.json

`Config.json` contains app secrets that shouldn't be committed to the repo. We've included an example file, `config-example.json`, that shows you what information is needed.

To populate all of the values, you'll need to create a Google Cloud project and connect it to a Postgres database (either run locally or remote).

[TODO](https://github.com/ExpeditionRPG/expedition-quest-creator/issues/226): from a clean installation on a new machine, what config properties are actually required to run? What setup steps are required to generate them?

### Development workflow

#### Serve / watch

```sh
npm run build
npm run start
```

The server is then available at http://localhost:8080 by default.

When running on Windows, must be run within a Unix-like shell (such as Git Bash)

The IDE automatically loads `dist/config_base.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.

#### Testing

```sh
npm run test
```

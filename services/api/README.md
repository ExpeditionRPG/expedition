# Expedition Quest API

API for [Expedition: The RPG Card Game](http://expeditiongame.com).

## Installation

Install:
- Follow the installation commands in this [Readme](https://github.com/ExpeditionRPG/expedition#setup)

If you're working with the expedition production instance, install the `heroku` CLI:

https://devcenter.heroku.com/articles/heroku-cli

And `psql` command:

https://devcenter.heroku.com/articles/heroku-postgresql#local-setup

Be sure to try each of the sections in the [playbook](docs/playbook.md) and revisit them from time to time to keep your skills sharp for debugging production.

### Config.json

`config.json` contains app secrets that shouldn't be committed to the repo. We've included an example file, `config-example.json`, that shows you what information is needed.

To populate all of the values, you'll need to create a Google Cloud project and connect it to a Postgres database (either run locally or remote).

These properties are minimum required to run the app
  * DATABASE_URL : postgresql://[user[:password]@][netloc][:port][/dbname]
  * SESSION_SECRET: <any_string_which_is_secret>
  * SEQUELIZE_SSL: true/false
  * OAUTH2_CLIENT_ID: <oath_client_id_from_google_console>
  * OAUTH2_CLIENT_SECRET: <oath_client_secret_from_google_console>

> Note: Make sure to add `http://localhost:8080` under Authorized Javascript origins and Authorized Redirect URLs under Google Console Project.
> Also change the default constants API_KEY and CLIENT_ID in the [API Constants](https://github.com/ExpeditionRPG/expedition/blob/master/services/app/src/Constants.tsx) file for authentication to work

For creating the google credits , follow [Google Sign-In Guide](https://developers.google.com/identity/sign-in/web/sign-in)


### Development workflow

#### Serve / watch

```sh
npm run build
npm run start
```

The server is then available at http://localhost:8081 by default.

When running on Windows, must be run within a Unix-like shell (such as Git Bash)

The IDE automatically loads `dist/config_base.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.

#### Testing

```sh
npm run test
```

## Deployment

Set up your Heroku remotes and then rename them to api-beta and api-prod: https://devcenter.heroku.com/articles/git#creating-a-heroku-remote

## Database

Uses Postgres SQL. You can test functionality and scripts against a locally-hosted version of Postgres. To access the official databases, you'll need to be a regular contributor to the codebase and receive special permission from the creators.

If you are going to access prod, especially to edit data, make sure to make a backup [here](https://data.heroku.com/datastores/af009eae-3a7e-467b-9822-b368e0d4ed3a) first. Backups are automatically created daily, but this will allow zero-consequence rollbacks in case your query fails.

For database querying, make sure you have psql installed and can do `which psql`, then run `heroku pg:psql --app expedition-api-beta DATABASE` to connect.

On Mac, you may need to add `PATH=/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH` to your `.bash_profile` for your terminal to recognize the `psql` command.

The production database is backed up daily. See the [playbook](docs/playbook.md) on how to interact with these backups.

If you need fresher data in dev, you can restore a prod backup into dev:

```shell
heroku pg:backups:restore expedition-api-prod:: DATABASE_URL -a expedition-api-beta
```

# Expedition Quest IDE

This is the companion to the [Expedition App](https://github.com/Fabricate-IO/expedition-app),
allowing for users to design and publish custom quests that can be played around the world.

## Installation

Install [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.

Also install [NodeJS](nodejs.org).

```shell
git clone https://github.com/Fabricate-IO/expedition-app

npm install

# Login with your credentialed Google account, for API and database access
npm install -g google-cloud
gcloud auth login

cp /path/to/your/config.json ./config.json

NODE_ENV=dev npm start
```

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.


## Deploying

Compile and test to ensure webpack is working without hot reloading (ignore side effects):

```shell
webpack -p --config ./webpack.dist.config.js

npm start
```

## Accessing cloud SQL

[Cloud SQL Quickstart](https://cloud.google.com/sql/docs/quickstart)
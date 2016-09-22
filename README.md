# Expedition Quest IDE

This is the companion to the [Expedition App](https://github.com/Fabricate-IO/expedition-app),
allowing for users to design and publish custom quests that can be played around the world.

## Installation

Install [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.

Also install [NodeJS](nodejs.org).

Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/), then configure access:

```shell
gcloud auth login
````

Now install the repo:

```shell
git clone https://github.com/Fabricate-IO/expedition-app

npm install

cp /path/to/your/config.json ./config.json
```

To run with webpack-dashboard:
```shell
npm run dev-dash
```

To run (no dashboard)
```shell
npm run dev
```

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.


## Deploying

Compile and test to ensure webpack is working without hot reloading (ignore side effects):

```shell
webpack -p --config ./webpack.dist.config.js

npm start
```

Then see [Testing & Deploying Your Application](https://cloud.google.com/appengine/docs/flexible/nodejs/testing-and-deploying-your-app) for next steps.

## Accessing cloud SQL

[Cloud SQL Quickstart](https://cloud.google.com/sql/docs/quickstart)
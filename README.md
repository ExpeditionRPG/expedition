# Expedition Quest IDE

This is the companion to the [Expedition App](https://github.com/Fabricate-IO/expedition-app),
allowing for users to design and publish custom quests that can be played around the world.

## Installation

Install [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.

Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/) and configure:

```shell
gcloud auth login
````

Now install the repo:

```shell
git clone https://github.com/Fabricate-IO/expedition-app

# TODO: global installation stuffs

npm install

cp /path/to/your/config.json ./config.json
```

To run with webpack-dashboard:
```shell
node run dev-dash
```

To run (no dashboard)
```shell
node run dev
```

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.

# Expedition Quest IDE

This is the companion to the [Expedition App](https://github.com/Fabricate-IO/expedition-app),
allowing for users to design and publish custom quests that can be played around the world.

## Installation

Install [redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension) for Chrome.

```shell
git clone https://github.com/Fabricate-IO/expedition-app

# TODO: global installation stuffs

npm install

cp /path/to/your/config.json ./config.json

NODE_ENV=dev npm start
```

The IDE automatically loads `config.json` on start - this is excluded from the repo as it holds secrets unfit for mortal eyes.

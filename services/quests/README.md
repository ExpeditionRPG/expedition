# Expedition Quest Creator

Write and publish quests for [Expedition: The RPG Card Game](http://expeditiongame.com).

This is the companion to the [Expedition App](http://app.expeditiongame.com).

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

### Development workflow

#### Serve / watch

```sh
npm run dev
```

The Quest Creator is then available at http://localhost:8080 by default. Note that dev defaults to using the beta API, running on a free Heroku instance - if you haven't dev'd in a while, it may take a minute to spin up after the first request.

When running on Windows, must be run within a Unix-like shell (such as Git Bash).


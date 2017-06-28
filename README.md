# Expedition: The Companion App

[![Build Status](https://travis-ci.org/ExpeditionRPG/expedition-app.svg)](https://travis-ci.org/ExpeditionRPG/expedition-app)

Learn more about Expedition and play the game at [ExpeditionGame.com](https://expeditiongame.com). The app is available at [App.ExpeditionGame.com](https://App.ExpeditionGame.com), and for Android and iOS.

## Contributing

If you encounter any bugs with the app or have feedback, please [drop an issue](https://github.com/ExpeditionRPG/expedition-app/issues/new)! We just ask that you be as descriptive as possible. For feature requests, label it with "enhancement" and describe why you'd like the feature & your use case. For bugs, label it with "bug" and include what device(s) and browser(s) or app(s) you saw it on, including steps to reproduce (screenshots are also highly encouraged).

We're very friendly to pull requests! Simply fork the repository, create a new branch, make your desired changes and test them out on your local, then submit a PR.

Priorities are indicated via the "Assigned" field on issues and pull requests. Having someone assigned to it indicates that it's a current top priority and currently being worked on. Issues that are definitively low priorty / no plans to be addressed for 6 months+ should be labeled as "wontfix" and closed.

Question? Email us at Expedition@Fabricate.io

## Getting Started

### Requirements

Requires NodeJS v6.0 or above. Check your version with `node -v`.

We recommend using [NVM](https://github.com/creationix/nvm) to install node to make it easier to swap between and upgrade Node versions in the future.

Windows: must be run within a Unix-like shell (such as Git Bash)

iOS: Building the iOS app requires a mac, and cordova setup scripts currently work for unix-like environments only (Linux + Mac).

If you're having problems getting dependencies set up on your computer, try using this repo with [Containerizer](https://github.com/ExpeditionRPG/containerizer).

### Install dependencies

#### Quick-start

With Node.js installed, run the following one liner from the root of the repository:

```sh
npm install -g gulp webpack && npm install
```

For building native apps, you will also need to set up cordova. If you want to build with working authentication, first add `google-services.json` and `GoogleService-Info.plist` to the root of the repository (download from Firebase Console or get them from an admin). Then run:

```sh
npm install -g cordova
./project.sh
```

### Development workflow

#### Serve / watch

```sh
npm run dev
```

This runs the app at `http://localhost:8081/` (port may be different if you're using [Containerizer](https://github.com/ExpeditionRPG/containerizer)). It also outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

#### Run tests

```sh
npm run test
```

This runs the unit tests defined in the `app/test` directory.

Tests require Java JDK 7 or higher. To update Java go to http://www.oracle.com/technetwork/java/javase/downloads/index.html and download ***JDK*** and install it.

Tests require Chrome. Please make sure you have the Chrome browser installed and up-to-date on your system.

#### Release checklist

Before deploying to production, run `./beta.sh` to deploy to beta.expeditiongame.com and create beta versions of the Android and iOS apps. Then check that:

- app icon and splashscreen appear properly on Android and iOS. If properly configured, the icons and splashscreens WILL show up in the beta build.
- basic functionality works for all three builds (app loads, start quests, search quests, complete combat)

#### Build for Web

```sh
webpack --config ./webpack.dist.config.js
```

Notes:
- web files are output in the www/ folder. Can host locally for quick double checking via `python -m SimpleHTTPServer 5000` from www/.
- auth issues? Read https://github.com/EddyVerbruggen/cordova-plugin-googleplus

#### Build for Android

For debugging:

```sh
webpack --config ./webpack.dist.config.js && cordova build android
```

For release:

```sh
./build_android_release.sh
```

Notes and debugging:

- requires the Android SDK
- when deploying Android, you'll need to update `android-versionCode` in `config.xml`, not just `version`.
- auth issues? Read https://github.com/EddyVerbruggen/cordova-plugin-googleplus

#### Build for iOS

```sh
webpack --config ./webpack.dist.config.js && cordova build ios
```

Notes and debugging:

- requires a Mac with XCode installed
- auth issues? Read https://github.com/EddyVerbruggen/cordova-plugin-googleplus
  - app crashing because of invalid REVERSE_CLIENT_ID? Check to see if `/platforms/ios/Expedition/Resources/GoogleService-Info.plist` or `/platforms/ios/Expedition/Resources/Resources/GoogleService-Info.plist` is corrupted. Replace it, and re-run `cordova build ios`
- if Xcode complains about signing, try going to the project settings in Xcode, disabling automatic signing, re-enabling it, and then selecting your team again.

#### Troubleshooting builds

If you're having trouble with UglifyJS when running `webpack -p`, try removing webpack's dependence on uglify-js and letting the dev-dependency version be used (see [here](https://github.com/mishoo/UglifyJS2/issues/448)).

### Local Quests

To add an XML version of a quest to the app (aka featured quest or special game mode):

1. Write the quest in the [Quest Creator](http://quests.expeditiongame.com)
2. Open the Chrome Javascript console in the Quest Creator
3. Hit "Publish"
4. Go to the network tab and find the network POST event to `http://quests.expeditiongame.com/publish/...`
5. Scroll down to "Form Data" and hit "View Source"
6. Copy that into [http://xmlbeautifier.com](http://xmlbeautifier.com); make sure to set the "indent size" formatting option to 2
7. Paste the XML file into the `/quests` directory, and add it to the list in the FeaturedQuestsContainer component

# Expedition: The Companion App

Learn more about Expedition and play the game at [ExpeditionGame.com](https://expeditiongame.com). The app is available for browsers at [App.ExpeditionGame.com](https://App.ExpeditionGame.com), on the [Android market](https://play.google.com/store/apps/details?id=io.fabricate.expedition) and on the [iOS market](https://itunes.apple.com/us/app/expedition-roleplaying-card/id1085063478?ls=1&mt=8).

## Contributing

Please see CONTRIBUTING.md for how you can contribute!

## Getting Started

### Requirements

Requires NodeJS v8.0 or above. Check your version with `node -v`.

We recommend using [NVM](https://github.com/creationix/nvm) to install node to make it easier to swap between and upgrade Node versions in the future.

**Windows:** must be run within a Unix-like shell (such as Git Bash)

**iOS:** Building the iOS app requires a Mac, and cordova setup scripts currently work for unix-like environments only (Linux + Mac).

If you're having problems getting dependencies set up on your computer, try using this repo with [Containerizer](https://github.com/Fabricate-IO/containerizer).

### Install dependencies

#### Quick-start

For building native apps, you will also need to set up cordova. If you want to build with working authentication, you'll need to talk to an admin to get `GoogleService-Info.plist` and put them in the main project directory (which they'll download from the Firebase Console). Then run this setup command:

```sh
./setup.sh
```

### Development workflow

#### Serve / watch

```sh
npm run dev
```

This runs the app at [http://localhost:8082](http://localhost:8082) (port may be different if you're using [Containerizer](https://github.com/Fabricate-IO/containerizer)). It also outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

#### Run tests

```sh
npm run test
```

This runs tests defined with the `.test.tsx` extension, as well the `meta_tests.js` script file.

Tests require Java JDK 7 or higher. To update Java go to http://www.oracle.com/technetwork/java/javase/downloads/index.html and download ***JDK*** and install it.

Tests require Chrome. Please make sure you have the Chrome browser installed and up-to-date on your system.

#### Release checklist & deployment

Before deploying to production, run `./scripts/beta.sh` to deploy to beta.expeditiongame.com and create beta versions of the Android and iOS apps. Then run through the beta test checklist: https://docs.google.com/document/d/1HkHct0-AEMaHpkpU0uqSi6mhj2GJId78bXc23mo-2qg/edit

Once functionality is verified, you can deploy prod web & generate prod versions of the Android and iOS apps with `./scripts/prod.sh`.

#### Build for Web

```sh
npm run build
```

Notes:
- web files are output in the www/ folder. Can host locally for quick double checking via `python -m SimpleHTTPServer 5000` from www/.
- auth issues? Read https://github.com/EddyVerbruggen/cordova-plugin-googleplus

#### Build for Android

You'll first need to install Android Studio + [Gradle](https://gradle.org/install/)

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

## The App for Expedition: The Roleplaying Card Game

If you encounter any bugs with the app or have feedback, please drop an issue!

The Expedition App (c) by FabricateIO is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

You should have received a copy of the license along with this work. If not, see http://creativecommons.org/licenses/by-nc-nd/4.0/.

## Getting Started

### Requirements

Requires a NodeJS version above 0.12.x. Check your Node.js version.

```sh
node --version
```

### Install dependencies

#### Quick-start

With Node.js installed, run the following one liner from the root of the repository:

```sh
npm install -g gulp bower && npm install && bower install
```

For building native apps, you will also need to install cordova and plugins:

```sh
npm install -g cordova
cordova plugin add cordova-plugin-device cordova-plugin-inappbrowser cordova-plugin-whitelist

cordova platform add android
cordova platform add ios
```

### Development workflow

#### Serve / watch

```sh
gulp serve
```

This outputs an IP address you can use to locally test and another that can be used on devices connected to your network.

#### Run tests

```sh
gulp test:local
```

This runs the unit tests defined in the `app/test` directory through [web-component-tester](https://github.com/Polymer/web-component-tester).

To run tests Java 7 or higher is required. To update Java go to http://www.oracle.com/technetwork/java/javase/downloads/index.html and download ***JDK*** and install it.

#### Build for Web

```sh
gulp
```

Web files are output in the www/ folder.

#### Build for Android

```sh
gulp && cordova build android
```

#### Build for iOS

```sh
gulp && cordova build ios
```

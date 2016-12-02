#!/bin/bash
# Requires that android-release-key.keystore be in the directory above
# Tutorial:
# http://developer.android.com/tools/publishing/app-signing.html#signing-manually

# To generate a new key:
# keytool -genkey -v -keystore android-release-key.keystore -alias expedition_android -keyalg RSA -keysize 2048 -validity 10000

rm platforms/android/build/outputs/apk/expedition.apk

# Building the release package
cordova build --release android

# Signing the release APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../android-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk expedition_android

# Verification:
jarsigner -verify -verbose -certs platforms/android/build/outputs/apk/android-release-unsigned.apk

# Aligning memory blocks (takes less RAM on app)
./zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/expedition.apk

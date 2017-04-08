#!/bin/bash
# Requires the aws cli for s3 deploys (make sure to set your bucket region!)
# Requires that android-release-key.keystore be in the directory above
# Requires that you run `aws configure set preview.cloudfront true` to enable cloudfront invalidation
# Builds prod versions of the android (expedition.apk), iOS and web apps
# and deploys to app.expeditiongame.com, including invalidating the files on cloudfront (CDN)

# To generate a new key:
# keytool -genkey -v -keystore android-release-key.keystore -alias expedition_android -keyalg RSA -keysize 2048 -validity 10000
# Tutorial:
# http://developer.android.com/tools/publishing/app-signing.html#signing-manually

rm -rf www
rm platforms/android/build/outputs/apk/expedition.apk

# Rebuild the web app files
webpack --config ./webpack.dist.config.js

# Android: build the signed prod app (requires password entry)
cordova build --release android
# Signing the release APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../android-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk expedition_android
# Verification:
jarsigner -verify -verbose -certs platforms/android/build/outputs/apk/android-release-unsigned.apk
# Aligning memory blocks (takes less RAM on app)
./zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/expedition.apk

# iOS
cordova build ios

# Deploy web app to prod once apps built
aws s3 cp www s3://app.expeditiongame.com --recursive

# Invalidate files on cloudfront
aws cloudfront create-invalidation --distribution-id E24IJ45RK0D6J8 --invalidation-batch file://cloudfront-invalidations-prod.json

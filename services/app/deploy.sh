#!/bin/bash
# Builds prod versions of the android (expedition.apk), iOS and web apps
# and deploys to app.expeditiongame.com, including invalidating the files on cloudfront (CDN)

# Requires the aws cli for s3 deploys (make sure to set your bucket region!)
# Requires that android-release-key.keystore be in the directory above
# Requires that you run `aws configure set preview.cloudfront true` to enable cloudfront invalidation

# To generate a new key:
# keytool -genkey -v -keystore android-release-key.keystore -alias expedition_android -keyalg RSA -keysize 2048 -validity 10000
# Tutorial:
# http://developer.android.com/tools/publishing/app-signing.html#signing-manually

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf www
  rm platforms/android/app/build/outputs/apk/debug/app-debug.apk
  rm platforms/android/app/build/outputs/apk/release/expedition.apk
}

betabuild() {
  prebuild
  export NODE_ENV='dev'
  export API_HOST='http://betaapi.expeditiongame.com'
  read -p "Also build the Android & iOS apps? (Y/n) " -n 1
  echo
  if [[ $REPLY =~ ^(y| ) ]] || [[ -z $REPLY ]]; then
    echo "BUILD ALL"
    npm run build-all
  else
    echo "NOPE"
    npm run build
  fi
}

beta() {
  betabuild
  aws s3 cp www s3://beta.expeditiongame.com --recursive --region us-east-2
}

prodbuild() {
  prebuild

  # Read current version (as a string) from package.json
  key="version"
  re="\"($key)\": \"([^\"]*)\""
  package=`cat package.json`
  if [[ $package =~ $re ]]; then
    version="${BASH_REMATCH[2]}"
  fi

  # Rebuild the web app files
  export NODE_ENV='production'
  export API_HOST='https://api.expeditiongame.com'
  export OAUTH2_CLIENT_ID='545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com'

  read -p "Also build the Android & iOS apps? (Y/n) " -n 1
  echo
  if [[ $REPLY =~ ^(y| ) ]] || [[ -z $REPLY ]]; then
    printf "\nEnter android keystore passphrase: "
    read -s androidkeystorepassphrase

    # build the web app
    webpack --config ./webpack.dist.config.js

    # Android: build the signed prod app
    cordova build --release android
    # Signing the release APK
    jarsigner -storepass $androidkeystorepassphrase -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../android-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk expedition_android
    # Verification:
    jarsigner -verify -verbose -certs platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
    # Aligning memory blocks (takes less RAM on app)
    ./zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk platforms/android/app/build/outputs/apk/release/expedition.apk

    # iOS
    cordova build ios --buildFlag="-UseModernBuildSystem=0"
  else
    echo "Skipping building Cordova apps"

    # build the web app
    webpack --config ./webpack.dist.config.js
  fi
}

prod() {
  prodbuild
  # Deploy web app to prod with 1 day cache for most files, 6 month cache for art assets
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp www s3://app.expeditiongame.com --recursive --exclude '*.mp3' --exclude '*.jpg' --exclude '*.png' --cache-control max-age=86400 --cache-control public
  aws s3 cp www s3://app.expeditiongame.com --recursive --exclude '*' --include '*.mp3' --include '*.jpg' --include '*.png' --cache-control max-age=15552000 --cache-control public

  # Upload the APK for side-loading, and archive it by version number
  aws s3 cp platforms/android/app/build/outputs/apk/release/expedition.apk s3://app.expeditiongame.com/expedition.apk --cache-control public
  aws s3 cp s3://app.expeditiongame.com/expedition.apk s3://app.expeditiongame.com/apk-archive/expedition-$version.apk --cache-control public

  # Upload package.json for API's version check
  aws s3 cp package.json s3://app.expeditiongame.com/package.json

  # Invalidate files on cloudfront
  aws cloudfront create-invalidation --distribution-id EDFP2F13AASZW --paths /\*
}

# Calls arguments verbatim, aka arg -> function
"$@"

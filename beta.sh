#!/bin/bash
# Requires the aws cli for s3 deploys (make sure to set your bucket region!)
# Builds beta versions of the android (android-debug.apk), iOS and web apps
# and deploys to beta.expeditiongame.com
# Make sure to set your credentials via `aws configure`, environment variables or credentials file
# http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

rm -rf www
rm platforms/android/build/outputs/apk/android-debug.apk

# Rebuild the web app files
export NODE_ENV='dev'
export API_HOST='http://betaapi.expeditiongame.com'
webpack --config ./webpack.dist.config.js

# Android: build debug app
cordova build android

# iOS
cordova build ios

# Deploy web app to beta once apps built
aws s3 cp www s3://beta.expeditiongame.com --recursive --region us-east-2

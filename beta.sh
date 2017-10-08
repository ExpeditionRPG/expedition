#!/bin/bash
# Requires the aws cli for s3 deploys (make sure to set your bucket region!)
# Builds beta versions of the android (android-debug.apk), iOS and web apps
# and deploys to beta.expeditiongame.com
# Make sure to set your credentials via `aws configure`, environment variables or credentials file
# http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

rm -rf www

# Rebuild the web app files
export NODE_ENV='dev'
webpack --config ./webpack.dist.config.js

# Deploy web app to beta once apps built
export AWS_DEFAULT_REGION='us-east-2'
aws s3 cp www s3://betacards.expeditiongame.com --recursive

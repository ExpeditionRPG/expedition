#!/bin/bash
# Requires the aws cli for s3 deploys (make sure to set your bucket region!)
# Builds beta versions of the android (android-debug.apk), iOS and web apps
# and deploys to beta.expeditiongame.com
# Make sure to set your credentials via `aws configure`, environment variables or credentials file
# http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

read -p "This will remove built files, rebuild the app, and deploy to S3. Continue? (Y/n)" -n 1 -r
if [[ ${REPLY:-Y} =~ ^[Yy]$ ]]; then
  rm -rf www
  rm platforms/android/build/outputs/apk/android-debug.apk

  # Rebuild the web app files
  export NODE_ENV='dev'
  export API_HOST='http://betaapi.expeditiongame.com'
  npm run build-all

  # Deploy web app to beta once apps built
  aws s3 cp www s3://beta.expeditiongame.com --recursive --region us-east-2
fi

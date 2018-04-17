#!/bin/bash
# Requires the aws cli for s3 deploys
# Make sure to set your credentials via `aws configure`, environment variables or credentials file
# http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

read -p "Did you test on beta? (y/N) " -n 1
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf dist

  # Build the app - manually configure for production
  export NODE_ENV='production'
  export API_HOST='https://api.expeditiongame.com'
  export OAUTH2_CLIENT_ID='545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com'
  webpack --config ./webpack.dist.config.js

  # Deploy to prod with a 1 day cache
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://quests.expeditiongame.com --recursive --cache-control max-age=86400 --cache-control public

  # Invalidate files on cloudfront
  aws cloudfront create-invalidation --distribution-id E1MQUM2X3AHFSG --paths /\*
else
  echo "Prod build cancelled until tested on beta."
fi

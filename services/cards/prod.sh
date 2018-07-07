#!/bin/bash
# Requires the aws cli for s3 deploys (make sure to set your bucket region!)
# Deploys to cards.expeditiongame.com

read -p "Did you test a quest on the beta build? (y/N) " -n 1
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  rm -rf dist

  # Rebuild the web app files
  export NODE_ENV='production'
  webpack --config ./webpack.dist.config.js

  # Deploy web app to prod once apps built
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://cards.expeditiongame.com --recursive
else
  echo "Prod build cancelled until tested on beta."
fi

#!/bin/bash
# Requires the aws cli for s3 deploys
# Make sure to set your credentials via `aws configure`, environment variables or credentials file
# http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html

rm -rf dist

# Build the app - manually configure for dev environment
export NODE_ENV='dev'
export API_HOST='http://betaapi.expeditiongame.com'
webpack --config ./webpack.dist.config.js

# Deploy to beta
export AWS_DEFAULT_REGION='us-east-2'
aws s3 cp dist s3://betaadmin.expeditiongame.com --recursive

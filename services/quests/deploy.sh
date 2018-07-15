#!/bin/bash

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

beta() {
  prebuild
  export NODE_ENV='dev'
  export API_HOST='http://betaapi.expeditiongame.com'
  export OAUTH2_CLIENT_ID='545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betaquests.expeditiongame.com --recursive
}

prod() {
  prebuild
  export NODE_ENV='production'
  export API_HOST='https://api.expeditiongame.com'
  export OAUTH2_CLIENT_ID='545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://quests.expeditiongame.com --recursive --cache-control max-age=86400 --cache-control public
  aws cloudfront create-invalidation --distribution-id E1MQUM2X3AHFSG --paths /\*
}

# Calls arguments verbatim, aka arg -> function
"$@"

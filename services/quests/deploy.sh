#!/bin/bash

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

betabuild() {
  prebuild
  export NODE_ENV='dev'
  export API_HOST='https://betaapi.expeditiongame.com'
  export OAUTH2_CLIENT_ID='545484140970-jq9jp7gdqdugil9qoapuualmkupigpdl.apps.googleusercontent.com'
  webpack --config ./webpack.dist.config.js
}

beta() {
  betabuild
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betaquests.expeditiongame.com --recursive
}

prodbuild() {
  prebuild
  export NODE_ENV='production'
  export API_HOST='https://api.expeditiongame.com'
  export OAUTH2_CLIENT_ID='545484140970-r95j0rmo8q1mefo0pko6l3v6p4s771ul.apps.googleusercontent.com'
  webpack --config ./webpack.dist.config.js
}

prod() {
  prodbuild
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://quests.expeditiongame.com --recursive --cache-control max-age=86400 --cache-control public
  aws cloudfront create-invalidation --distribution-id E1MQUM2X3AHFSG --paths /\*
}

# Calls arguments verbatim, aka arg -> function
"$@"

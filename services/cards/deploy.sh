#!/bin/bash

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

betabuild() {
  prebuild
  export NODE_ENV='dev'
  webpack --config ./webpack.dist.config.js
}

beta() {
  betabuild
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betacards.expeditiongame.com --recursive
}

prodbuild() {
  prebuild
  export NODE_ENV='production'
  webpack --config ./webpack.dist.config.js
}

prod() {
  prodbuild
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://cards.expeditiongame.com --recursive
}

# Calls arguments verbatim, aka arg -> function
"$@"

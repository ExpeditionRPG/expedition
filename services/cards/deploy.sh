#!/bin/bash

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

beta() {
  prebuild
  export NODE_ENV='dev'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betacards.expeditiongame.com --recursive
}

prod() {
  prebuild
  export NODE_ENV='production'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://cards.expeditiongame.com --recursive
}

# Calls arguments verbatim, aka arg -> function
"$@"

#!/bin/bash

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

beta() {
  prebuild
  export NODE_ENV='dev'
  export API_HOST='http://betaapi.expeditiongame.com'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betaadmin.expeditiongame.com --recursive
}

prod() {
  prebuild
  export NODE_ENV='production'
  export API_HOST='https://api.expeditiongame.com'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://admin.expeditiongame.com --recursive
}

# Calls arguments verbatim, aka arg -> function
"$@"

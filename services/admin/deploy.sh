#!/bin/bash

prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

betabuild() {
  prebuild
  export NODE_ENV='dev'
  export API_HOST='http://betaapi.expeditiongame.com'
  yarn run build
}

beta() {
  betabuild
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betaadmin.expeditiongame.com --recursive
}

prodbuild() {
  prebuild
  export NODE_ENV='production'
  export API_HOST='https://api.expeditiongame.com'
  yarn run build
}

prod() {
  prodbuild
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://admin.expeditiongame.com --recursive
}

# Calls arguments verbatim, aka arg -> function
"$@"

#!/bin/bash

function prebuild() {
  # clear out old build files to prevent conflicts
  rm -rf dist
}

function deploybeta() {
  export NODE_ENV='dev'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://betacards.expeditiongame.com --recursive
}

function deployprod() {
  export NODE_ENV='production'
  webpack --config ./webpack.dist.config.js
  export AWS_DEFAULT_REGION='us-east-2'
  aws s3 cp dist s3://cards.expeditiongame.com --recursive
}

#### THE ACTUAL SCRIPT ####

while [ "$1" != "" ]; do
  case $1 in
    -t | --target )  shift
                     target=$1
                     ;;
  esac
  shift
done

if [ -n "$target" ]; then
  if [ "$target" = "beta" ]; then
    prebuild
    deploybeta
  elif [ "$target" = "prod" ]; then
    prebuild
    deployprod
  else
    echo "Invalid target option"
  fi
else
  echo "--target required"
fi

#!/bin/bash

function deploybeta() {
  git push api-beta master:master
}

function deployprod() {
  git push api-prod master:master
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

#!/bin/bash

TARGETS="beta prod local-beta local-prod"
service="$1"
target="$2"

getService() {
  if [ ! -d "$service" ]
  then
    echo "What service would you like to deploy?"
    select s in */; do
      service=$s
      break
    done
  fi
}

getTarget() {
  if [[ ! $TARGETS =~ $target ]];
  then
    echo "Where would you like to deploy $service?"
    select t in $TARGETS; do
      target=$t
      break
    done
  fi
}

deploy() {
  echo "Deploying $service to $target"
  if [ "$target" = "beta" ]; then
    (cd $service && ./deploy.sh beta)
  elif [ "$target" = "local-beta" ]; then
    (cd $service && ./deploy.sh betabuild)
  elif [ "$target" = "local-prod" ]; then
    (cd $service && ./deploy.sh prodbuild)
  elif [ "$target" = "prod" ]; then
    read -p "Did you test on beta? (y/N) " -n 1
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      (cd $s && ./deploy.sh prod)
    else
      echo "Prod build cancelled until tested on beta."
    fi
  else
    echo "Invalid target"
  fi
}

cd services
getService
getTarget
deploy

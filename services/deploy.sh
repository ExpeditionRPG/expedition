#!/bin/bash

echo "What service would you like to deploy?"
select s in */; do
  echo "Where would you like to deploy $s?"
  TARGETS="beta prod"
  select target in $TARGETS; do
    if [ "$target" = "beta" ]; then
      (cd $s && ./deploy.sh beta)
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
    break
  done
  break
done

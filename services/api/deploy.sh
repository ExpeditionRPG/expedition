#!/bin/bash

beta() {
  git push api-beta master:master
}

prod() {
  git push api-prod master:master
}

# Calls arguments verbatim, aka arg -> function
"$@"

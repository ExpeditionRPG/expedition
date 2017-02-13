#!/bin/bash

./node_modules/.bin/ncu -u --packageFile package.json

npm install

./node_modules/.bin/npm-check
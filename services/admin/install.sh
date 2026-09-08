#!/bin/bash

apt-get update

apt-get install -y git nodejs tmux npm bash build-essential curl libfontconfig1

curl https://raw.githubusercontent.com/creationix/nvm/v0.40.1/install.sh | bash

/bin/bash -l -c 'source ~/.nvm/nvm.sh && nvm install 24 && nvm alias default 24'

npm install -g yarn@1.22.22

# Rebuild node_modules just in case node version or other dependencies change.
# Every dependency lives in the monorepo root package.json, and yarn.lock is the
# source of truth. npm ignores yarn.lock, so `npm install` here could resolve
# different versions than CI and local development got -- which is exactly the
# class of drift that let a webpack-4-only flag survive into a webpack 5 build.
yarn --cwd "$(dirname "$0")/../.." install --frozen-lockfile

ln -s /usr/bin/nodejs /usr/bin/node

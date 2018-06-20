#!/bin/bash

apt-get update

apt-get install -y git nodejs tmux npm bash build-essential curl libfontconfig1

curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash

/bin/bash -l -c 'source ~/.nvm/nvm.sh && nvm install v8.11.3 && nvm alias default v8.11.3'

npm install -g webpack yarn

# Rebuild node_modules just in case node version or other dependencies change.
yarn install

ln -s /usr/bin/nodejs /usr/bin/node

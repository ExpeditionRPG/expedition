#!/bin/bash

apt-get update

apt-get install -y git nodejs tmux npm bash build-essential curl libfontconfig1

ln -s /usr/bin/nodejs /usr/bin/node

curl https://raw.githubusercontent.com/creationix/nvm/v0.25.0/install.sh | bash

/bin/bash -l -c 'source ~/.nvm/nvm.sh && nvm install v8.1.4 && nvm alias default v8.1.4'

npm install -g webpack

# Rebuild node_modules just in case node version or other dependencies change.
npm install

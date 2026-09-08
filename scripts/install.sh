#!/bin/bash

apt-cache clean

apt-get update

apt-get install --fix-missing -y bash git curl tmux bash libfontconfig

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.40.1/install.sh | bash

. /root/.nvm/nvm.sh && nvm install 24 && nvm alias default 24 && nvm use default && npm config set user 0 && npm config set unsafe-perm true && npm install -g yarn@1.22.22 && ln -s /usr/bin/nodejs /usr/bin/node

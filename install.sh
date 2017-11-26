#!/bin/bash

apt-cache clean

apt-get update

apt-get install --fix-missing -y bash git curl tmux bash libfontconfig

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash

. /root/.nvm/nvm.sh && nvm install v8.1.4 && nvm alias default v8.1.4 && nvm use default && npm config set user 0 && npm config set unsafe-perm true && npm install -g webpack && ln -s /usr/bin/nodejs /usr/bin/node

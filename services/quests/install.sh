#!/bin/bash

apt-get update

apt-get install -y git nodejs tmux npm bash build-essential curl libfontconfig1

curl https://raw.githubusercontent.com/creationix/nvm/v0.40.1/install.sh | bash

/bin/bash -l -c 'source ~/.nvm/nvm.sh && nvm install 24 && nvm alias default 24'

npm install -g webpack python-pip

pip install awscli

# Rebuild node_modules just in case node version or other dependencies change.
npm install

ln -s /usr/bin/nodejs /usr/bin/node

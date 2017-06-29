#!/bin/bash

apt-get update

apt-get install --fix-missing -y git npm nodejs tmux bash

ln -s /usr/bin/nodejs /usr/bin/node

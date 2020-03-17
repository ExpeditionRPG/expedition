#!/bin/bash
RESOLVE_PATH=$(pwd)
PORT=17048
PORT2=17049
docker run -e DOCKER_PORT=$PORT -e DOCKER_PORT2=$PORT2 -v $RESOLVE_PATH:/volume -p $PORT:$PORT -p $PORT2:$PORT2 -it --rm expedition:latest

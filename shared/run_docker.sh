#!/bin/bash
RESOLVE_PATH=$(pwd)
PORT=8090
PORT2=8091
docker run -e DOCKER_PORT=$PORT -e DOCKER_PORT2=$PORT2 -v $RESOLVE_PATH:/volume -p $PORT:$PORT -p $PORT2:$PORT2 -it expedition:latest

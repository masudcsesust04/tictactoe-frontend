#!/usr/bin/env bash
set -ex

# username of the docker hub or if you are using a different registry repo.
USERNAME=masudcsesust04
# image name
IMAGE=tictactoe-frontend

docker build -t $USERNAME/$IMAGE:latest .


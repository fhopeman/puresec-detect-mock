#!/usr/bin/env bash

set -e

if [ $# -ne 0 ]; then
    echo "Usage:"
    echo "setupServer"
    exit 1
fi

echo -e "\e[1minstall npm and nodejs for ARM ..\e[0m"
wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
rm node_latest_armhf.deb

echo -e "\e[1minstall dependencies ..\e[0m"
npm config set registry http://registry.npmjs.org/
sudo npm install -g grunt-cli
npm install

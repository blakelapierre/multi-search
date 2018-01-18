#!/bin/bash

rm -rf app
mkdir -p app/node_modules

cp -r ../.dist ./app
cp ../package.json ./app

sudo docker build -t multi-search/www .
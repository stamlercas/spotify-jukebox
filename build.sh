#!/bin/sh

# Install dependencies for server and client, build client side, and move client side files.


cd client 
npm run-script build

cd ..
mkdir -p public
cp -R client/build/* public/
mv public/index.html public/app.html
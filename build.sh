#!/bin/sh

# Install dependencies for server and client, build client side, and move client side files.


cd client 
npm run-script build

cd ..
mkdir -p server/public
cp -R client/build/* server/public/
mv server/public/index.html server/public/app.html
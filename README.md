# Jukebox

## What is this?
This application is a Node.js/React app that imitates a jukebox and is intended be used by mobile users exclusively to queue songs to a spotify account.

## Getting Started
- Verify Node.js is installed.  If not, install Node.js and npm (should come with node installer)
- Clone this repo to your machine
- Run the below command to install dependencies for the app
```bash
npm install && cd client && npm install && cd ..
```
- Build the app
```bash
npm run-script build
```
- Run the app
```bash
npm run-script start
```

## How it Works
On app startup, a spotify account will need to be used and until a user authorizes an account, every request will send a redirect url that will prompt the user to authorize their accoutn.

Once a user authorizes their account, an access token and refresh token will be used on the server to call Spotify's REST API. The user will be redirected to the home page and they will select the device they intend to use.

Please make sure the queue has been cleared, prior to using the app. The first song selected to play will cause Spotify to skip to the next track queued, which should be the song selected.

Search for a song, album, or artist and queue a song!
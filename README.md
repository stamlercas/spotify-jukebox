# Jukebox

## What is this?
This application is a Node.js/React app that imitates a jukebox and is intended be used by mobile users exclusively to queue songs to a spotify account.

## Getting Started
- Verify Node.js and MongoDB is installed.  If not, install Node.js and npm (should come with node installer) and install MongoDB.
- Clone this repo to your machine
- Copy `.env.example` and rename to `.env`
    - Populate the spotify client id and secret
- Run the below command to install dependencies for the app
```bash
npm install
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
On app startup, a shareable ID will be created, a spotify account will need to be used and until a user authorizes an account, and every request will send a redirect url that will prompt the user to authorize their account.

Once a user authorizes their account, an access token and refresh token will be used on the server to call Spotify's REST API. The user will be redirected to the home page and they will select the device they intend to use.

Please make sure the queue has been cleared, prior to using the app. The first song selected to play will cause Spotify to skip to the next track queued, which should be the song selected.

Search for a song, album, or artist and queue a song!

<img src="https://user-images.githubusercontent.com/16214116/140803971-7bd0200e-1358-427f-80c1-783412ec416a.png" width="30%"></img> <img src="https://user-images.githubusercontent.com/16214116/140803950-d18079c6-774e-4bc4-a774-9a0f69a444e4.png" width="30%"></img> <img src="https://user-images.githubusercontent.com/16214116/140803954-ad0fcd94-dd1b-4566-9988-9a54bad96d7a.png" width="30%"></img> 


This project makes use of [spotify-viz](https://github.com/zachwinter/spotify-viz) to create the audio visualizations.

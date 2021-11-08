# Jukebox

## What is this?
This application is a Node.js/React app that imitates a jukebox and is intended be used by mobile users exclusively to queue songs to a spotify account.

## Getting Started
- Verify Node.js is installed.  If not, install Node.js and npm (should come with node installer)
- Clone this repo to your machine
- In `client/src`, copy `properties.js.example` and rename to `properties.js`
    - The server url, should be populated with the host name or ip address of the machine
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
On app startup, a spotify account will need to be used and until a user authorizes an account, every request will send a redirect url that will prompt the user to authorize their account.

Once a user authorizes their account, an access token and refresh token will be used on the server to call Spotify's REST API. The user will be redirected to the home page and they will select the device they intend to use.

Please make sure the queue has been cleared, prior to using the app. The first song selected to play will cause Spotify to skip to the next track queued, which should be the song selected.

Search for a song, album, or artist and queue a song!

![Screenshot of home page](https://user-images.githubusercontent.com/16214116/140803371-09c4f618-4718-49cd-9e6b-397ac9e2aca4.png)
![Screenshot of search results](https://user-images.githubusercontent.com/16214116/140803376-65518a27-e2c2-489a-a95d-d568ce0def12.png)
![Screenshot of confirmation modal](https://user-images.githubusercontent.com/16214116/140803379-2acd344a-5e2c-4814-b458-c8f295dfa9dc.png)

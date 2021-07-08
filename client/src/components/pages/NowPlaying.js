import React, { Component } from "react";
import TrackDisplay from '../TrackDisplay.js';
import ServerApiClient from '../../client/ServerApiClient.js';
import AvailableDeviceModal from "../AvailableDeviceModal.js";
import socketIOClient from "socket.io-client";
import { properties } from '../../properties.js';
import Vibrant from 'node-vibrant';

const queryStringParser = require('query-string');

const PlayerState = {
    Loading: 'Loading...', 
    Not_Playing: 'There is currently nothing playing.', 
    Playing: 'Playing'
};

class NowPlaying extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            playerState: PlayerState.Loading,
            showModal: false,
            showTrackQueuedAlert: false
        }

        this.toggleModal = this.toggleModal.bind(this);
        this.getDisplay = this.getDisplay.bind(this);
        this.setNowPlayingSong = this.setNowPlayingSong.bind(this);
    }

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        });
    }

    componentDidMount() {
        let queryParameters = queryStringParser.parse(this.props.location.search);
        if (queryParameters.activation_success) {   // server side was just activated, so prompt to select available devices
            this.toggleModal();
        }
        if (queryParameters.track_queued) {
            this.setState({showTrackQueuedAlert: true});
        }
        ServerApiClient.getNowPlaying().then(res => {
            this.setNowPlayingSong(res);
        });
        const socket = socketIOClient(properties.serverUrl + ":3001");
        socket.on("NowPlaying", response => {
            let data = JSON.parse(response);
            this.setNowPlayingSong(data);
          });
    }

    /**
     * Set now playing song in state
     * @param {*} data 
     */
    setNowPlayingSong(data) {
        if (data.body.item != null) {
            this.setState({
                data: data.body,
                playerState: data.statusCode == 204 ? PlayerState.Not_Playing : PlayerState.Playing
            });
            console.log(this.state.data);
            if (this.state.playerState == PlayerState.Playing) {
                let v = new Vibrant(this.state.data.item.album.images[0].url);
                v.getPalette((err, palette) => {
                    document.getElementsByTagName('body')[0].style.backgroundAttachment = "fixed";
                    document.getElementsByTagName('body')[0].style.backgroundImage = "linear-gradient(" + palette.Vibrant.getHex() + ", " + palette.DarkVibrant.getHex() +")"; 
                    document.getElementsByClassName('track-display')[0].style.color = palette.LightMuted.getHex();
                });
            } else {
                document.getElementsByTagName('body')[0].style.backgroundAttachment = "";
                document.getElementsByTagName('body')[0].style.backgroundImage = ""; 
                document.getElementsByClassName('track-display')[0].style.color = "";
            }
        }
    }

    /**
     * Get display based on PlayerState
     */
    getDisplay() {
        switch(this.state.playerState) {
            case PlayerState.Playing:
                return (
                    <TrackDisplay track={this.state.data.item} />
                );
            default:
                return (
                    <h2 class="text-center">{this.state.playerState}</h2>
                );
        }
    }

    render() {
        return (
            <div>
                {this.state.showTrackQueuedAlert && 
                    <div class="alert alert-success alert-dismissible fade show" role="alert">
                        Track was added to the queue successfully!
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                }
                <div class="track-display">
                    {this.getDisplay()}
                </div>
                <AvailableDeviceModal show={this.state.showModal} close={this.toggleModal} />
            </div>
        )
    }
}

export default NowPlaying;
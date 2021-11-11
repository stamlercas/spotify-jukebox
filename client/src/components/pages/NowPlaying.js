import React, { Component } from "react";
import TrackDisplay from '../TrackDisplay.js';
import ServerApiClient from '../../client/ServerApiClient.js';
import AvailableDeviceModal from "../AvailableDeviceModal.js";
import socketIOClient from "socket.io-client";
import { properties } from '../../properties.js';
import Vibrant from 'node-vibrant';
import ColorUtils from '../../util/ColorUtils.js';
import DegreeUpdater from '../../util/DegreeUpdater.js';
import ObjectUtils from '../../util/ObjectUtils.js';
import Visualization from '../../spotify-viz/visualization.js';

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
        this.degreeUpdater = new DegreeUpdater();

        this.visualization = new Visualization({
            currentlyPlaying: '/api/nowplaying', 
            trackAnalysis: '/api/audio-analysis/', 
            trackFeatures: '/api/track-features/', 
            volumeSmoothing: 10,
            theme: []
        });
    }

    componentWillUnmount() {
        this.degreeUpdater.stop();
    }

    /**
     * Set now playing song in state
     * @param {*} data 
     */
    setNowPlayingSong(data) {
        if (!ObjectUtils.isEmpty(data.body) && data.body.item != null) {
            this.setState({
                data: data.body,
                playerState: PlayerState.Playing
            });
            if (this.state.playerState == PlayerState.Playing) {
                let v = new Vibrant(this.state.data.item.album.images[0].url);
                v.getPalette((err, palette) => {
                    // set background color gradient according album art                    
                    document.getElementsByTagName('body')[0].style.backgroundAttachment = "fixed";
                    document.getElementsByTagName('body')[0].style.backgroundImage = "linear-gradient(" + this.degreeUpdater.getDegree() + "deg, "
                            + palette.Vibrant.getHex() + ", " + palette.DarkVibrant.getHex() +")"; 
                    document.getElementsByTagName('body')[0].style.backgroundColor = palette.DarkVibrant.getHex();
                    document.getElementsByClassName('track-display')[0].style.color = ColorUtils.getMostContrast(palette.Vibrant, 
                        [palette.LightMuted, palette.DarkMuted, palette.LightVibrant, palette.Muted]).getHex();
                    
                    // set theme to album
                    this.visualization.setTheme([palette.Vibrant.getHex(), palette.LightMuted.getHex(), palette.DarkMuted.getHex(), 
                        palette.LightVibrant.getHex(), palette.Muted.getHex()]);
                });
            } else {
                document.getElementsByTagName('body')[0].style.backgroundAttachment = "";
                document.getElementsByTagName('body')[0].style.backgroundImage = ""; 
                document.getElementsByClassName('track-display')[0].style.color = "";
            }
        } else {
            this.setState({playerState: PlayerState.Not_Playing});
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
                    <h2 class="text-center player-state-text">{this.state.playerState}</h2>
                );
        }
    }

    render() {
        return (
            <div class="now-playing-container">
                {this.state.showTrackQueuedAlert && 
                    <div class="alert alert-success alert-dismissible fade show track-queue-alert" role="alert">
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
import React, { Component } from "react";
import { withRouter } from 'react-router-dom'
import TrackDisplay from '../TrackDisplay.js';
import ServerApiClient from '../../client/ServerApiClient.js';
import AvailableDeviceModal from "../AvailableDeviceModal.js";
import Vibrant from 'node-vibrant';
import ColorUtils from '../../util/ColorUtils.js';
import DegreeUpdater from '../../util/DegreeUpdater.js';
import ObjectUtils from '../../util/ObjectUtils.js';
import Visualization from '../../spotify-viz/visualization.js';
import StickyTrackDisplay from "../StickyTrackDisplay.js";

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
            track: {},
            playerState: PlayerState.Loading,
            showModal: false,
            showTrackQueuedAlert: false,
            isVisualizationEnabled: false,
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

    /**
     * Called after render
     */
    componentDidMount() {
        let queryParameters = queryStringParser.parse(this.props.location.search);
        if (queryParameters.activation_success) {   // server side was just activated, so prompt to select available devices
            this.toggleModal();
        }
        if (queryParameters.track_queued) {
            this.setState({showTrackQueuedAlert: true});
        }

        // ServerApiClient.getNowPlaying().then(res => {
        //     this.setNowPlayingSong(res);
        // });
        this.degreeUpdater = new DegreeUpdater();

        this.visualization = this.state.isVisualizationEnabled ? new Visualization({
            currentlyPlaying: '/api/nowplaying', 
            trackAnalysis: '/api/audio-analysis/', 
            trackFeatures: '/api/track-features/', 
            volumeSmoothing: 75
        }) : {};
    }

    componentWillUnmount() {
        this.degreeUpdater.stop();
    }

    componentDidUpdate(prevProps) {
        if (this.props.data !== prevProps.data ) {
            this.setNowPlayingSong(prevProps.data);
        }
    }

    /**
     * Set now playing song in state
     * @param {*} track 
     */
    setNowPlayingSong(track) {
        if (!ObjectUtils.isEmpty(track.body) && track.body.item != null) {
            this.setState({
                track: track.body,
                playerState: PlayerState.Playing
            });
            if (this.state.playerState == PlayerState.Playing) {
                let v = new Vibrant(this.state.track.item.album.images[0].url);
                v.getPalette((err, palette) => {
                    // set background color gradient according album art                    
                    document.getElementsByTagName('body')[0].style.backgroundAttachment = "fixed";
                    document.getElementsByTagName('body')[0].style.backgroundImage = "linear-gradient(" + this.degreeUpdater.getDegree() + "deg, "
                            + palette.Vibrant.getHex() + ", " + palette.DarkVibrant.getHex() +")"; 
                    document.getElementsByTagName('body')[0].style.backgroundColor = palette.DarkVibrant.getHex();

                    document.getElementsByClassName('track-display')[0].style.color = this.state.isVisualizationEnabled ? '#000' : ColorUtils.getMostContrast(palette.Vibrant, 
                        [palette.LightMuted, palette.DarkMuted, palette.LightVibrant, palette.Muted]).getHex();
                    
                    // set theme to album
                    if (!ObjectUtils.isEmpty(this.visualization)) {
                        this.visualization.setPalette(palette);
                    }
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
                return this.state.isVisualizationEnabled 
                    ? ( 
                        <div class="track-fixed-bottom-display">
                            <StickyTrackDisplay track={this.state.track.item} /> 
                        </div>
                    ) 
                    : ( 
                        <div  class="full-screen-display track-vertical-align">
                            <TrackDisplay track={this.state.track.item} /> 
                        </div>
                    );
            default:
                return (
                    <h2 class="full-screen-display text-center player-state-text bg-white">{this.state.playerState}</h2>
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

export default withRouter(NowPlaying);
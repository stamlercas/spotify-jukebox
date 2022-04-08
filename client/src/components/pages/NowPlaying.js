import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import TrackDisplay from '../TrackDisplay.js';
import AvailableDeviceModal from "../AvailableDeviceModal.js";
import Vibrant from 'node-vibrant';
import ColorUtils from '../../util/ColorUtils.js';
import DegreeUpdater from '../../util/DegreeUpdater.js';
import ObjectUtils from '../../util/ObjectUtils.js';
import Visualization from '../../spotify-viz/visualization.js';
import StickyTrackDisplay from "../StickyTrackDisplay.js";
import * as cookies from '../../spotify-viz/util/cookie.js';
import { properties } from "../../properties.js";

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
            isVisualizationEnabled: cookies.getBoolean(properties.cookies.visualizationEnabled),
        }

        this.toggleModal = this.toggleModal.bind(this);
        this.getDisplay = this.getDisplay.bind(this);
        this.setNowPlayingSong = this.setNowPlayingSong.bind(this);
        this.getVisualization = this.getVisualization.bind(this);
        this.initVisualization = this.initVisualization.bind(this);
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
        
        this.degreeUpdater = new DegreeUpdater();

        this.visualization = this.getVisualization();
    }

    componentWillUnmount() {
        this.degreeUpdater.stop();
        if(this.state.isVisualizationEnabled) {
            this.visualization.stop();
            this.visualization = null;
        } else {
            document.getElementsByTagName('body')[0].style.backgroundImage = '';
            document.getElementsByTagName('body')[0].style.backgroundColor = '#fff';
        }
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
        if (!ObjectUtils.isEmpty(track)) {
            this.setState({
                track: track,
                playerState: PlayerState.Playing
            });
            if (this.state.playerState == PlayerState.Playing) {
                let v = new Vibrant(this.state.track.album.images[0].url);
                v.getPalette((err, palette) => {
                    if (!this.state.isVisualizationEnabled) {
                        // set background color gradient according album art                    
                        document.getElementsByTagName('body')[0].style.backgroundAttachment = "fixed";
                        document.getElementsByTagName('body')[0].style.backgroundImage = "linear-gradient(" + this.degreeUpdater.getDegree() + "deg, "
                                + palette.Vibrant.getHex() + ", " + palette.DarkVibrant.getHex() +")"; 
                        document.getElementsByTagName('body')[0].style.backgroundColor = palette.DarkVibrant.getHex();

                        document.getElementsByClassName('track-display')[0].style.color = ColorUtils.getMostContrast(palette.Vibrant, 
                            [palette.LightMuted, palette.DarkMuted, palette.LightVibrant, palette.Muted]).getHex();
                    } else {
                        // set theme to album
                        this.getVisualization().setPalette(palette);
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
                            <StickyTrackDisplay track={this.state.track} /> 
                        </div>
                    ) 
                    : ( 
                        <div  class="full-screen-display track-vertical-align">
                            <TrackDisplay track={this.state.track} /> 
                        </div>
                    );
            default:
                return (
                    <h2 class="full-screen-display text-center player-state-text bg-white">{this.state.playerState}</h2>
                );
        }
    }

    /**
     * Return visualization object.
     * If no visualization object is present, create a new one if visualizations are enabled. Else just have an empty object
     * @returns 
     */
    getVisualization() {
        if (ObjectUtils.isEmpty(this.visualization)) {
            this.initVisualization();
        }
        return this.visualization;
    }

    initVisualization() {
        this.visualization = this.state.isVisualizationEnabled ? new Visualization({
            currentlyPlaying: '/api/nowplaying', 
            trackAnalysis: '/api/audio-analysis/', 
            trackFeatures: '/api/track-features/', 
            volumeSmoothing: 75
        }) : {};
        return this.visualization;
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
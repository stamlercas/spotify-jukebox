import React, { Component } from "react";
import TrackDisplay from './TrackDisplay.js';
import ServerApiClient from '../client/ServerApiClient.js';
import AvailableDeviceModal from "./AvailableDeviceModal.js";
import socketIOClient from "socket.io-client";
import { properties } from '../properties.js';

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
            showModal: false
        }

        this.toggleModal = this.toggleModal.bind(this);
        this.getDisplay = this.getDisplay.bind(this);
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
        ServerApiClient.getNowPlaying().then(res => {
            let status = res.statusCode;
            this.setState({
                data: res.body,
                playerState: status == 204 ? PlayerState.Not_Playing : PlayerState.Playing
            });
        });
        const socket = socketIOClient(properties.serverUrl + ":3001");
        socket.on("NowPlaying", response => {
            let data = JSON.parse(response);
            this.setState({
                data: data.body,
                playerState: data.statusCode == 204 ? PlayerState.Not_Playing : PlayerState.Playing
            });
          });
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
                {this.getDisplay()}
                <AvailableDeviceModal show={this.state.showModal} close={this.toggleModal} />
            </div>
        )
    }
}

export default NowPlaying;
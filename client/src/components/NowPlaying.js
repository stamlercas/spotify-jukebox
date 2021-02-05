import React, { Component } from "react";
import TrackDisplay from './TrackDisplay.js';
import { fetchSpotifyData } from "../util/ComponentUtils.js";

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
            playerState: PlayerState.Loading
        };
    }

    componentDidMount() {
        fetchSpotifyData("/api/nowplaying").then(res => {
            let status = res.statusCode;
            this.setState({
                data: res.body,
                playerState: status == 204 ? PlayerState.Not_Playing : PlayerState.Playing
            });
        });
    }

    render() {
        switch(this.state.playerState) {
            case PlayerState.Loading:
            case PlayerState.Not_Playing:
                return (
                    <h2 class="text-center">{this.state.playerState}</h2>
                );
            case PlayerState.Playing:
                return (
                    <TrackDisplay track={this.state.data.item} />
                );
        }
    }
}

export default NowPlaying;
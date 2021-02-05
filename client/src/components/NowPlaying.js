import React, { Component } from "react";
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
                // map artist object to only name, because that is all we care about
                let artists = this.state.data.item.artists.map(artist => artist.name);
                let track = this.state.data.item.name;
                let albumUrl = this.state.data.item.album.images[0].url;
                return (
                    <div>
                        <div class="row text-center">
                            <div class="col-lg-2"></div>
                            <div class="col-lg-8">
                                <img class="img-fluid" src={albumUrl} />
                            </div>
                            <div class="col-2"></div>
                        </div>
                        <div class="text-center">
                            <h4>{artists.join(", ")}</h4>
                        </div>
                        <div class="text-center">
                            {track}
                        </div>
                    </div>
                );
        }
    }
}

export default NowPlaying;
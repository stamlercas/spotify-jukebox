import React, { Component } from "react";

class TrackDisplay extends Component {
    render() {
        let artists = this.props.track.artists.map(artist => artist.name);
        let track = this.props.track.name;
        let albumUrl = this.props.track.album.images[0].url;
        let albumName = this.props.track.album.name;
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
                    <h4 class="band-title">{artists.join(", ")}</h4>
                </div>
                <div class="text-center">
                    {albumName}
                </div>
                <div class="text-center">
                    {track}
                </div>
            </div>
        );
    }
}

export default TrackDisplay;
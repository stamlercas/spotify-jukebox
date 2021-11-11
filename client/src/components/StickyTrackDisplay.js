import React, { Component } from "react";
import TrackDisplay from "./TrackDisplay";

class StickyTrackDisplay extends TrackDisplay {
    constructor(props) {
        super(props);
    }

    render() {
        let artists = this.getArtists();
        let track = this.getTrack();
        let albumUrl = this.getAlbumImage();
        let albumName = this.getAlbum();
        return (
            <div class="track-item fixed-bottom bg-dark" style={{padding: '5px'}}>
                <div class="container">
                    <div class="row">
                        <div class="col-4 col-sm-3 col-md-2">
                            <img class="img-fluid" src={albumUrl} />
                        </div>
                        <div class="col track-vertical-align ellipsis">
                            <div class="track-item">
                                <div class="">
                                    <h5 class="band-title">{artists}</h5>
                                </div>
                                <div class="">{albumName}</div>
                                <div class="">{track}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StickyTrackDisplay;
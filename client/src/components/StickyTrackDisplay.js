import React, { Component } from "react";
import TrackDisplay from "./TrackDisplay";

/**
 * Track display that is fixed to the bottom of the screen.
 */
class StickyTrackDisplay extends TrackDisplay {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.setBottomPadding) {
            let height = document.getElementById('sticky-track-display').clientHeight;
            document.body.setAttribute('style', 'padding-bottom: ' + height + 'px');
        }
    }
    componentWillUnmount() {
        document.body.setAttribute('style', 'padding-bottom: 0');
    }

    render() {
        let artists = this.getArtists();
        let track = this.getTrack();
        let albumUrl = this.getAlbumImage();
        let albumName = this.getAlbum();
        return (
            <div id="sticky-track-display" class="track-item fixed-bottom bg-dark" style={{padding: '10px 0px'}}>
                <div class="container">
                    <div class="row">
                        <div class="col-3 col-md-2 col-lg-1">
                            <img class="img-fluid" src={albumUrl} />
                        </div>
                        <div class="col track-vertical-align sticky-track-info">
                            <div class="text-light" style={{overflow: 'hidden'}}>
                                <div class="truncated">
                                    {artists} - {track}
                                </div>
                                <div class="truncated">{albumName}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

StickyTrackDisplay.defaultProps = {
    setBottomPadding: true
}

export default StickyTrackDisplay;
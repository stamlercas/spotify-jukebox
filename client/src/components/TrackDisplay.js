import React, { Component } from "react";

class TrackDisplay extends Component {
    constructor(props) {
        super(props);
        
        this.getArtists = this.getArtists.bind(this);
        this.getTrack = this.getTrack.bind(this);
        this.getAlbumImage = this.getAlbumImage.bind(this);
        this.getAlbum = this.getAlbum.bind(this);
    }

    getArtists() {
        return this.props.track.artists.map(artist => artist.name).join(", ");
    }

    getTrack() {
        return this.props.track.name;
    }

    getAlbumImage() {
        return this.props.track.album.images[0].url;
    }

    getAlbum() {
        return this.props.track.album.name;
    }

    render() {
        let artists = this.getArtists();
        let track = this.getTrack();
        let albumUrl = this.getAlbumImage();
        let albumName = this.getAlbum();
        return (
            <div class="track-item">
                <div class="row text-center">
                    <div class="col-lg-2"></div>
                    <div class="col-lg-8">
                        <img class="img-fluid" src={albumUrl} />
                    </div>
                    <div class="col-2"></div>
                </div>
                <div class="text-center">
                    <h4 class="band-title">{artists}</h4>
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
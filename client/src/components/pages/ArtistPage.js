import React, { Component } from "react";
import TrackList from '../TrackList';
import ServerApiClient from '../../client/ServerApiClient';
import AlbumList from "../AlbumList";

const PageState = {
    Loading: 'Loading...', 
    Not_Found: 'Artist was not found.', 
    Success: 'Success'
};

class ArtistPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            pageState: PageState.Loading
        }
    }

    componentDidMount() {
        let id = this.props.match.params.id;
        ServerApiClient.getArtist(id).then(res => 
            this.setState({
                data: res,
                pageState: PageState.Success
            }));
    }

    /**
     * Get display based on PlayerState
     */
    getDisplay() {
        switch(this.state.pageState) {
            case PageState.Success:
                let artist = this.state.data.artist;
                let topTracks = this.state.data.top_tracks.slice(0, 5);
                let albums = this.state.data.albums.items;//.filter(album => album.album_type != 'single');
                return (
                    <div>
                        <div class="row">
                            <div class="col-3 justify-content-center align-self-center">
                                {artist.images[artist.images.length - 1] !== undefined &&
                                <span>
                                    <img src={artist.images[artist.images.length - 1].url} class="img-fluid"/>
                                </span>
                                }
                            </div>
                            <div class="col-9 justify-content-center align-self-center">
                                <h2>{artist.name}</h2>
                            </div>
                        </div>
                        <br />
                        <TrackList tracks={topTracks}/>
                        <br />
                        <AlbumList albums={albums}/>
                    </div>
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
            </div>
        )
    }
}

export default ArtistPage;
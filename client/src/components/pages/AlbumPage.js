import React, { Component } from "react";
import TrackList from '../TrackList';
import ServerApiClient from '../../client/ServerApiClient';

const PageState = {
    Loading: 'Loading...', 
    Not_Found: 'Album was not found.', 
    Success: 'Success'
};

class AlbumPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            pageState: PageState.Loading
        }
    }

    componentDidMount() {
        let id = this.props.match.params.id;
        ServerApiClient.getAlbum(id).then(res => 
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
                let album = this.state.data;
                let tracks = this.state.data.tracks.items.map(track => {
                    track.album = {};
                    track.album.images = album.images;
                    track.album.name = album.name;
                    return track;
                });
                return (
                    <div>
                        <div class="row">
                            <div class="col-3 justify-content-center align-self-center">
                                {album.images[album.images.length - 1] !== undefined &&
                                <span>
                                    <img src={album.images[album.images.length - 1].url} class="img-fluid"/>
                                </span>
                                }
                            </div>
                            <div class="col-9 justify-content-center align-self-center">
                                <h2>{album.name}</h2>
                                <div>{album.release_date.substring(0, 4)}</div>
                            </div>
                        </div>
                        <br />
                        <TrackList tracks={tracks}/>
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

export default AlbumPage;
import React, { Component } from "react";
import { fetchSpotifyData, formatArtists } from '../util/ComponentUtils.js';

class PlaySongModal extends Component {
    constructor(props) {
        super(props);

        this.playSong = this.playSong.bind(this);
    }

    playSong() {
        fetchSpotifyData('/play', 'POST', {
            trackId: this.props.track.id
        });
    }

    render() {
        let track = this.props.track;
        return (
            <div class="modal fade" id={track.id + '-modal'} tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to play {track.name} by {formatArtists(track.artists)}?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button onClick={this.playSong} type="button" class="btn btn-primary">Play</button>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default PlaySongModal;
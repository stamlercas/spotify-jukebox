import React, { Component } from "react";
import { formatArtists } from '../util/ComponentUtils.js';
import PlaySongModal from "./PlaySongModal.js";

class TrackListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        }
    }

    render() {
        let track = this.props.track;
        let trackNameMaxSize = 40;
        let trackName = track.name.length > trackNameMaxSize ? track.name.substring(0, trackNameMaxSize) + '...' : track.name;
        return (
            <li class="list-group-item">
                <PlaySongModal track={this.props.track}/>
                <div class="row">
                    <div class="col-2 justify-content-center align-self-center">
                        <span>
                            <i class="bi bi-play play-icon" data-toggle="modal" data-target={'#' + track.id + '-modal'}></i>
                        </span>
                    </div>
                    <div class="col-8 justify-content-center align-self-center">
                            <div class="font-weight-bold">{trackName}</div>
                            <div>{formatArtists(track.artists)}</div>
                    </div>
                </div>
            </li>
        );
    }
}

export default TrackListItem;
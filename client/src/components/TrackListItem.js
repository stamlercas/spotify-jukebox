import React, { Component } from "react";
import { formatArtists } from '../util/ComponentUtils.js';
import PlaySongModal from "./PlaySongModal.js";

class TrackListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        }
        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        });
        console.log('yep');
    }

    render() {
        let track = this.props.track;
        let trackNameMaxSize = 40;
        let trackName = track.name.length > trackNameMaxSize ? track.name.substring(0, trackNameMaxSize) + '...' : track.name;
        return (
            <li class="list-group-item">
                <div class="row">
                    <div class="col-2 justify-content-center align-self-center">
                        <span>
                            <i class="bi bi-play play-icon" data-toggle="modal" onClick={this.toggleModal}></i>
                        </span>
                    </div>
                    <div class="col-8 justify-content-center align-self-center">
                            <div class="font-weight-bold">{trackName}</div>
                            <div>{formatArtists(track.artists)}</div>
                    </div>
                </div>
                <PlaySongModal track={this.props.track} show={this.state.showModal} close={this.toggleModal}/>
            </li>
        );
    }
}

export default TrackListItem;
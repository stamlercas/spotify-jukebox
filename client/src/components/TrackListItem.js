import React, { Component } from "react";
import { formatArtists } from '../util/ComponentUtils.js';
import PlaySongModal from "./modal/PlaySongModal.js";

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
    }

    render() {
        let track = this.props.track;
        let trackNameMaxSize = 40;
        let trackName = track.name.length > trackNameMaxSize ? track.name.substring(0, trackNameMaxSize) + '...' : track.name;
        return (
            <a class="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col-2 justify-content-center align-self-center play-icon-container">
                        <span>
                            <i class="bi bi-plus play-icon" data-toggle="modal" onClick={this.toggleModal}></i>
                        </span>
                    </div>
                    <div class="col-10 justify-content-center align-self-center">
                            <div class="font-weight-bold">{trackName}</div>
                            <div>{formatArtists(track.artists)}</div>
                    </div>
                </div>
                <PlaySongModal track={this.props.track} show={this.state.showModal} close={this.toggleModal}/>
            </a>
        );
    }
}

export default TrackListItem;
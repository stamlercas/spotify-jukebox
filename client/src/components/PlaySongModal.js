import React, { Component } from "react";
import { Button, Modal }from 'react-bootstrap';
import TrackDisplay from './TrackDisplay.js';
import { fetchSpotifyData, formatArtists } from '../util/ComponentUtils.js';

class PlaySongModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show
        }

        this.playSong = this.playSong.bind(this);
    }

    playSong() {
        fetchSpotifyData('/api/queue', 'POST', {
            href: this.props.track.href,
        });
        this.props.close();
    }

    render() {
        let track = this.props.track;
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <TrackDisplay track={this.props.track} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.close}>
                    Close
                    </Button>
                    <Button variant="success" onClick={this.playSong}>
                    Play
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default PlaySongModal;
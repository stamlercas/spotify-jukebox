import React, { Component } from "react";
import { Button, Modal }from 'react-bootstrap';
import TrackDisplay from './TrackDisplay.js';
import ServerApiClient from '../client/ServerApiClient.js';

class PlaySongModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show
        }

        this.playSong = this.playSong.bind(this);
    }

    playSong() {
        ServerApiClient.addToQueue(this.props.track.uri).then(() => {
            this.props.close();
            window.location.href = '/?track_queued=true';
        });
    }

    render() {
        let track = this.props.track;
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Play this song?</Modal.Title>
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
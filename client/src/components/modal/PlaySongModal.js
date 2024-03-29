import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import { Button, Modal }from 'react-bootstrap';
import SignatureFormInput from '../form/SignatureFormInput.js';
import TrackDisplay from '../TrackDisplay.js';
import ServerApiClient from '../../client/ServerApiClient.js';
import { properties } from "../../properties.js";
import Alert from "../Alert.js";

const PlaySongModalState = {
    Play_Song: 'Play song',
    Confirm_Play: 'Confirm Play'
}

class PlaySongModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show,
            playSongModalState: PlaySongModalState.Play_Song,
            songThreshold: properties.songThresholdDuration * 60 * 1000
        }

        this.playSong = this.playSong.bind(this);
        this.getBody = this.getBody.bind(this);
        this.close = this.close.bind(this);
    }

    playSong() {
        let canPlay = false;
        // if track is longer than 10 minutes and user has not enter the confirm play state, take them to the confirm play state
        if (this.props.track.duration_ms > this.state.songThreshold && this.state.playSongModalState != PlaySongModalState.Confirm_Play) {
            this.setState({ playSongModalState: PlaySongModalState.Confirm_Play });
        } else if (this.state.playSongModalState == PlaySongModalState.Confirm_Play) {
            // TODO: validate form
            let form = document.getElementById("confirmation-form");
            if (this.sigCanvas.validate() && form.checkValidity()) {
                canPlay = true;
            }

            form.classList.add('was-validated');
        }
        else {
            canPlay = true;
        }

        if (canPlay) {
            ServerApiClient.addToQueue(this.props.track).then(() => {
                this.props.close();
                this.props.history.push({
                    pathname: "/",
                    search: "?track_queued=true",
                    hash: window.location.hash
                });
            }).catch(err => {
                this.setState(prevState => ({
                    alerts: [<Alert type="danger" text={`${err.message}`}/>, prevState.alerts]
            }));
            });
        }
    }

    close() {
        this.setState({
            playSongModalState: PlaySongModalState.Play_Song
        });
        this.props.close();
    }

    getBody() {
        switch(this.state.playSongModalState) {
            case PlaySongModalState.Confirm_Play:
                let duration_min = this.state.songThreshold / (60 * 1000);
                let isPlural = duration_min != 1;
                let date = new Date();
                return (
                    <form id="confirmation-form" novalidate>
                        <p>This song is more than {duration_min} minute{isPlural && "s"} long. Please sign and confirm before playing.</p>
                        <br />
                        <div class="row">
                                <div class="col-4">I, </div>
                                <div class="col-8">
                                    <input id="txt-input-name" type="text" class="form-control input" required />
                                    <div class="invalid-feedback">
                                        Name please.
                                    </div>
                                </div>
                        </div>
                        <p>
                            (hereinafter referred to as <b>Asshole</b>) understand that playing a song for more than {duration_min} minute{isPlural && "s"} is a dick move. As such, <b>Asshole</b>&nbsp;
                            agrees to sole responsibiltiy for all bitching that may occur as a result of this song playing. <b>Asshole</b> herewith agrees to sole liability 
                            for any injury to self or others as a result of this action.
                        </p>
                        <SignatureFormInput ref={(ref) => { this.sigCanvas = ref }} />
                        <div>
                            Date: {date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear()}
                        </div>
                    </form>
                );
            default:
                return (
                    <TrackDisplay track={this.props.track} />
                );
        }
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Play this song?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div id="alerts">{this.state.alerts}</div>
                    <div id="empty-div"></div>
                    {this.getBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.close}>
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

export default withRouter(PlaySongModal);
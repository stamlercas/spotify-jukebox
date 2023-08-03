import React, { Component } from "react";
import { Button, Modal }from 'react-bootstrap';
import {QRCodeSVG} from 'qrcode.react';

class ShareModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show,
        }

        this.copy = this.copy.bind(this);
        this.webShare = this.webShare.bind(this);
    }

    copy() {
        navigator.clipboard.writeText(window.location.href);
    }

    webShare() {
        navigator.share({
            title: 'Share',
            text: 'You\'ve been invited to play music!',
            url: window.location.href
        })
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Share</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div class="clipboard-container">
                        <div class="row bg-light align-items-center">
                            <div class="col-10 text-clipboard"><pre>{window.location.href}</pre></div>
                            <div class="col-2 text-center btn-clipboard-container">
                                <button type="button" class="btn btn-clipboard" onClick={this.copy}><i class="bi bi-clipboard"></i></button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <QRCodeSVG value={window.location.href} height="100%" width="100%" />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    { navigator.share &&
                    <Button variant="info" onClick={this.webShare}>
                    More Ways to Share...
                    </Button>}
                    <Button variant="secondary" onClick={this.props.close}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default ShareModal;
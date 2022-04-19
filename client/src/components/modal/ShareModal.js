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
    }

    copy() {
        navigator.clipboard.writeText(window.location.href);
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Share</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div class="mb-4">
                        <div class="row">
                            <div class="col-10 text-clipboard">{window.location.href}</div>
                            <div class="col-2">
                                <button type="button" class="btn btn-clipboard" onClick={this.copy}><i class="bi bi-clipboard"></i></button>
                            </div>
                        </div>
                    </div>
                    <br />
                    <QRCodeSVG value={window.location.href} height="100%" width="100%" />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.close}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default ShareModal;
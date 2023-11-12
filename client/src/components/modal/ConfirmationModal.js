import React, { Component } from "react";
import { Button, Modal }from 'react-bootstrap';

/**
 * Props: 
 *  show, 
 *  close, 
 *  message,
 *  action
 */
class ConfirmationModal extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.props.message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.props.action}>
                    Submit
                    </Button>
                    <Button variant="secondary" onClick={this.props.close}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default ConfirmationModal;
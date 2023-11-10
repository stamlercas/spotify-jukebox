import React, { Component } from "react";
import { Button, Modal }from 'react-bootstrap';
import DeviceOption from '../form/DeviceOption.js';
import ServerApiClient from '../../client/ServerApiClient.js';

const SetupModalState = {
    Loading: 'Loading...',
    Success: 'Success',
    No_Available_Devices: 'No available devices found.'
};

class AvailableDeviceModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show,
            availableDeviceModalState: SetupModalState.Loading,
            data: []
        }

        this.deviceId = null;
        this.skipToNext = false;

        this.getBody = this.getBody.bind(this);
        this.getDevices = this.getDevices.bind(this);
        this.setup = this.setup.bind(this);
        this.deviceChangeHandler = this.deviceChangeHandler.bind(this);
        this.skipToNextChangeHandler = this.skipToNextChangeHandler.bind(this);
    }

    componentDidMount() {
       this.getDevices();
    }

    getDevices() {
        this.setState({ availableDeviceModalState: SetupModalState.Loading });
        ServerApiClient.getAvailableDevices().then(res => {
            // check for no data
            if (res === undefined || res.length == 0 || Object.keys(res).length === 0) {
                this.setState({
                    availableDeviceModalState: SetupModalState.No_Available_Devices
                })
            } else {
                this.setState({
                    data: res,
                    availableDeviceModalState: SetupModalState.Success
                });
                this.deviceId = this.state.data[0].id;
            }
        }, res => this.setState({availableDeviceModalState: SetupModalState.No_Available_Devices}));
    }

    setup() {
        if (this.deviceId != null) {
            ServerApiClient.setup(this.deviceId, this.skipToNext).then(() => this.props.close());
        } // TODO: set alert or something notifying user that no devices was selected
    }

    deviceChangeHandler(e) {
        this.deviceId = e.target.value;
    }

    skipToNextChangeHandler(e) {
        this.skipToNext = e.target.checked;
    }

    getBody() {
        return (
            <form>
                <div class="form-group">
                    <label for="devices-select">Playback Device</label>
                    <div class="row">
                        <div class="col-10">
                            <select class="form-control" id="devices-select" required onChange={this.deviceChangeHandler}>
                                {this.state.data.map(device => <DeviceOption device={device}/>)}
                            </select>
                        </div>
                        <div class="col-2" onClick={this.getDevices}>
                            <button type="button" class="btn btn-primary"><i class="bi bi-arrow-repeat"></i></button>
                        </div>
                    </div>
                </div>

                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="" id="skip-to-next-check" onChange={this.skipToNextChangeHandler} />
                    <label class="form-check-label" for="skip-to-next-check">
                        Skip to next on first song
                    </label>
                    <small id="skip-to-next-check-help" class="form-text text-muted">
                        When the first track is queued, immediately skip the currently playing track and play the queued rack.
                    </small>
                </div>
            </form>
        );
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Setup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.getBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.setup}>
                    Submit
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default AvailableDeviceModal;
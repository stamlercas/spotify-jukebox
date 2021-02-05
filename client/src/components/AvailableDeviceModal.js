import React, { Component } from "react";
import { Button, Modal }from 'react-bootstrap';
import DeviceOption from './DeviceOption.js';
import ServerApiClient from '../client/ServerApiClient.js';

const AvailableDeviceModalState = {
    Loading: 'Loading...',
    Success: 'Success',
    No_Available_Devices: 'No available devices found.'
};

class AvailableDeviceModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show,
            availableDeviceModalState: AvailableDeviceModalState.Loading,
            data: {}
        }

        this.deviceId = '';

        this.getBody = this.getBody.bind(this);
        this.selectDevice = this.selectDevice.bind(this);
        this.deviceChangeHandler = this.deviceChangeHandler.bind(this);
    }

    componentDidMount() {
       ServerApiClient.getAvailableDevices().then(res => {
            // this should almost never happen
            if (this.state.data === undefined || this.state.data.length == 0) {
                this.setState({
                    availableDeviceModalState: AvailableDeviceModalState.No_Available_Devices
                })
            } else {
                this.setState({
                    data: res,
                    availableDeviceModalState: AvailableDeviceModalState.Success
                });
                this.deviceId = this.state.data[0].id;
            }
        });
    }

    selectDevice() {
        ServerApiClient.setAvailableDevice(this.deviceId).then(() => this.props.close());
    }

    deviceChangeHandler(e) {
        this.deviceId = e.target.value;
    }

    getBody() {
        switch(this.state.availableDeviceModalState) {
            case AvailableDeviceModalState.Success:
                return (
                    <form>
                        <div class="form-group">
                            <label for="exampleFormControlSelect1">Devices</label>
                            <select class="form-control" required onChange={this.deviceChangeHandler}>
                                {this.state.data.map(device => <DeviceOption device={device}/>)}
                            </select>
                        </div>
                    </form>
                );
            default:
                return(
                    <h2 class="text-center">{this.state.availableDeviceModalState}</h2>
                );
        }
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.close} aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Select Device</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {this.getBody()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={this.props.close}>
                    Close
                    </Button>
                    <Button variant="primary" onClick={this.selectDevice}>
                    Select
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default AvailableDeviceModal;
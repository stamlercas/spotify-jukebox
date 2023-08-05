import React, { Component } from "react";

class DeviceOption extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <option value={this.props.device.id}>{this.props.device.name}</option>
        );
    }
}

export default DeviceOption;
import React, { Component } from "react";
import ServerApiClient from '../../client/ServerApiClient.js';
import Alert from "../Alert.js";

class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: []
        };
        this.reset = this.reset.bind(this);
    }

    reset() {
        ServerApiClient.reset().then(res => {
            this.setState(prevState => ({
                    alerts: [(res.status == 204 
                        ? <Alert type="success" text="App reset successfully!"/>
                        : <Alert type="danger" text="<strong>Woah..</strong> Something went seriously wrong!"/>), prevState.alerts]
            }));
        });
    }

    render() {
        return(
            <div>
                <div id="alerts">{this.state.alerts}</div>
                <ul class="list-group">
                    <li class="list-group-item"><a href="#" onClick={this.reset}>Reset</a></li>
                </ul>
            </div>
        );
    }
}

export default SettingsPage;
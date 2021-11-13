import React, { Component } from "react";
import ServerApiClient from '../../client/ServerApiClient.js';
import Alert from "../Alert.js";
import * as cookies from '../../spotify-viz/util/cookie.js'
import { properties } from "../../properties.js";

class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: []
        };
        this.reset = this.reset.bind(this);
        this.toggleVisualizations = this.toggleVisualizations.bind(this);
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

    toggleVisualizations(event) {
        cookies.set(properties.cookies.visualizationEnabled, event.target.checked);
    }

    render() {
        return(
            <div>
                <div id="alerts">{this.state.alerts}</div>
                <ul class="list-group">
                    <li class="list-group-item"><a href="#" onClick={this.reset}>Reset</a></li>
                    <li class="list-group-item">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="visualization-switch" 
                                checked={cookies.get(properties.cookies.visualizationEnabled) === 'true'}
                                onChange={this.toggleVisualizations} />
                            <label class="custom-control-label" for="visualization-switch">Audio visualizations</label>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }
}

export default SettingsPage;
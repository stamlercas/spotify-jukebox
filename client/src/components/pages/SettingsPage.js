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
        this.toggleAdminMode = this.toggleAdminMode.bind(this);
    }

    reset() {
        ServerApiClient.reset().then(res => {
            let isSuccess = res.status == 204;
            document.getElementById('visualization-switch').setAttribute('disabled', true);
            document.getElementById('admin-mode-switch').setAttribute('disabled', true);
            this.setState(prevState => ({
                    alerts: [(isSuccess
                        ? <Alert type="success" text={`App reset successfully! Return to <a href="/app/${window.location.hash}">home page</a> to set up app.`}/>
                        : <Alert type="danger" text="<strong>Woah..</strong> Something went seriously wrong!"/>), prevState.alerts]
            }));
        });
    }

    toggleVisualizations(event) {
        cookies.set(properties.cookies.visualizationEnabled, event.target.checked);
    }

    toggleAdminMode(event) {
        cookies.set(properties.cookies.administratorMode, event.target.checked);
    }

    render() {
        return(
            <div>
                <div id="alerts">{this.state.alerts}</div>
                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="visualization-switch" 
                                checked={cookies.getBoolean(properties.cookies.visualizationEnabled)}
                                onChange={this.toggleVisualizations} />
                            <label class="custom-control-label" for="visualization-switch">Audio visualizations</label>
                        </div>
                    </li>
                </ul>

                <br />

                <ul class="list-group">
                    <li class="list-group-item">
                        <div class="custom-control custom-switch">
                            <input type="checkbox" class="custom-control-input" id="admin-mode-switch" 
                                checked={cookies.getBoolean(properties.cookies.administratorMode)}
                                onChange={this.toggleAdminMode} />
                            <label class="custom-control-label" for="admin-mode-switch">Administrator mode</label>
                        </div>
                    </li>
                </ul>

                <br />

                { cookies.getBoolean(properties.cookies.administratorMode) &&
                    <ul class="list-group">
                        <li class="list-group-item"><a href={window.location.hash} onClick={this.reset}>Reset</a></li>
                    </ul>
                }
            </div>
        );
    }
}

export default SettingsPage;
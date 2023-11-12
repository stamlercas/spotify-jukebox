import React, { Component } from "react";
import ServerApiClient from '../../client/ServerApiClient.js';
import Alert from "../Alert.js";
import * as cookies from '../../spotify-viz/util/cookie.js'
import { properties } from "../../properties.js";
import ConfirmationModal from "../modal/ConfirmationModal.js";

class SettingsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alerts: [],
            deleteModal: false
        };

        this.delete = this.delete.bind(this);
        this.toggleVisualizations = this.toggleVisualizations.bind(this);
        this.toggleAdminMode = this.toggleAdminMode.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
    }

    delete() {
        ServerApiClient.delete().then(res => {
            document.getElementById('visualization-switch').setAttribute('disabled', true);
            document.getElementById('admin-mode-switch').setAttribute('disabled', true);
            window.location.href = '/';
        }).catch(err => {
            this.setState(prevState => ({
                alerts: [<Alert type="danger" text={`${err.message}`}/>, prevState.alerts]
            }));
            this.closeDeleteModal();
        });
    }

    toggleVisualizations(event) {
        cookies.set(properties.cookies.visualizationEnabled, event.target.checked);
    }

    toggleAdminMode(event) {
        cookies.set(properties.cookies.administratorMode, event.target.checked);
    }

    showDeleteModal() {
        this.setState({deleteModal: true});
    }

    closeDeleteModal() {
        this.setState({deleteModal: false});
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
                        <li class="list-group-item"><button type="button" class="btn btn-link text-danger" onClick={this.showDeleteModal}>Delete</button></li>
                    </ul>
                }

                <ConfirmationModal show={this.state.deleteModal} close={this.closeDeleteModal} message="Are you sure you want to delete this instance?" action={this.delete} />
            </div>
        );
    }
}

export default SettingsPage;
import React, { Component } from "react";
import ServerApiClient from '../../client/ServerApiClient.js';

const PageState = {
    Loading: 'Loading...', 
    Not_Found: 'Artist was not found.', 
    Success: 'Success'
};

class ArtistPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            pageState: PageState.Loading,
            showModal: false
        }
    }

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        });
    }

    componentDidMount() {
        ServerApiClient.getNowPlaying().then(res => 
            this.setState({
                data: res.body,
                pageState: PageState.Success
            }));
    }

    /**
     * Get display based on PlayerState
     */
    getDisplay() {
        switch(this.state.pageState) {
            case PageState.Success:
                return (
                    <div>
                        {JSON.stringify(this.state.data, null, 3)}
                    </div>
                );
            default:
                return (
                    <h2 class="text-center">{this.state.playerState}</h2>
                );
        }
    }

    render() {
        return (
            <div>
                {this.getDisplay()}
            </div>
        )
    }
}

export default ArtistPage;
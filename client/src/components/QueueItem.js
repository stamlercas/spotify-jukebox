import React, { Component } from "react";
import SpotifyPlayerUtils from "../util/SpotifyPlayerUtils";

class QueueItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let item = this.props.item;
        return (
            <div class="queue-item card col-6 col-md-4 col-lg-3 pt-2">
                <img class="card-img-top" src={item.album.images[0].url}></img>
                <div class="card-body">
                    <div class="card-text truncated">
                        <strong>{item.name}</strong><br />
                        {SpotifyPlayerUtils.getArtists(item.artists)}
                    </div>
                </div>
            </div>
        );
    }
}

export default QueueItem;
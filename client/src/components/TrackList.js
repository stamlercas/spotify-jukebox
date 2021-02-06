import React, { Component } from "react";
import TrackListItem from './TrackListItem';

class TrackList extends Component {
    render() {

        return (
            <div>
                <h3>Tracks</h3>
                <div class="list-group-flush">
                    {this.props.tracks.map(track => <TrackListItem track={track}/>)}
                </div>
            </div>
        )
    }
}

export default TrackList;
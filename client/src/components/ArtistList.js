import React, { Component } from "react";
import ArtistListItem from './ArtistListItem';

class ArtistList extends Component {
    render() {

        return (
            <div>
                <h3>Artists</h3>
                <div class="list-group-flush">
                    {this.props.artists.map(artist => <ArtistListItem artist={artist}/>)}
                </div>
            </div>
        )
    }
}

export default ArtistList;
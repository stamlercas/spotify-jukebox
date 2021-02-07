import React, { Component } from "react";
import AlbumListItem from "./AlbumListItem";

class AlbumList extends Component {
    render() {
        let showArtist = this.props.showArtist == true;
        return (
            <div>
                <h3>Albums</h3>
                <div class="list-group-flush">
                    {this.props.albums.map(album => <AlbumListItem album={album} showArtist={showArtist}/>)}
                </div>
            </div>
        )
    }
}

export default AlbumList;
import React, { Component } from "react";
import AlbumListItem from "./AlbumListItem";

class AlbumList extends Component {
    render() {

        return (
            <div>
                <h3>Albums</h3>
                <div class="list-group-flush">
                    {this.props.albums.map(album => <AlbumListItem album={album}/>)}
                </div>
            </div>
        )
    }
}

export default AlbumList;
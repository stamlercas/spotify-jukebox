import React, { Component } from "react";

class AlbumListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let album = this.props.album;
        return (
            <a href={"/album/" + album.id} class="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col-3">
                        {album.images[album.images.length - 1] !== undefined &&
                            <span>
                                <img src={album.images[album.images.length - 1].url} class="img-fluid list-img"/>
                            </span>
                        }
                    </div>
                    <div class="col-9 justify-content-center align-self-center">
                            <div>{album.name}</div>
                            <div>{album.release_date.substring(0, 4)}</div>
                    </div>
                </div>
            </a>
        );
    }
}

export default AlbumListItem;
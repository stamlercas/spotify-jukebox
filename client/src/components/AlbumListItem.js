import React, { Component } from "react";
import { Link } from "react-router-dom";

/**
 * Component to render an album list item.
 * An optional prop of showArtist can be passed in as true to display the first artist credited on the album.
 */
class AlbumListItem extends Component {
    constructor(props) {
        super(props);

        this.renderArtist = this.renderArtist.bind(this);
    }

    renderArtist() {
        return (
            <span>{this.props.album.artists[0].name} <i class="bi bi-dot"></i> </span> 
        );
    }

    render() {
        let album = this.props.album;
        return (
            <Link to={"/album/" + album.id} className="list-group-item list-group-item-action">
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
                            <div>{this.props.showArtist && 
                                this.renderArtist()
                            }{album.release_date.substring(0, 4)}</div>
                    </div>
                </div>
            </Link>
        );
    }
}

export default AlbumListItem;
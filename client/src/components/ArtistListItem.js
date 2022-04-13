import React, { Component } from "react";
import { Link } from "react-router-dom";

class ArtistListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let artist = this.props.artist;
        return (
            <Link to={{pathname: `/artist/${artist.id}`, hash: window.location.hash}} className="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col-3 justify-content-center align-self-center">
                        {artist.images[artist.images.length - 1] !== undefined &&
                            <span>
                                <img src={artist.images[artist.images.length - 1].url} class="img-fluid list-img"/>
                            </span>
                        }
                    </div>
                    <div class="col-9 justify-content-center align-self-center">
                            {artist.name}
                    </div>
                </div>
            </Link>
        );
    }
}

export default ArtistListItem;
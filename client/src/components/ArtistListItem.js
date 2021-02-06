import React, { Component } from "react";

class ArtistListItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let artist = this.props.artist;
        return (
            <a href={"/artist/" + artist.id} class="list-group-item list-group-item-action">
                <div class="row">
                    <div class="col-3">
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
            </a>
        );
    }
}

export default ArtistListItem;
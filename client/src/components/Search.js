import React, { Component } from "react";
import ArtistListItem from "./ArtistListItem.js";
import TrackListItem from "./TrackListItem.js";
import ServerApiClient from '../client/ServerApiClient.js';

const queryStringParser = require('query-string');

const SearchState = {
    Loading: 'Loading...',
    No_Query: 'No query was found.',
    Search_Success: 'Search successful.'
}

class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {},
            searchState: SearchState.Loading
        };
    }
    

    componentDidMount() {
        if (!this.props.location.search) {
            this.setState({searchState: SearchState.No_Query});
            return;
        }

        let queryParameters = queryStringParser.parse(this.props.location.search);
        ServerApiClient.search(queryParameters.q).then(res => {
            let status = res.statusCode;
            this.setState({
                data: res,
                searchState: SearchState.Search_Success
            });
        });
    }

    render() {
        switch(this.state.searchState) {
            case SearchState.Loading:
            case SearchState.No_Query:
                return (
                    <h2 class="text-center">{this.state.searchState}</h2>
                );
            case SearchState.Search_Success:
                return (
                    <div>
                        {this.state.data.artists.items.length > 0 &&
                        <div>
                            <h3>Artists</h3>
                            <ul class="list-group list-group-flush">
                                {this.state.data.artists.items.map(artist => <ArtistListItem artist={artist}/>)}
                            </ul>
                            <br />
                        </div>
                        }
                        {this.state.data.tracks.items.length > 0 &&
                        <div>
                            <h3>Tracks</h3>
                            <ul class="list-group list-group-flush">
                                {this.state.data.tracks.items.map(track => <TrackListItem track={track}/>)}
                            </ul>
                        </div>
                        }
                    </div>
                );
        }
    }
}

export default Search;
import React, { Component } from "react";
import ArtistList from "../ArtistList";
import TrackList from "../TrackList";
import ServerApiClient from '../../client/ServerApiClient.js';

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
                            <ArtistList artists={this.state.data.artists.items}/>
                            <br />
                        </div>
                        }
                        {this.state.data.tracks.items.length > 0 &&
                        <div>
                            <TrackList tracks={this.state.data.tracks.items}/>
                        </div>
                        }
                    </div>
                );
        }
    }
}

export default Search;
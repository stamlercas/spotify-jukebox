import React, { Component } from "react";
import AlbumList from '../AlbumList';
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

        this.search = this.search.bind(this);
        this.getQueryParameters = this.getQueryParameters.bind(this);
        this.updateSearchValue = this.updateSearchValue.bind(this);
    }
    

    componentDidMount() {
        this.updateSearchValue();
        if (!this.props.location.search) {
            this.setState({searchState: SearchState.No_Query});
            return;
        }
        this.search();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.updateSearchValue();
            this.setState({searchState: SearchState.Loading});
            this.search();
        }
    }

    componentWillUnmount() {
        document.getElementById('search').value = '';
    }

    search() {
        let queryParameters = this.getQueryParameters();
        ServerApiClient.search(queryParameters.q).then(res => {
            let status = res.statusCode;
            this.setState({
                data: res,
                searchState: SearchState.Search_Success
            });
        });
    }

    getQueryParameters() {
        return queryStringParser.parse(this.props.location.search);
    }

    /**
     * For consistency, when component updates and mounts, we should make sure the search input field has the current value
     */
    updateSearchValue() {
        document.getElementById('search').value = this.getQueryParameters().q;
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
                        {this.state.data.albums.items.length > 0 &&
                        <div>
                            <AlbumList albums={this.state.data.albums.items} showArtist={true}/>
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
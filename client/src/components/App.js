import React, { Component } from "react";
import {
  BrowserRouter,
  Route,
  Switch
} from "react-router-dom";
import NowPlaying from './pages/NowPlaying';
import Search from './pages/Search';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import SettingsPage from "./pages/SettingsPage";
import StickyTrackDisplay from "./StickyTrackDisplay";
import { properties } from '../properties.js';
import socketIOClient from "socket.io-client";
import ObjectUtils from "../util/ObjectUtils";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}  // downstream component expects to consume all data, not just body
    }
  }

  componentDidMount() {
    const socket = socketIOClient(properties.serverUrl + ":3001");
        socket.on("NowPlaying", response => {
            let data = JSON.parse(response);
            if (!ObjectUtils.isEmpty(data.body)) {
              this.setState({data: data});
            }
        });
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <Switch>
            <Route path="/settings" component={SettingsPage} />
            <Route path="/search" component={Search}/>
            <Route path="/artist/:id" component={ArtistPage} />
            <Route path="/album/:id" component={AlbumPage} />
            <Route path="/">
              <NowPlaying data={this.state.data} location={this.props.location} />
            </Route>
          </Switch>
        </BrowserRouter>
        {(window.location.pathname !== '/' && !ObjectUtils.isEmpty(this.state.data.body)) &&
          <StickyTrackDisplay track={this.state.data.body.item} />
        }
      </div>
    );
  }
}

export default App;
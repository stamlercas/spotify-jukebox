import React, { Component } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Switch
} from "react-router-dom";
import NowPlaying from './pages/NowPlaying';
import Search from './pages/Search';
import AlbumPage from './pages/AlbumPage';
import ArtistPage from './pages/ArtistPage';
import SettingsPage from "./pages/SettingsPage";
import StickyTrackDisplay from "./StickyTrackDisplay";
import Header from './Header';
import { properties } from '../properties.js';
import socketIOClient from "socket.io-client";
import ObjectUtils from "../util/ObjectUtils";
import * as cookies from '../spotify-viz/util/cookie.js';

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
              this.setState({data: data.body.item});
            }
        });
  }

  render() {
    return (
        <BrowserRouter>
          <Header />
          <main role="main" class="container app-container">
            <Switch>
              <Route path="/settings" component={SettingsPage} />
              <Route path="/search" component={Search}/>
              <Route path="/artist/:id" component={ArtistPage} />
              <Route path="/album/:id" component={AlbumPage} />
              <Route path="/">
                <NowPlaying data={this.state.data} location={this.props.location} />
              </Route>
            </Switch>
            {(window.location.pathname !== '/' && !ObjectUtils.isEmpty(this.state.data)) &&
              <StickyTrackDisplay track={this.state.data} />
            }
            { cookies.getBoolean(properties.cookies.administratorMode) &&
              <h2>
                <Link to="/settings"><i class="bi bi-gear text-white settings-icon"></i></Link>
              </h2>
            }
          </main>
        </BrowserRouter>
    );
  }
}

export default App;
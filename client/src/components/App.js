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

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/settings" component={SettingsPage} />
          <Route path="/search" component={Search}/>
          <Route path="/artist/:id" component={ArtistPage} />
          <Route path="/album/:id" component={AlbumPage} />
          <Route path="/" component={NowPlaying}/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
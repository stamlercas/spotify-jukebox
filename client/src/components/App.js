import React, { Component } from "react";
import {
  BrowserRouter,
  Route,
  Switch
} from "react-router-dom";
import NowPlaying from './pages/NowPlaying';
import Search from './pages/Search';
import ArtistPage from './pages/ArtistPage';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/search" component={Search}/>
          <Route path="/artist/:id" component={ArtistPage} />
          <Route path="/" component={NowPlaying}/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
import React, { Component } from "react";
import {
  BrowserRouter,
  Route,
  Switch
} from "react-router-dom";
import NowPlaying from './NowPlaying';
import Search from './Search';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/search" component={Search}/>
          <Route path="/" component={NowPlaying}/>
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
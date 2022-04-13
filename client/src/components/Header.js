import { Component } from "react";
import { Link, withRouter } from 'react-router-dom';

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: ""
        };

        this.setQuery = this.setQuery.bind(this);
        this.search = this.search.bind(this);
    }

    setQuery(event) {
        this.setState({query: event.target.value});
    }

    search(event) {
        event.preventDefault();
        // action="/search"
        this.props.history.push({
            pathname: "/search",
            search: "?q=" + this.state.query,
            hash: window.location.hash
        });
    }

    render() {
        return(
            <header>
                <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                    <Link className="navbar-brand home-icon" to={{ pathname: "/", hash: window.location.hash }}><i class="bi bi-house-door"></i></Link>
                    <div style={{paddingLeft: "15px", flex: "1"}}>
                    <div id="navbarCollapse" style={{width: "100%"}} class="">
                        <form class="d-flex" onSubmit={this.search}>
                        <input id="search" class="form-control me-2" type="search" placeholder="Search" aria-label="Search" required onChange={this.setQuery}/>
                        </form>
                    </div>
                    </div>
                </nav>
            </header>
        );
    }
}

export default withRouter(Header);
import { Component } from "react";
import { Link, withRouter } from 'react-router-dom';
import ShareModal from "./modal/ShareModal";

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            showModal: false
        };

        this.setQuery = this.setQuery.bind(this);
        this.search = this.search.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
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

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        });
    }

    render() {
        return(
            <header>
                <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                    <Link className="navbar-brand home-icon" to={{ pathname: "/", hash: window.location.hash }}><i class="bi bi-house-door"></i></Link>
                    <div style={{paddingLeft: "15px", flex: "1", paddingRight:"10px"}}>
                        <div id="navbarCollapse" style={{width: "100%"}} class="">
                            <form class="d-flex" onSubmit={this.search}>
                            <input id="search" class="form-control me-2" type="search" placeholder="Search" aria-label="Search" required onChange={this.setQuery}/>
                            </form>
                        </div>
                    </div>
                    <i onClick={this.toggleModal} class="bi bi-share header-icon"></i>
                </nav>
                <ShareModal show={this.state.showModal} close={this.toggleModal}/>
            </header>
        );
    }
}

export default withRouter(Header);
import React, { Component } from "react";

class Alert extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div class={"alert alert-" + this.props.type + " alert-dismissible fade show"} role="alert">
                {this.props.text}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        );
    }
}

export default Alert;
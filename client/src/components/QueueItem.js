import React, { Component } from "react";

class QueueItem extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let item = this.props.item;
        let width = 50;
        let offset = 33;   // how much to stagger each image
        return (
            <div class="queue-item" style={{marginLeft: offset * (this.props.positiveIndex - 1), zIndex: this.props.positiveIndex * -1}}>
                <img class="" style={{width: width}} src={item.album.images[item.album.images.length - 1].url}></img>
            </div>
        );
    }
}

export default QueueItem;
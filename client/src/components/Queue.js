import React, { Component } from "react";
import QueueItem from "./QueueItem";

class Queue extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let queue = this.props.queue;
        let maxQueueSize = 4;
        return (
            <div class="queue-container">
                {this.props.queue.queue.slice(0, maxQueueSize).map((item, index) => <QueueItem item={item} positiveIndex={index + 1}/>)}
            </div>
        );
    }
}

export default Queue;
import React, { Component } from "react";
import QueueItem from "./QueueItem";
import ServerApiClient from "../client/ServerApiClient";
import ObjectUtils from "../util/ObjectUtils";

class Queue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            queue: {}
        };

        this.updateQueue = setInterval(() => this.getQueue(), 2000);

        this.getQueue = this.getQueue.bind(this);
    }

    getQueue() {
        ServerApiClient.getQueue().then(res => this.setState({queue: res}))
    }

    componentDidMount() {
        this.getQueue();
    }

    componentWillUnmount() {
        clearInterval(this.updateQueue);
    }

    render() {
        let queue = this.state.queue;
        let maxQueueSize = 4;
        return (
            <div>
            { ObjectUtils.isEmpty(this.state.queue.queue)
                ? 
                    <div class="text-center p-1">There is nothing upcoming in the queue.</div>
                : 
                    <div class="queue-container row flex-row flex-nowrap">
                        {this.state.queue.queue.slice(0, maxQueueSize).map((item, index) => <QueueItem item={item} positiveIndex={index + 1}/>)}
                    </div>
            }
            </div>
        );
    }
}

export default Queue;
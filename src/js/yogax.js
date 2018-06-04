import React, { Component } from "react";

class Yogax extends Component {
    constructor() {
        super();
        const field = new Array(10);
        for (let i = 0; i < 10; i++) {
            field[i] = new Array(10);
        }

        this.state = {
            field
        };
    }


    backtrackAllShapes() {

    }

    render() {
        return (
            <div></div>
        );
    }
}

export {
    Yogax
};

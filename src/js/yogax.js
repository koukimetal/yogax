import React, { Component } from "react";
import {Record, Set, List, fromJS} from 'immutable';
import {generateAllShapes} from "./shape";

const PartState = {
    NONE: 0,
    OCCUPIED: 1,
    PENDING: 2,
};

Object.freeze(PartState);

class Part extends Record({state: PartState.NONE, player: -1}, 'Part') {
}

const BOARD_SIZE = 14;
const PART_WIDTH = 40;
const BLOCK_LENGTH = 5;


class Yogax extends Component {

    static getField(size) {
        const field = new Array(size);
        for (let i = 0; i < size; i++) {
            field[i] = new Array(size);
            for (let j = 0; j < size; j++) {
                field[i][j] = new Part();
            }
        }
        return field;
    }



    constructor() {
        super();
        const initialField = Yogax.getField(BOARD_SIZE);

        const field = fromJS(initialField);
        const initialShapes = generateAllShapes(BLOCK_LENGTH);

        initialShapes.get(0).draw();

        this.shapes = [initialShapes, initialShapes];

        this.state = {
            field,
            shapeCursor: 0,
            player: 0,
        };
    }


    backtrackAllShapes() {

    }

    handleMoveCursor(move) {
        this.setState({shapeCursor: this.state.shapeCursor + move});
    }

    render() {
        let playFields = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                playFields.push(<rect
                    key={y * BOARD_SIZE + x}
                    x={x * PART_WIDTH}
                    y={y * PART_WIDTH}
                    width={PART_WIDTH}
                    height={PART_WIDTH}
                    style={{
                        fill: 'gray',
                        stroke: 'white',
                        strokeWidth: 2,
                    }}
                />);
            }
        }

        const parts = Yogax.getField(BLOCK_LENGTH);
        this.shapes[this.state.player].get(this.state.shapeCursor).seq.forEach(co => {
            parts[co.y][co.x] = new Part({
                state: PartState.OCCUPIED,
                player: this.state.player,
            })
        });

        let blockFields = [];
        for (let y = 0; y < BLOCK_LENGTH; y++) {
            for (let x = 0; x < BLOCK_LENGTH; x++) {
                blockFields.push(<rect
                    key={y * BLOCK_LENGTH + x}
                    x={x * PART_WIDTH}
                    y={y * PART_WIDTH}
                    width={PART_WIDTH}
                    height={PART_WIDTH}
                    style={{
                        fill: parts[y][x].state === PartState.NONE ? 'gray': 'blue',
                        stroke: 'white',
                        strokeWidth: 2,
                    }}
                />);
            }
        }

        return (
            <div>
                <svg width={PART_WIDTH * BOARD_SIZE} height={PART_WIDTH * BOARD_SIZE}>
                    {playFields}
                </svg>
                <svg width={PART_WIDTH * BLOCK_LENGTH} height={PART_WIDTH * BLOCK_LENGTH}>
                    {blockFields}
                </svg>
                <div>
                    Player: {this.state.player + 1}
                </div>
                <button onClick={() => this.handleMoveCursor(1)}>Next</button>
                <button onClick={() => this.handleMoveCursor(-1)}>Prev</button>
            </div>
        );
    }
}

export {
    Yogax
};

import React, { Component } from "react";
import {fromJS, Set} from 'immutable';
import {generateAllShapes} from "./shape";
import {Part, PartState, Coordinate} from "./common";

const VEC_CHOOSE = Object.freeze([-1, 0, 1]);
const VEC_PUT = Object.freeze([0]);
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

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
        const playField = fromJS(Yogax.getField(BOARD_SIZE));
        const initialShapes = generateAllShapes(BLOCK_LENGTH);

        this.shapes = [initialShapes, initialShapes];

        let partsField = Yogax.getField(BOARD_SIZE * 2);

        for (let player = 0; player < 2; player++) {
            const playerShapes = this.shapes[player];

            let shapeCursor = 0;
            for (let y = 0; y < partsField.length && shapeCursor < playerShapes.size; y++) {
                for (let x = 0; x < partsField[y].length && shapeCursor < playerShapes.size; x++) {
                    const seq = playerShapes.get(shapeCursor).seq;
                    if (Yogax.locatable(x, y, VEC_CHOOSE, VEC_CHOOSE, seq.toJS(), partsField)) {
                        seq.forEach(co => {
                            partsField[co.y + y][co.x + x] = new Part({state: PartState.OCCUPIED, player});
                        });
                        shapeCursor++;
                    }
                }
            }
        }

        partsField = fromJS(partsField);

        this.state = {
            playField,
            partsField,
            selectedParts: Set(),
            choiceMouseX: -1, choiceMouseY: -1,
            shapeCursor: 0,
            player: 0,
        };
    }

    handleMoveCursor(move) {
        this.setState({shapeCursor: this.state.shapeCursor + move});
    }

    static locatable(baseX, baseY, vecX, vecY, seq, field) {
        for (let i = 0; i < seq.length; i++) {
            const co = seq[i];
            for (let dx of vecX) {
                for (let dy of vecY) {
                    const cx = co.x + dx + baseX;
                    const cy = co.y + dy + baseY;

                    if (cx < 0 || field.length <= cx || cy < 0 || field.length <= cy) {
                        return false;
                    }

                    if (field[cy][cx].state === PartState.OCCUPIED) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    static getStrokeDasharray(x, y, field, edgeLength) {
        if (field[y][x].player === -1) {
            return [];
        }

        const connection = [];
        for (let i = 0; i < DX.length; i++) {
            const cx = x + DX[i];
            const cy = y + DY[i];

            if (cy < 0 || field.length <= cy || cx < 0 || field[cy].length <= cx) {
                continue;
            }

            if (field[cy][cx].player === field[y][x].player) {
                connection.push(i);
            }
        }

        let draw = true;
        const dashLine = [0].concat(Array(5).fill(edgeLength / 5)).concat([0]);
        const result = [];
        for (let i = 0; i < DX.length;) {
            if ((connection.includes(i) && draw) || (!connection.includes(i) && !draw)) {
                if (draw) { // if the block is connected to the direction, we put dash line
                    result.push(...dashLine);
                } else {
                    result.push(edgeLength);
                }
                i++;
            } else {
                result.push(0);
            }
            draw = !draw;
        }

        // compress
        const optimized = [];
        for (let i = 0; i < result.length;) {
            if ( // 20, 0, 20 -> 40
                (optimized.length > 0 && i + 1 < result.length) &&
                optimized[optimized.length - 1] > 0 &&
                optimized[optimized.length - 1] % edgeLength === 0 &&
                result[i] === 0 &&
                result[i + 1] === edgeLength
            ) {
                optimized[optimized.length - 1] += result[i + 1];
                i += 2;
            } else if ( // 0, 0, 0 -> 0
                (optimized.length > 0 && i + 1 < result.length) &&
                optimized[optimized.length - 1] === 0 &&
                result[i] === 0 &&
                result[i + 1] === 0
            ) {
                i += 2;
            } else {
                optimized.push(result[i]);
                i++;
            }
        }

        return optimized;
    }

    static inBorder(x, y, size) {
        return 0 <= x && x < size && 0 <= y && y < size;
    }

    clickChoicePart(x, y) {
        const field = this.state.partsField.toJS();
        let selected = Set();
        if (field[y][x].state !== PartState.NONE) {
            const start = new Coordinate({x, y});
            selected = selected.add(start);
            const queue = [];
            queue.push(start);
            while (queue.length > 0) {
                const s = queue.pop();
                for (let i = 0; i < DX.length; i++) {
                    const nc = new Coordinate({x: s.x + DX[i], y: s.y + DY[i]});
                    if (Yogax.inBorder(nc.x, nc.y, field.length) &&
                        field[nc.y][nc.x].player === field[y][x].player &&
                        !selected.includes(nc)
                    ) {
                        queue.push(nc);
                        selected = selected.add(nc);
                    }
                }
            }
            this.setState({selectedParts: selected});
        }

    }

    render() {
        let playCanvas = [];
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                playCanvas.push(<rect
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

        const partsField = this.state.partsField.toJS();
        let partsCanvas = [];
        for (let y = 0; y < partsField.length; y++) {
            for (let x = 0; x < partsField[y].length; x++) {
                const strokeDasharray = Yogax.getStrokeDasharray(x, y, partsField, PART_WIDTH/2);
                let fillColor = 'gray';

                if (this.state.selectedParts.includes(new Coordinate({x, y}))) {
                    fillColor = 'green';
                } else if (partsField[y][x].player === 0) {
                    fillColor = 'blue';
                } else if (partsField[y][x].player === 1) {
                    fillColor = 'red';
                }

                partsCanvas.push(<rect
                    key={y * partsField.length + x}
                    x={x * PART_WIDTH/2}
                    y={y * PART_WIDTH/2}
                    width={PART_WIDTH/2}
                    height={PART_WIDTH/2}
                    onClick={() => this.clickChoicePart(x, y)}
                    style={{
                        fill: fillColor,
                        stroke: 'white',
                        strokeWidth: 2,
                        strokeDasharray,
                    }}
                />);
            }
        }

        return (
            <div>
                <svg width={PART_WIDTH * BOARD_SIZE} height={PART_WIDTH * BOARD_SIZE}>
                    {playCanvas}
                </svg>
                <svg width={PART_WIDTH * BOARD_SIZE} height={PART_WIDTH * BOARD_SIZE}>
                    {partsCanvas}
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

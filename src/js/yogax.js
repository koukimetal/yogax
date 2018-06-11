import React, { Component } from "react";
import {fromJS, Set} from 'immutable';
import {generateAllShapes, Shape} from "./shape";
import {Part, PartState, Coordinate} from "./common";

// todo restrict put only for corner touching and put start point
// todo should have border

const START_POINT = Set().add(new Coordinate({x: 4, y: 4})).add(new Coordinate({x: 9, y: 9}));

const VEC_CHOOSE = Object.freeze([-1, 0, 1]);
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

const BOARD_SIZE = 14;
const PART_WIDTH = 40;
const PART_LENGTH = 5;

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
        const initialShapes = generateAllShapes(PART_LENGTH);

        let partsField = Yogax.getField(BOARD_SIZE * 2);

        let groupId = 0;
        for (let player = 0; player < 2; player++) {
            let shapeCursor = 0;
            for (let y = 0; y < partsField.length && shapeCursor < initialShapes.size; y++) {
                for (let x = 0; x < partsField[y].length && shapeCursor < initialShapes.size; x++) {
                    const seq = initialShapes.get(shapeCursor).seq;
                    if (Yogax.locatableForChoice(x, y, seq.toJS(), partsField)) {
                        seq.forEach(co => {
                            partsField[co.y + y][co.x + x] = new Part({state: PartState.OCCUPIED, player, groupId});
                        });
                        groupId++;
                        shapeCursor++;
                    }
                }
            }
        }

        partsField = fromJS(partsField);

        this.state = {
            playField,
            partsField,
            chosenShape: null,
            chosenGroupId: -1,
            pendingParts: Set(),
            selectedParts: Set(),
            shapeCursor: 0,
            player: 0,
            turn: 0,
        };
    }

    handleMoveCursor(move) {
        this.setState({shapeCursor: this.state.shapeCursor + move});
    }

    static locatableForChoice(baseX, baseY, seq, field) {
        for (let i = 0; i < seq.length; i++) {
            const co = seq[i];
            for (let dx of VEC_CHOOSE) {
                for (let dy of VEC_CHOOSE) {
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

            if (!Yogax.inBorder(cx, cy, field.length)) {
                continue;
            }

            if (field[cy][cx].groupId === field[y][x].groupId) {
                connection.push(i);
            }
        }

        let draw = true;
        const dashLine = [0].concat(Array(5).fill(edgeLength / 5)).concat([0]);
        const result = [];
        for (let i = 0; i < DX.length;) {
            if ((connection.includes(i) && draw) || (!connection.includes(i) && !draw)) {
                if (draw) { // if the part is connected to the direction, we put dash line
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
        const player = this.state.player;
        const field = this.state.partsField.toJS();
        let selected = Set();

        if (field[y][x].state === PartState.NONE || field[y][x].player !== player) {
            return;
        }

        const chosenGroupId = field[y][x].groupId;

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

        this.setState({
            chosenGroupId,
            selectedParts: selected,
            chosenShape: new Shape({seq: selected.toList()}).getCanonical(),
        });
    }

    drawableOnPlayField(baseX, baseY, seq) {
        const playField = this.state.playField.toJS();
        for (let i = 0; i < seq.length; i++) {
            const co = seq[i];
            const x = baseX + co.x;
            const y = baseY + co.y;

            if (!Yogax.inBorder(x, y, playField.length) || playField[y][x].state !== PartState.NONE) {
                return false;
            }
        }
        return true;
    }

    onMouseBoard(x, y) {
        const shape = this.state.chosenShape;
        if (!shape) {
            return;
        }

        const drawable = this.drawableOnPlayField(x, y, shape.seq.toJS());

        if (drawable) {
            const pendingParts = shape.seq.map(co => {
                return new Coordinate({x: co.x + x, y: co.y + y});
            }).toSet();
            this.setState({pendingParts});
        }
    }

    rotateChosenShape(action) {
         const shape = this.state.chosenShape;
         if (!shape) {
             return;
         }

         let pendingParts = this.state.pendingParts;
         const ppx = pendingParts.map(co => co.x).reduce((min, val) => Math.min(min, val));
         const ppy = pendingParts.map(co => co.y).reduce((min, val) => Math.min(min, val));
         let chosenShape;

         if (action === 'turnRight') {
             chosenShape = shape.rotate90();
         } else if (action === 'turnLeft') {
             chosenShape = shape.rotate90().rotate90().rotate90();
         } else if (action === 'flip') {
             chosenShape = shape.flip();
         }

         const drawable = this.drawableOnPlayField(ppx, ppy, chosenShape.seq.toJS());

         if (drawable) {
             pendingParts = chosenShape.seq.map(co => {
                 return new Coordinate({x: co.x + ppx, y: co.y + ppy});
             }).toSet();
             this.setState({pendingParts, chosenShape});
         } else {
             this.setState({chosenShape});
         }
    }

    putPart(x, y) {
        const groupId = this.state.chosenGroupId;
        if (groupId < 0) { // not chosen
            return;
        }

        // check locatable
        const player = this.state.player;
        let pendingParts = this.state.pendingParts;
        let playFieldJS = this.state.playField.toJS();
        let locatable = true;
        pendingParts.forEach(co => {
            if (playFieldJS[co.y][co.x].state !== PartState.NONE) {
                locatable = false;
            }
            for (let i = 0; i < DX.length; i++) {
                const nx = co.x + DX[i];
                const ny = co.y + DY[i];
                if (!Yogax.inBorder(nx, ny, BOARD_SIZE)) {
                    continue;
                }
                if (playFieldJS[ny][nx].player === player) {
                    locatable = false;
                }
            }
        });

        const turn = this.state.turn;

        if (turn < 2) {
            let includeStart = false;
            pendingParts.forEach(co => {
                includeStart = includeStart || START_POINT.includes(co);
            });
            locatable = locatable && includeStart;
        }

        // todo center point
        if (!locatable) {
            return;
        }

        pendingParts.forEach(co => {
            playFieldJS[co.y][co.x] = new Part({state: PartState.OCCUPIED, player, groupId});
        });

        // Clear from chosen board
        let partsFieldJS = this.state.partsField.toJS();
        this.state.selectedParts.forEach(co => {
            partsFieldJS[co.y][co.x] = new Part();
        });

        this.setState({
            turn: turn + 1,
            player: (turn + 1) % 2,
            playField: fromJS(playFieldJS),
            pendingParts: Set(),
            selectedParts: Set(),
            partsField: fromJS(partsFieldJS),
            chosenGroupId: -1,
            chosenShape: null,
        });
    }

    render() {
        const playField = this.state.playField;
        const playFieldJS = playField.toJS();

        let playCanvas = [];
        const pendingParts = this.state.pendingParts;
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                const co = new Coordinate({x, y});

                let fillColor = 'gray';

                if (START_POINT.includes(co)) {
                    fillColor = 'orange';
                }

                if (pendingParts.includes(co)) {
                    fillColor = 'purple';
                }

                const strokeDasharray = Yogax.getStrokeDasharray(x, y, playFieldJS, PART_WIDTH);

                if (playFieldJS[y][x].player === 0) {
                    fillColor = 'blue';
                } else if (playFieldJS[y][x].player === 1) {
                    fillColor = 'red';
                }

                playCanvas.push(<rect
                    key={y * BOARD_SIZE + x}
                    x={x * PART_WIDTH}
                    y={y * PART_WIDTH}
                    width={PART_WIDTH}
                    height={PART_WIDTH}
                    onMouseOver={() => this.onMouseBoard(x, y)}
                    onClick={() => this.putPart(x, y)}
                    style={{
                        fill: fillColor,
                        stroke: 'white',
                        strokeWidth: 2,
                        strokeDasharray,
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
                <button onClick={() => this.rotateChosenShape('turnRight')}>Rotate Right</button>
                <button onClick={() => this.rotateChosenShape('turnLeft')}>Rotate Left</button>
                <button onClick={() => this.rotateChosenShape('flip')}>Flip</button>
            </div>
        );
    }
}

export {
    Yogax
};

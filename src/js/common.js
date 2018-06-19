import React from "react";
import {Record, Set} from 'immutable';

const PartState = {
    NONE: 0,
    OCCUPIED: 1,
    PENDING: 2,
};

Object.freeze(PartState);

class Part extends Record({state: PartState.NONE, player: -1, groupId: -1}, 'Part') {}
const Coordinate = Record({x: 0, y: 0}, 'Coordinate');
class PendingProperty extends Record({x: -1, y: -1, shape: null}, 'PendingProperty') {}

const BOARD_SIZE = 14;
const PART_LENGTH = 5;
const PART_WIDTH = 40;
const VEC_CHOOSE = Object.freeze([-1, 0, 1]);
const START_POINT = Set().add(new Coordinate({x: 4, y: 4})).add(new Coordinate({x: 9, y: 9}));
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

const locatableForChoice = (baseX, baseY, seq, field) => {
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
};

const inBorder = (x, y, size) => {
    return 0 <= x && x < size && 0 <= y && y < size;
};

const getStrokeDasharray = (x, y, field, edgeLength) => {
    if (field[y][x].player === -1) {
        return [];
    }

    const connection = [];
    for (let i = 0; i < DX.length; i++) {
        const cx = x + DX[i];
        const cy = y + DY[i];

        if (!inBorder(cx, cy, field.length)) {
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
        if (connection.includes(i) && draw) {
            result.push(...dashLine);
            i++;
        } else if (!connection.includes(i) && draw) {
            result.push(edgeLength);
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
};

const getField = (size) => {
    const field = new Array(size);
    for (let i = 0; i < size; i++) {
        field[i] = new Array(size);
        for (let j = 0; j < size; j++) {
            field[i][j] = new Part();
        }
    }
    return field;
};

export {
    Part,
    PartState,
    Coordinate,
    BOARD_SIZE,
    PART_LENGTH,
    PART_WIDTH,
    getStrokeDasharray,
    START_POINT,
    inBorder,
    locatableForChoice,
    DX,
    DY,
    getField,
}
import React from "react";
import {Record} from 'immutable';

const PartState = {
    NONE: 0,
    OCCUPIED: 1,
    PENDING: 2,
};

Object.freeze(PartState);

class Part extends Record({state: PartState.NONE, player: -1}, 'Part') {
}
const Coordinate = Record({x: 0, y: 0}, 'Coordinate');

export {
    Part,
    PartState,
    Coordinate,
}
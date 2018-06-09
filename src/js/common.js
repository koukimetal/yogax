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

export {
    Part,
    PartState,
}
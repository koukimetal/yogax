import {Part, PartState, Coordinate, BOARD_SIZE, PART_LENGTH} from "./common";
import {fromJS, Set, List} from 'immutable';
import {Yogax} from "./yogax";
import {generateAllShapes} from "./shape";

const TYPES = {
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

const playField = (state, action) => {
    if (typeof state === 'undefined') {
        return fromJS(getField(BOARD_SIZE));
    }

    return state;
};

const partsField = (state, action) => {
    if (typeof state === 'undefined') {
        const initialShapes = generateAllShapes(PART_LENGTH);
        let partsField = getField(BOARD_SIZE * 2);

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

        return fromJS(partsField);
    }

    if (action.type === 'SELECT_PARTS') {

    }


    return state;
};

const chosenShape = (state = null, action) => {
    return state;
};

const chosenGroupId = (state = -1, action) => {
    return state;
};

const pendingParts = (state = Set(), action) => {
    return state;
};
const selectedParts = (state = Set(), action) => {
    return state;
};
const shapeCursor = (state = 0, action) => {
    return state;
};
const player = (state = 0, action) => {
    return state;
};
const turn = (state = 0, action) => {
    return state;
};
const alreadyPut = (state = 0, action) => {
    if (typeof state === 'undefined') {
        return List().push(0).push(0);
    }
    return state;
};

import {Part, PartState, BOARD_SIZE, PART_LENGTH, locatableForChoice} from "../common";
import {fromJS, List} from 'immutable';
import partsManager from "./PartsManager";
import { combineReducers } from 'redux';

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

    if (action.type === 'PUT_PART') {
        const pendingParts = action.pendingParts;

        const field = state.toJS();

        pendingParts.forEach(co => {
            field[co.y][co.x] = new Part({state: PartState.OCCUPIED, player: action.player, groupId: action.groupId});
        });

        return fromJS(field);
    }

    return state;
};

const partsField = (state, action) => {
    if (typeof state === 'undefined') {
        let partsField = getField(BOARD_SIZE * 2);

        const groupIdMax = partsManager.getNumOfGroupId();

        let groupId = 0;
        for (let y = 0; y < partsField.length && groupId < groupIdMax; y++) {
            for (let x = 0; x < partsField[y].length && groupId < groupIdMax; x++) {
                const seq = partsManager.getShape(groupId).seq;
                if (locatableForChoice(x, y, seq.toJS(), partsField)) {
                    seq.forEach(co => {
                        partsField[co.y + y][co.x + x] = new Part({
                            state: PartState.OCCUPIED,
                            player: partsManager.getPlayer(groupId),
                            groupId
                        });
                    });
                    groupId++;
                }
            }
        }

        return fromJS(partsField);
    }

    if (action.type === 'PUT_PART') {
        const field = state.toJS();

        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[y].length; x++) {

                if (field[y][x].groupId === action.groupId) {
                    field[y][x] = new Part();
                }
            }
        }

        return fromJS(field);
    }

    return state;
};

const selectedShape = (state = null, action) => {
    if (action.type === 'SELECT_PART') {
        return partsManager.getShape(action.groupId);
    } else if (action.type === 'PUT_PART' || action.type === 'PASS') {
        return null;
    } else if (action.type === 'OPERATE_SHAPE' && state) {
        if (action.operation === 'rotateRight') {
            return state.rotate90();
        } else if (action.operation === 'rotateLeft') {
            return state.rotate90().rotate90().rotate90();
        } else if (action.operation === 'flip') {
            return state.flip();
        }
    }

    return state;
};

const cursor = (state = null, action) => {
    if (action.type === 'PUT_PART' || action.type === 'SELECT_PART' || action.type === 'PASS') {
        return null;
    } else if (action.type === 'MOVE_CURSOR') {
        return action.cursor;
    }

    return state;
};

const selectedGroupId = (state = -2, action) => {
    if (action.type === 'PUT_PART' || action.type === 'PASS') {
        return -2;
    } else if (action.type === 'SELECT_PART') {
        return action.groupId;
    }

    return state;
};

const player = (state = 0, action) => {
    if (action.type === 'PUT_PART' || action.type === 'PASS') {
        return (state + 1) % 2;
    }

    return state;
};

const turn = (state = 0, action) => {
    if (action.type === 'PUT_PART') {
        return state + 1;
    }

    return state;
};

const alreadyPut = (state, action) => {
    if (typeof state === 'undefined') {
        return List().push(0).push(0);
    }

    if (action.type === 'PUT_PART') {

        const player = action.player;
        const shapeSize = partsManager.getShape(action.groupId).seq.size;

        return state.withMutations(list => {
            const original = list.get(player);
            list.set(player, original + shapeSize);
        });
    }

    return state;
};

export default combineReducers({
    playField,
    partsField,
    selectedShape,
    cursor,
    selectedGroupId,
    player,
    turn,
    alreadyPut,
})

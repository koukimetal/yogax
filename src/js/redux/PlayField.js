import {Coordinate, PART_WIDTH, getStrokeDasharray, BOARD_SIZE, START_POINT, inBorder, PartState, DX, DY} from "../common";
import React from "react";
import {Set} from 'immutable';
import {putPart as getPutPartAction, moveCursor as getMoveCursorAction} from "./actions";
import {connect} from "react-redux";


const getPendingParts = (shape, cursor) => {
    return shape.seq.map(co => new Coordinate({x: co.x + cursor.x, y: co.y + cursor.y}));
};

const drawable = (fieldJS, seq) => {
    let valid = true;
    seq.forEach(co => {
        valid = valid && inBorder(co.x, co.y, BOARD_SIZE) && fieldJS[co.y][co.x].state === PartState.NONE;
    });
    return valid;
};

const PlayField = ({
    turn,
    player,
    selectedGroupId,
    selectedShape,
    field,
    cursor,

    moveCursor,
    putPart
}) => {
    const fieldJS = field.toJS();

    let pendingParts = Set();
    if (cursor && selectedShape) {
        const pendingPartsCandidate = getPendingParts(selectedShape, cursor);
        if (drawable(fieldJS, pendingPartsCandidate)) {
            pendingParts = pendingPartsCandidate;
        }
    }

    let canvas = [];
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

            const strokeDasharray = getStrokeDasharray(x, y, fieldJS, PART_WIDTH);

            if (fieldJS[y][x].player === 0) {
                fillColor = 'blue';
            } else if (fieldJS[y][x].player === 1) {
                fillColor = 'red';
            }

            canvas.push(<rect
                key={y * BOARD_SIZE + x}
                x={x * PART_WIDTH}
                y={y * PART_WIDTH}
                width={PART_WIDTH}
                height={PART_WIDTH}
                onMouseOver={() => moveCursor(fieldJS, selectedShape, x, y)}
                onClick={() => putPart(turn, player, field, selectedGroupId, pendingParts)}
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
        <svg width={PART_WIDTH * BOARD_SIZE} height={PART_WIDTH * BOARD_SIZE}>
            {canvas}
        </svg>
    );
};

const isLocatable = (turn, player, field, pendingParts) => {
    if (pendingParts.size === 0) { // not chosen
        return;
    }

    // check locatable
    let playFieldJS = field.toJS();
    let locatable = true;

    // check not sharing edges
    pendingParts.forEach(co => {
        if (playFieldJS[co.y][co.x].state !== PartState.NONE) {
            locatable = false;
        }
        for (let i = 0; i < DX.length; i++) {
            const nx = co.x + DX[i];
            const ny = co.y + DY[i];
            if (!inBorder(nx, ny, BOARD_SIZE)) {
                continue;
            }
            if (playFieldJS[ny][nx].player === player) {
                locatable = false;
            }
        }
    });

    if (turn < 2) {
        // check including a start point
        let includeStart = false;
        pendingParts.forEach(co => {
            includeStart = includeStart || START_POINT.includes(co);
        });
        locatable = locatable && includeStart;
    } else {
        // check sharing at least one corner
        const requiredSameColorPlaces = [];
        pendingParts.forEach(co => {
            const connectedVectors = [];
            for (let i = 0; i < DX.length; i++) {
                const nco = new Coordinate({x: co.x + DX[i], y: co.y + DY[i]});
                if (!inBorder(nco.x, nco.y, BOARD_SIZE) || !pendingParts.includes(nco)) {
                    continue;
                }

                connectedVectors.push({x: DX[i], y: DY[i]});
            }

            if (connectedVectors.length === 0) {
                requiredSameColorPlaces.push(new Coordinate({x: co.x - 1, y: co.y - 1}));
                requiredSameColorPlaces.push(new Coordinate({x: co.x + 1, y: co.y + 1}));
                requiredSameColorPlaces.push(new Coordinate({x: co.x - 1, y: co.y + 1}));
                requiredSameColorPlaces.push(new Coordinate({x: co.x + 1, y: co.y - 1}));
            } else if (connectedVectors.length === 1) {
                const cv = connectedVectors[0];
                if (cv.x !== 0) {
                    requiredSameColorPlaces.push(new Coordinate({x: co.x + cv.x * -1, y: co.y + 1}));
                    requiredSameColorPlaces.push(new Coordinate({x: co.x + cv.x * -1, y: co.y - 1}));
                } else {
                    requiredSameColorPlaces.push(new Coordinate({x: co.x + 1, y: co.y + cv.y * -1}));
                    requiredSameColorPlaces.push(new Coordinate({x: co.x - 1, y: co.y + cv.y * -1}));
                }
            } else if (connectedVectors.length === 2) {
                const cv1 = connectedVectors[0];
                const cv2 = connectedVectors[1];
                requiredSameColorPlaces.push(new Coordinate({x: co.x - cv1.x - cv2.x, y: co.y - cv1.y - cv2.y}));
            }
        });

        let satisfy = false;
        requiredSameColorPlaces.forEach(co => {
            if (!inBorder(co.x, co.y, BOARD_SIZE)) {
                return;
            }

            if (playFieldJS[co.y][co.x].player === player) {
                satisfy = true;
            }
        });

        locatable = locatable && satisfy;
    }

    return locatable;
};

const mapStateToProps = state => {
    return {
        turn: state.turn,
        player: state.player,
        selectedGroupId: state.selectedGroupId,
        selectedShape: state.selectedShape,
        field: state.playField,
        cursor: state.cursor,
    }

};

const mapDispatchToProps = dispatch => ({
    putPart: (turn, player, field, selectedGroupId, pendingParts) => {
        if (isLocatable(turn, player, field, pendingParts)) {
            dispatch(getPutPartAction(player, selectedGroupId, pendingParts));
        }
    },
    moveCursor: (fieldJS, selectedShape, x, y) => {
        if (!selectedShape) {
            return;
        }
        const nextPendingParts = getPendingParts(selectedShape, new Coordinate({x, y}));
        if (drawable(fieldJS, nextPendingParts)) {
            dispatch(getMoveCursorAction(new Coordinate({x, y})));
        }
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlayField);

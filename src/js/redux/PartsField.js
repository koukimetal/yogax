import {PART_WIDTH, BOARD_SIZE, getStrokeDasharray} from "../common";
import {selectPart as getSelectPartAction} from "./actions";
import { connect } from 'react-redux';
import React from "react";
import partsManager from "./PartsManager";

const PartsFieldComponent = ({
    player,
    field,
    selectedGroupId,
    selectPart
}) => {
    const fieldJS = field.toJS();
    let canvas = [];
    for (let y = 0; y < fieldJS.length; y++) {
        for (let x = 0; x < fieldJS[y].length; x++) {
            const strokeDasharray = getStrokeDasharray(x, y, fieldJS, PART_WIDTH/2);
            let fillColor = 'gray';

            if (fieldJS[y][x].groupId === selectedGroupId) {
                fillColor = 'green';
            } else if (fieldJS[y][x].player === 0) {
                fillColor = 'blue';
            } else if (fieldJS[y][x].player === 1) {
                fillColor = 'red';
            }

            canvas.push(<rect
                key={y * fieldJS.length + x}
                x={x * PART_WIDTH/2}
                y={y * PART_WIDTH/2}
                width={PART_WIDTH/2}
                height={PART_WIDTH/2}
                onClick={() => selectPart(player, fieldJS[y][x].groupId)}
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

const mapStateToProps = state => ({
    player: state.player,
    field: state.partsField,
    selectedGroupId: state.selectedGroupId,
});

const mapDispatchToProps = dispatch => ({
    selectPart: (player, groupId) => {
        if (groupId >= 0) {
            const partsPlayer = partsManager.getPlayer(groupId);
            if (player === partsPlayer) {
                dispatch(getSelectPartAction(groupId));
            }
        }
    }
});

export {
    PartsFieldComponent,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PartsFieldComponent);

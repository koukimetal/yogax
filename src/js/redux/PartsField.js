import {PART_WIDTH, BOARD_SIZE, getStrokeDasharray} from "./common";
import {selectPart as getSelectPartAction} from "./actions";
import { connect } from 'react-redux';
import React from "react";

const PartsFieldComponent = ({
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
                onClick={() => selectPart(fieldJS[y][x].groupId)}
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
    field: state.partsField,
    selectedGroupId: state.selectedGroupId,
});

const mapDispatchToProps = dispatch => ({
    selectPart: groupId => {
        if (groupId >= 0) {
            dispatch(getSelectPartAction(groupId));
        }
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PartsFieldComponent);

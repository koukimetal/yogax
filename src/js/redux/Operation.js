import React from "react";
import {operateShape as getOperateAction} from "./actions";
import {connect} from "react-redux";

const Operation = ({
   player,
   alreadyPut,
   operateShape
}) => {
    return (
        <div>
            <div>
                Player: {player + 1}
            </div>
            <button onClick={() => operateShape('rotateRight')}>Rotate Right</button>
            <button onClick={() => operateShape('rotateLeft')}>Rotate Left</button>
            <button onClick={() => operateShape('flip')}>Flip right top to left bottom</button>
            <div>
                Score 1: {alreadyPut.get(0)}, Score 2: {alreadyPut.get(1)}
            </div>
        </div>
    );
};

const mapStateToProps = state => ({
    player: state.player,
    alreadyPut: state.alreadyPut,
});

const mapDispatchToProps = dispatch => ({
    operateShape: (operation) => {
        dispatch(getOperateAction(operation));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Operation);

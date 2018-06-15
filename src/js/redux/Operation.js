import React from "react";
import {operateShape as getOperateAction, pass as getPassAction} from "./actions";
import {connect} from "react-redux";

const Operation = ({
   player,
   alreadyPut,
   operateShape,
   pass
}) => {
    return (
        <div>
            <div>
                Player: {player + 1}
            </div>
            <button onClick={() => operateShape('rotateRight')}>Rotate Right</button>
            <button onClick={() => operateShape('rotateLeft')}>Rotate Left</button>
            <button onClick={() => operateShape('flip')}>Flip right top to left bottom</button>
            <button onClick={() => pass()}>Pass</button>

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
    },
    pass: () => {
        dispatch(getPassAction());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Operation);

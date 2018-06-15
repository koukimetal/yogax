
const putPart = (player, groupId, pendingParts) => ({
    type: 'PUT_PART',
    player,
    groupId,
    pendingParts,
});

const selectPart = (groupId) => ({
    type: 'SELECT_PART',
    groupId,
});

const moveCursor = (cursor) => ({
    type: 'MOVE_CURSOR',
    cursor,
});

const operateShape = (operation) => ({
    type: 'OPERATE_SHAPE',
    operation,
});

const pass = () => ({
    type: 'PASS',
});

export {
    putPart,
    selectPart,
    moveCursor,
    operateShape,
    pass,
};
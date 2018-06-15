import {generateAllShapes} from "../shape";
import {fromJS} from 'immutable';

class PartsManager {
    constructor(size, numOfPlayer) {
        const initialShapes = generateAllShapes(size);
        const groupIdToShape = [];
        const groupIdToPlayer = [];

        for (let player = 0; player < numOfPlayer; player++) {
            initialShapes.forEach(shape => {
                groupIdToShape.push(shape);
                groupIdToPlayer.push(player);
            });
        }
        this.groupIdToShape = fromJS(groupIdToShape);
        this.groupIdToPlayer = fromJS(groupIdToPlayer);

    }

    getPlayer(groupId) {
        return this.groupIdToPlayer.get(groupId);
    }

    getShape(groupId) {
        return this.groupIdToShape.get(groupId);
    }

    getNumOfGroupId() {
        return this.groupIdToShape.size;
    }
}

export default PartsManager;
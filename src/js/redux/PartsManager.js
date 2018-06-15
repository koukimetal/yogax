import {generateAllShapes} from "../shape";
import {fromJS} from 'immutable';
import {PART_LENGTH} from "../common";

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

const PartsManagerInstance = new PartsManager(PART_LENGTH, 2);

export default PartsManagerInstance;
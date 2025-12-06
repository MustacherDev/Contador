class ObjectSearchManager {
    constructor() {

    }

    filterByTag(tag, list) {
        return list.filter((obj) => obj.tags.includes(tag));
    }


    getObjByTag(tag, room = manager.mainRoom) {
        const results = [];
        for (var i = 0; i < OBJECT.TOTAL; i++) {
            for (const object of room.classes[i]) {
                if (object.tags.includes(tag)) {
                    results.push(object);
                }
            }
        }
        return results;
    }

    getObjByTypeAndTag(tag, objTypeList, room = manager.mainRoom){
        const results = [];
        for (const classType of objTypeList) {
            for (const object of room.classes[classType]) {
                if (object.tags.includes(tag)) {
                    results.push(object);
                }
            }
        }
        return results;
    }


    getFirstObjByType(objType, room = manager.mainRoom){
        for (var i = 0; i < room.classes[objType].length; i++) {
             return room.classes[objType][i];
        }
        return null;
    }

    getColliders(colliderBox, room = manager.mainRoom) {
        var results = [];
        for (var i = 0; i < OBJECT.TOTAL; i++) {
            for (const object of room.classes[i]) {
                if (!object.active) continue;
                if (object.boundingBox) {
                    if (colliderBox.intersects(object.boundingBox)) {
                        results.push(object);
                    }
                }
            }
        }
        return results;
    }

    getCollidersByType(objTypeList, colliderBox, room = manager.mainRoom) {
        var results = [];
        for (const classType of objTypeList) {
            for (const object of room.classes[classType]) {
                if (!object.active) continue;
                if (object.boundingBox) {
                    if (colliderBox.intersects(object.boundingBox)) {
                        results.push(object);
                    }
                }
            }
        }
        return results;
    }

    getHitColliders(colliderBox, room = manager.mainRoom) {
        var results = [];

        for (var i = 0; i < OBJECT.TOTAL; i++) {
            for (const object of room.classes[i]) {
                if (!object.active) continue;
                if (object.getHitBox()) {
                    if (colliderBox.intersects(object.getHitBox())) {
                        results.push(object);
                    }
                }
            }
        }
        return results;
    }

    getHitCollidersByType(objTypeList, colliderBox, room = manager.mainRoom) {
        var results = [];
        for (const classType of objTypeList) {
            for (const object of room.classes[classType]) {
                if (!object.active) continue;
                if (object.getHitBox()) {
                    if (colliderBox.intersects(object.getHitBox())) {
                        results.push(object);
                    }
                }
            }
        }
        return results;
    }

    getClickColliders(colliderBox, room = manager.mainRoom) {
        var results = [];

        for (var i = 0; i < OBJECT.TOTAL; i++) {
            for (const object of room.classes[i]) {
                if (!object.active) continue;
                if (object.getClickBox()) {
                    if (colliderBox.intersects(object.getClickBox())) {
                        results.push(object);
                    }
                }
            }
        }
        return results;
    }

    getClickCollidersByType(objTypeList, colliderBox, room = manager.mainRoom) {
        var results = [];
        for (const classType of objTypeList) {
            for (const object of room.classes[classType]) {
                if (!object.active) continue;
                if (object.getClickBox()) {
                    if (colliderBox.intersects(object.getClickBox())) {
                        results.push(object);
                    }
                }
            }
        }
        return results;
    }

    getFirstCollider(colliderBox, room = manager.mainRoom) {
        for (var i = 0; i < OBJECT.TOTAL; i++) {
            for (const object of room.classes[i]) {
                if (!object.active) continue;
                if (object.boundingBox) {
                    if (colliderBox.intersects(object.boundingBox)) {
                        return object;
                    }
                }
            }
        }
        return null;
    }

    
    getFirstColliderByType(objTypeList, colliderBox, room = manager.mainRoom) {
        for (var j = 0; j < objTypeList.length; j++) {
            for (var i = 0; i < room.classes[objTypeList[j]].length; i++) {
                var obj = room.classes[objTypeList[j]][i];
                if (!obj.active) continue;
                if (obj.boundingBox) {
                    if (colliderBox.intersects(obj.boundingBox)) {
                        return obj;
                    }
                }
            }
        }
        return null;
    }

    getFirstClickColliderByType(objTypeList, colliderBox, room = manager.mainRoom) {
        for (var j = 0; j < objTypeList.length; j++) {
            for (var i = 0; i < room.classes[objTypeList[j]].length; i++) {
                var obj = room.classes[objTypeList[j]][i];
                if (!obj.active) continue;
                if (obj.getClickBox()) {
                    if (colliderBox.intersects(obj.getClickBox())) {
                        return obj;
                    }
                }
            }
        }
        return null;
    }

    getFirstSolidCollider(colliderBox, room = manager.mainRoom) {
        for (var i = 0; i < OBJECT.TOTAL; i++) {
            for (const object of room.classes[i]) {
                if (!object.active) continue;
                if (!object.solid) continue;
                if (object.boundingBox) {
                    if (colliderBox.intersects(object.boundingBox)) {
                        return object;
                    }
                }
            }
        }
        return null;
    }

    getFirstSolidColliderByType(objTypeList, colliderBox, room = manager.mainRoom) {
        for (var j = 0; j < objTypeList.length; j++) {
            for (const object of room.classes[objTypeList[j]]) {
                if (!object.active) continue;
                if (!object.solid) continue;
                if (object.boundingBox) {
                    if (colliderBox.intersects(object.boundingBox)) {
                        return object;
                    }
                }
            }
        }
        return null;
    }

    getSolidCollidersByType(objTypeList, colliderBox, room = manager.mainRoom) {
        var list = [];
        for (var j = 0; j < objTypeList.length; j++) {
            for (const object of room.classes[objTypeList[j]]) {
                if (!object.active) continue;
                if (!object.solid) continue;
                if (object.boundingBox) {
                    if (colliderBox.intersects(object.boundingBox)) {
                        list.push(object);
                    }
                }
            }
        }
        return list;
    }


    getCollisionRectByType(objTypeList, x, y, wid, hei, room = manager.mainRoom) {
        var testBox = new BoundingBox(x, y, wid, hei);
        for (var j = 0; j < objTypeList.length; j++) {
            for (var i = 0; i < room.classes[objTypeList[j]].length; i++) {
                var obj = room.classes[objTypeList[j]][i];
                if (!obj.active) continue;
                if (obj.boundingBox) {
                    if (testBox.intersects(obj.boundingBox)) {
                        return obj;

                    }
                }
            }
        }
        return null;
    }
}

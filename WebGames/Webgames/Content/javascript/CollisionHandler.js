var hitboxType = {
    Circle: 0,
    Rectangle: 0
};

function doHitboxesOverlap(spriteA, spriteB) {
    if (spriteA.hitbox == null || spriteB.hitbox == null) return false;
    //if (spriteA.hitbox.type == hitboxType.Circle && spriteB.hitbox.type == hitboxType.Circle) {}

    var xDistance = spriteA.x - spriteB.x;
    var yDistance = spriteA.y - spriteB.y;
    var squareDistanceBetweenSprites = xDistance * xDistance + yDistance * yDistance;
    var radiusSum = spriteA.hitbox.radius * spriteA.scale + spriteB.hitbox.radius * spriteB.scale;
    return radiusSum * radiusSum >= squareDistanceBetweenSprites;
}

function getOverlappingSprites(sprite, classToTest) {
    var ret = [];
    for (var i = 0; i < sprites.length; i++) {
        if (sprites[i].active) {
            if (sprites[i].spriteClasses.indexOf(classToTest) > -1) {
                if (doHitboxesOverlap(sprite, sprites[i])) {
                    ret.push(sprites[i]);
                }
            }
        }
    }
    return ret;
}
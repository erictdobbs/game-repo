
var itemTypes = {
    Pixelite: {
        name: "Pixelite Panel",
        constructor: ItemDropPixelite
    },
    PowerCell: {
        name: "Empty Power Cell",
        constructor: ItemDropPowerCell
    },
    MeteorOre: {
        name: "Raw Meteor Ore",
        constructor: ItemDropMeteorOre
    }
};


function SpawnLoot(enemy) {
    if (enemy.itemDropPool) {
        for (var i = 0; i < enemy.itemDropPool.length; i++) {
            var numberToSpawn = parseInt(Math.random() * 3);
            for (var j = 0; j < numberToSpawn; j++)
                sprites.push(new enemy.itemDropPool[i].constructor(enemy.x, enemy.y, 1));
        }
    }
}
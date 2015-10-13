
var itemTypes = {};


function initializeItemTypes() {
    itemTypes.Pixelite = {
        name: "Pixelite Panel",
        constructorName: "ItemDropPixelite",
        frame: new Frame(graphicSheets.Items, 0)
    };
    itemTypes.PowerCell = {
        name: "Empty Power Cell",
        constructorName: "ItemDropPowerCell",
        frame: new Frame(graphicSheets.Items, 1)
    };
    itemTypes.MeteorOre = {
        name: "Raw Meteor Ore",
        constructorName: "ItemDropMeteorOre",
        frame: new Frame(graphicSheets.Items, 2)
    };
}


function SpawnLoot(enemy) {
    if (enemy.itemDropPool) {
        for (var i = 0; i < enemy.itemDropPool.length; i++) {
            var itemTypeToSpawn = enemy.itemDropPool[i];
            var numberToSpawn = parseInt(Math.random() * 3);
            for (var j = 0; j < numberToSpawn; j++) {
                var itemDrop = new window[itemTypeToSpawn.constructorName](1);
                itemDrop.x = enemy.x;
                itemDrop.y = enemy.y;
                sprites.push(itemDrop);
            }
        }
    }
}


function AddCommodityToInventory(player, commodityType, amount) {
    var commodities = player.inventory.commodities;
    if (commodities[commodityType]) {
        commodities[commodityType] += amount;
    } else {
        commodities[commodityType] = amount;
    }
}



function DrawInventory(player) {
    var y = 200;
    var x = viewWidth - 50;
    for (itemTypeName in player.inventory.commodities) {
        y += 25;
        var itemType = itemTypes[itemTypeName.replace("ItemDrop", "")];
        itemType.frame.draw(viewWidth - 50, y, 1, 0);

        gameViewContext.font = "16px Arial";
        gameViewContext.fillStyle = "white";
        gameViewContext.shadowBlur = 0;
        var text = player.inventory.commodities[itemTypeName].toString();
        gameViewContext.fillText(text, x + 20, y + 4);
    }
}
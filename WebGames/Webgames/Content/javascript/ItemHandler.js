
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
    itemTypes.ShieldModule = {
        name: "Shield Module",
        constructorName: "ItemDropShieldModule",
        frame: new Frame(graphicSheets.Items, 3)
    };
    itemTypes.BulwarkPanel = {
        name: "Bulwark Panel",
        constructorName: "ItemDropBulwarkPanel",
        frame: new Frame(graphicSheets.Items, 4)
    };
    itemTypes.FuelCluster = {
        name: "Fuel Cluster",
        constructorName: "ItemDropFuelCluster",
        frame: new Frame(graphicSheets.Items, 5)
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




var drawInventoryTimer = -1;

function AddCommodityToInventory(player, commodityType, amount) {
    AddToScore("Items Collected", 1);
    if (drawInventoryTimer == -1) drawInventoryTimer = 0;
    else drawInventoryTimer = 15;
    var commodities = player.inventory.commodities;
    if (commodities[commodityType]) {
        commodities[commodityType] += amount;
    } else {
        commodities[commodityType] = amount;
    }
}

function DrawInventoryMapPosition(timer) {
    if (timer < 0) return 0;
    if (timer < 15) return ((1 - Math.cos(Math.PI * timer / 15)) / 2);
    if (timer < 200) return 1;
    if (timer < 215) return ((1 - Math.cos(Math.PI * (215 - timer) / 15)) / 2);
    return 0;
}

function DrawInventory(player) {
    if (drawInventoryTimer != -1) drawInventoryTimer++;
    if (drawInventoryTimer > 215) drawInventoryTimer = -1;

    var numberOfItems = Object.keys(player.inventory.commodities).length;
    if (numberOfItems == 0) return;

    var largestItemNumber = 0;
    for (itemTypeName in player.inventory.commodities) {
        var itemCount = player.inventory.commodities[itemTypeName];
        if (itemCount > largestItemNumber) largestItemNumber = itemCount;
    }

    var extraWidthForExtraDigits = 10 * parseInt(Math.log10(largestItemNumber));
    var xOffset = (70 + extraWidthForExtraDigits) * (1 - DrawInventoryMapPosition(drawInventoryTimer));

    var itemHeight = 25;
    var y = viewHeight / 2;
    var x = viewWidth - 50 + xOffset;
    

    x -= extraWidthForExtraDigits;

    gameViewContext.shadowBlur = 0;
    gameViewContext.fillStyle = "rgba(0,0,0,0.3)";
    gameViewContext.fillRect(x - 20, y, 200, itemHeight * (numberOfItems + 1));

    for (itemTypeName in player.inventory.commodities) {
        y += itemHeight;
        var itemType = itemTypes[itemTypeName.replace("ItemDrop", "")];
        itemType.frame.draw(x, y, 1, 0);

        gameViewContext.font = "16px monospace";
        gameViewContext.fillStyle = "white";
        var text = player.inventory.commodities[itemTypeName].toString();
        gameViewContext.fillText(text, x + 20, y + 4);
    }
}
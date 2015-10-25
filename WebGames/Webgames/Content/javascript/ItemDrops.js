
function ItemDrop(x, y, amount) {
    SpriteBase.call(this, x, y, 2, 0);
    this.spriteClasses = ["ItemDrop"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 8
    };
    this.amount = amount ? amount : 1;
    this.shadowColor = "lightblue";
    this.glowTimer = 0;
    this.dx = Math.random() * 4 - 2;
    this.dy = (-2) * Math.random() - 2;
    this.executeRules = function () {
        this.shadowBlur = Math.sin((this.glowTimer++) / 10) * 10 + 15;
        this.x += this.dx;
        this.y += this.dy;
        this.dy += 0.1;
        this.rotation -= Math.PI / 48;
        if (this.y > viewHeight + 64) this.kill();
        var struckPlayers = getOverlappingSprites(this, "Player");
        if (struckPlayers.length > 0) {
            var struckPlayer = struckPlayers[0];
            var itemType = this.constructor.name;
            AddCommodityToInventory(struckPlayer, itemType, this.amount);
            this.kill();
        }
    };
}
ItemDrop.prototype = new SpriteBase();
ItemDrop.prototype.constructor = ItemDrop;



function ItemDropPixelite(amount) {
    ItemDrop.call(this, 0, 0, amount);
    this.currentFrame = new Frame(graphicSheets.Items, 0);
}
ItemDropPixelite.prototype = new ItemDrop();
ItemDropPixelite.prototype.constructor = ItemDropPixelite;




function ItemDropPowerCell(amount) {
    ItemDrop.call(this, 0, 0, amount);
    this.currentFrame = new Frame(graphicSheets.Items, 1);
}
ItemDropPowerCell.prototype = new ItemDrop();
ItemDropPowerCell.prototype.constructor = ItemDropPowerCell;




function ItemDropMeteorOre(amount) {
    ItemDrop.call(this, 0, 0, amount);
    this.currentFrame = new Frame(graphicSheets.Items, 2);
}
ItemDropMeteorOre.prototype = new ItemDrop();
ItemDropMeteorOre.prototype.constructor = ItemDropMeteorOre;




function ItemDropShieldModule(amount) {
    ItemDrop.call(this, 0, 0, amount);
    this.currentFrame = new Frame(graphicSheets.Items, 3);
}
ItemDropShieldModule.prototype = new ItemDrop();
ItemDropShieldModule.prototype.constructor = ItemDropShieldModule;




function ItemDropBulwarkPanel(amount) {
    ItemDrop.call(this, 0, 0, amount);
    this.currentFrame = new Frame(graphicSheets.Items, 4);
}
ItemDropBulwarkPanel.prototype = new ItemDrop();
ItemDropBulwarkPanel.prototype.constructor = ItemDropBulwarkPanel;




function ItemDropFuelCluster(amount) {
    ItemDrop.call(this, 0, 0, amount);
    this.currentFrame = new Frame(graphicSheets.Items, 5);
}
ItemDropFuelCluster.prototype = new ItemDrop();
ItemDropFuelCluster.prototype.constructor = ItemDropFuelCluster;


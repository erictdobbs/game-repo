var isShopping = false;

var shoppingStates = {
    uninitialized: 0,
    starting: 1,
    shopping: 2,
    closing: 3,
    scoreDisplay: 4,
    endingScoreDisplay: 5
};

var currentShoppingState = shoppingStates.uninitialized;
var shoppingTimer = 0;
var playerShoppingOriginalX = 0;
var playerShoppingOriginalY = 0;
var playerShoppingOriginalScale = 0;

function startShopping() {
    isShopping = true;
    currentShoppingState = shoppingStates.starting;
    shoppingTimer = 0;
    drawInventoryTimer = 0;
    playerShoppingOriginalX = player.x;
    playerShoppingOriginalY = player.y;
    playerShoppingOriginalScale = player.scale;
    refreshUpgradeButtons();
}

function finishShopping() {
    shoppingTimer = 0;
    currentShoppingState = shoppingStates.uninitialized
    isShopping = false;
    levelNumber += 1;
    level = new Level(levelNumber);
}

function handleShopping() {
    if (player.HP < player.maxHP) player.applyHealth(0.1, true);
    if (player.shield.HP < player.shield.maxHP) player.shield.applyHealth(0.1, true);

    var targetScale = 12;
    var targetPlayerX = viewWidth / 4;
    var targetPlayerY = viewHeight / 2;
    var originalPanelY = -viewHeight;
    var targetPanelY = 0;

    var panelY = originalPanelY;

    if (currentShoppingState == shoppingStates.starting) {
        shoppingTimer += 1;
        var migrationRatio = shoppingTimer / 100;
        player.x = shoppingCosMap(playerShoppingOriginalX, targetPlayerX, migrationRatio);
        player.y = shoppingCosMap(playerShoppingOriginalY, targetPlayerY, migrationRatio);
        player.scale = shoppingCosMap(playerShoppingOriginalScale, targetScale, migrationRatio);
        panelY = shoppingCosMap(originalPanelY, targetPanelY, migrationRatio);
        if (shoppingTimer >= 100) {
            shoppingTimer = 0;
            currentShoppingState = shoppingStates.shopping
        }
    }

    if (currentShoppingState == shoppingStates.shopping) {
        drawInventoryTimer = 100;
        panelY = targetPanelY;
    }

    if (currentShoppingState == shoppingStates.closing) {
        shoppingTimer += 1;
        var migrationRatio = shoppingTimer / 100;
        player.x = shoppingCosMap(targetPlayerX, playerShoppingOriginalX, migrationRatio);
        player.y = shoppingCosMap(targetPlayerY, playerShoppingOriginalY, migrationRatio);
        player.scale = shoppingCosMap(targetScale, playerShoppingOriginalScale, migrationRatio);
        panelY = shoppingCosMap(targetPanelY, originalPanelY, migrationRatio);

        DrawScores(0, shoppingCosMap(viewHeight, 0, migrationRatio));
        if (shoppingTimer >= 100) {
            shoppingTimer = 0;
            currentShoppingState = shoppingStates.scoreDisplay;
        }
    }

    if (currentShoppingState == shoppingStates.scoreDisplay) {
        shoppingTimer += 1;
        DrawScores(0, 0);
        if (isMouseClicked || keyboardState.isKeyPressed(keyboardState.key.Space)) {
            shoppingTimer = 0;
            currentShoppingState = shoppingStates.endingScoreDisplay;
        }
    }

    if (currentShoppingState == shoppingStates.endingScoreDisplay) {
        shoppingTimer += 1;
        var migrationRatio = shoppingTimer / 100;
        DrawScores(0, shoppingCosMap(0, -viewHeight, migrationRatio));
        if (shoppingTimer >= 100) {
            shoppingTimer = 0;
            finishShopping();
        }
    }

    drawUpgradePanel(panelY, getUpgradeTypes());
}

function getUpgradeTypes() {
    var ret = [];

    var shieldIncreasePerLevel = 2;
    var shieldOriginalHP = 10;
    var shieldLevel = parseInt((player.shield.maxHP - shieldOriginalHP) / shieldIncreasePerLevel);
    ret.push({
        name: "Upgrade shield",
        frame: new Frame(graphicSheets.Upgrades, 2),
        cost: [{ itemtype: itemTypes.PowerCell, amount: 8 + shieldLevel * 5 },
               { itemtype: itemTypes.ShieldModule, amount: shieldLevel * 8 }],
        effect: function () { player.shield.maxHP += shieldIncreasePerLevel; }
    });

    var hpIncreasePerLevel = 3;
    var originalHP = 20;
    var hpLevel = parseInt((player.maxHP - originalHP) / hpIncreasePerLevel);
    ret.push({
        name: "Stronger hull",
        frame: new Frame(graphicSheets.Upgrades, 3),
        cost: [{ itemtype: itemTypes.Pixelite, amount: 5 + hpLevel * 5 },
               { itemtype: itemTypes.BulwarkPanel, amount: hpLevel * 2 }],
        effect: function () { player.maxHP += hpIncreasePerLevel; }
    });

    var speedIncreasePerLevel = 0.4;
    var originalSpeed = 5;
    var speedLevel = parseInt((player.speed - originalSpeed) / speedIncreasePerLevel);
    ret.push({
        name: "Faster thrusters",
        frame: new Frame(graphicSheets.Upgrades, 4),
        cost: [{ itemtype: itemTypes.Pixelite, amount: 5 + speedLevel * 5 },
               { itemtype: itemTypes.FuelCluster, amount: speedLevel * 2 }],
        effect: function () { player.speed += speedIncreasePerLevel; }
    });

    var bulletSpeedIncreasePerLevel = 0.5;
    var originalBulletSpeed = 6;
    var bulletSpeedLevel = parseInt((player.bulletSpeed - originalBulletSpeed) / bulletSpeedIncreasePerLevel);
    ret.push({
        name: "Faster projectiles",
        frame: new Frame(graphicSheets.Upgrades, 5),
        cost: [{ itemtype: itemTypes.MeteorOre, amount: 5 + bulletSpeedLevel * 5 },
               { itemtype: itemTypes.FuelCluster, amount: bulletSpeedLevel * 2 }],
        effect: function () { player.bulletSpeed += bulletSpeedIncreasePerLevel; }
    });

    var bulletDamageIncreasePerLevel = 0.5;
    var originalBulletDamage = 3;
    var bulletDamageLevel = parseInt((player.bulletDamage - originalBulletDamage) / bulletDamageIncreasePerLevel);
    ret.push({
        name: "Upgrade weapon damage",
        frame: new Frame(graphicSheets.Upgrades, 6),
        cost: [{ itemtype: itemTypes.MeteorOre, amount: 10 + bulletDamageLevel * 5 },
               { itemtype: itemTypes.PowerCell, amount: bulletDamageLevel * 5 }],
        effect: function () { player.bulletDamage += bulletDamageIncreasePerLevel; }
    });

    var weaponCooldownIncreasePerLevel = 0.4;
    var originalweaponCooldown = 1;
    var weaponCooldownLevel = parseInt((player.weaponRechargeSpeed - originalweaponCooldown) / weaponCooldownIncreasePerLevel);
    ret.push({
        name: "Shorter cooldown",
        frame: new Frame(graphicSheets.Upgrades, 7),
        cost: [{ itemtype: itemTypes.Pixelite, amount: 15 + weaponCooldownLevel * 5 },
                { itemtype: itemTypes.PowerCell, amount: weaponCooldownLevel * 5 }],
        effect: function () { player.weaponRechargeSpeed += weaponCooldownIncreasePerLevel; }
    });

    return ret;
}

var shopSelectedButtonIndex = -1;
var upgradePanelOffset = 0;
var upgradeButtons = [];
function drawUpgradePanel(y, upgradeTypes) {
    upgradePanelOffset = y;
    var margin = 20;
    var panelWidth = viewWidth / 2 - margin * 2;
    var panelHeight = viewHeight / 2 - margin * 2;

    var buttonColumns = 2;
    var buttonRows = parseInt(upgradeTypes.length / 2);
    var buttonWidth = (panelWidth + margin) / buttonColumns - margin;
    var buttonHeight = (panelHeight + margin) / buttonRows - margin;

    if (upgradeButtons.length == 0) {
        for (var i = 0; i < upgradeTypes.length; i++) {
            var upgradeType = upgradeTypes[i];
            var newButton = new Button();
            newButton.x = viewWidth / 2 + margin + (buttonWidth + margin) * (i % buttonColumns);
            newButton.y = margin + (buttonHeight + margin) * parseInt(i / buttonColumns);
            newButton.width = (panelWidth + margin) / buttonColumns - margin;
            newButton.height = (panelHeight + margin) / buttonRows - margin;
            newButton.selectionIndex = i;
            newButton.getUpgradeType = function () { return getUpgradeTypes()[this.selectionIndex]; };
            newButton.draw = function () {
                var isSelected = (this.selectionIndex == shopSelectedButtonIndex);
                var upgradeType = this.getUpgradeType();
                gameViewContext.shadowBlur = 0;
                gameViewContext.fillStyle = this.color.toString();
                if (isSelected) gameViewContext.fillStyle = "rgba(0,0,0,1.0)";
                gameViewContext.fillRect(this.x, this.y + upgradePanelOffset, this.width, this.height);
                upgradeType.frame.draw(this.x + this.height / 2, upgradePanelOffset + this.y + this.height / 2, 4, 0);
                if (upgradeType.cost) {
                    var costHeight = this.height / upgradeType.cost.length;
                    for (var j = 0; j < upgradeType.cost.length; j++) {
                        var cost = upgradeType.cost[j];
                        if (cost.amount > 0) {
                            cost.itemtype.frame.draw(this.x + margin + this.height, upgradePanelOffset + this.y + margin + j * costHeight, 1, 0);
                            gameViewContext.fillStyle = this.textColor.toString();
                            gameViewContext.font = this.font;
                            gameViewContext.fillText(cost.amount, this.x + margin * 2 + this.height, upgradePanelOffset + this.y + margin + j * costHeight + 8);
                        }
                    }
                }
            };
            newButton.onClick = function () { shopSelectedButtonIndex = this.selectionIndex; };
            buttons.push(newButton);
            upgradeButtons.push(newButton);
        }

        var purchaseButton = new Button();
        purchaseButton.x = viewWidth / 2 + margin;
        purchaseButton.y = viewHeight / 2;
        purchaseButton.width = 1.5 * ((panelWidth + margin) / buttonColumns - margin);
        purchaseButton.height = (panelHeight + margin) / buttonRows - margin;
        purchaseButton.draw = function () {
            var confirmText = "Select an upgrade";
            var confirmText2 = "";
            var buttonX = viewWidth / 2 + margin;
            var buttonY = upgradePanelOffset + this.y; 
            if (shopSelectedButtonIndex != -1) {
                confirmText = upgradeTypes[shopSelectedButtonIndex].name;
                gameViewContext.fillStyle = "rgba(0,0,0,1.0)";
                var canAfford = canAffordUpgrade(upgradeTypes[shopSelectedButtonIndex].cost, player.inventory.commodities);
                confirmText2 = canAfford ? "Click here to buy" : "Can't afford!";
            }
            gameViewContext.shadowBlur = 0;
            gameViewContext.fillStyle = "rgba(0,0,0,0.3)";
            gameViewContext.fillRect(buttonX, buttonY, this.width, this.height);
            gameViewContext.fillStyle = "white";
            gameViewContext.font = "20px monospace";
            gameViewContext.fillText(confirmText, viewWidth / 2 + margin + margin / 2, buttonY + margin + 8);
            gameViewContext.fillText(confirmText2, buttonX + margin / 2, buttonY + margin * 2.5 + 8);
        };
        purchaseButton.onClick = function () {
            var purchaseSuccess = purchaseSelected();
            if (purchaseSuccess) this.sparkle();
        };
        buttons.push(purchaseButton);
        upgradeButtons.push(purchaseButton);

        var cancelButton = new Button();
        cancelButton.x = viewWidth / 2 + margin;
        cancelButton.y = viewHeight / 1.5;
        cancelButton.width = purchaseButton.width;
        cancelButton.text = "DONE";
        cancelButton.font = "40px monospace";
        cancelButton.getOffset = function () { return upgradePanelOffset; };
        cancelButton.onClick = function () { this.sparkle(); currentShoppingState = shoppingStates.closing; };
        buttons.push(cancelButton);
        upgradeButtons.push(cancelButton);
    }
}


function shoppingCosMap(initial, target, completeRatio) {
    return initial + (target - initial) * (1 - Math.cos(completeRatio * Math.PI)) / 2;
}


function canAffordUpgrade(cost, inventory) {
    for (var i = 0; i < cost.length; i++) {
        var itemCost = cost[i];
        var costAmount = itemCost.amount;
        if (costAmount == 0) continue;
        var costMet = false;
        for (itemTypeName in player.inventory.commodities) {
            var itemType = itemTypes[itemTypeName.replace("ItemDrop", "")];
            if (itemType == itemCost.itemtype) {
                var currentAmount = inventory[itemTypeName];
                if (currentAmount >= costAmount) costMet = true;
            }
        }
        if (!costMet) return false;
    }
    return true;
}


function deductUpgradeCost(cost, inventory) {
    for (var i = 0; i < cost.length; i++) {
        var itemCost = cost[i];
        var costAmount = itemCost.amount;
        for (itemTypeName in player.inventory.commodities) {
            var itemType = itemTypes[itemTypeName.replace("ItemDrop", "")];
            if (itemType == itemCost.itemtype) {
                inventory[itemTypeName] -= costAmount;
            }
        }
    }
}


function refreshUpgradeButtons() {
    var upgradeTypes = getUpgradeTypes();
    for (var i = 0; i < upgradeTypes.length; i++) {
        upgradeButtons.upgradeType = upgradeTypes[i];
    }
}


function purchaseSelected() {
    var upgradeTypes = getUpgradeTypes();
    if (shopSelectedButtonIndex < 0 || shopSelectedButtonIndex >= upgradeTypes.length) return false;
    if (canAffordUpgrade(upgradeTypes[shopSelectedButtonIndex].cost, player.inventory.commodities)) {
        deductUpgradeCost(upgradeTypes[shopSelectedButtonIndex].cost, player.inventory.commodities);
        upgradeTypes[shopSelectedButtonIndex].effect();
        refreshUpgradeButtons();
        return true;
    }
    return false;
}
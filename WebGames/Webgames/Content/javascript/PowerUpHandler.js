


function PowerUpBase(x, y, scale, rotation, shadowColor) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.dy = 3;
    this.shadowColor = shadowColor;
    this.spriteClasses = ["PowerUp"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 8
    };
    this.glowTimer = 0;
    this.executeRules = function () {
        this.shadowBlur = Math.sin((this.glowTimer++) / 10) * 10 + 15;
        this.y += this.dy;
        if (this.y > viewHeight + 64) this.kill();
        var struckPlayer = getOverlappingSprites(this, "Player");
        if (struckPlayer.length > 0) {
            this.powerUpEffect(struckPlayer[0]);
            this.kill();
        }
    };
}
PowerUpBase.prototype = new SpriteBase();
PowerUpBase.prototype.constructor = PowerUpBase;


function PowerUpRepair(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "cyan");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 0);
    this.powerUpEffect = function (ship) {
        ship.applyHealth(ship.maxHP / 4);
    }
}
PowerUpRepair.prototype = new PowerUpBase();
PowerUpRepair.prototype.constructor = PowerUpRepair;


function PowerUpWeapon(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "magenta");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 1);
    this.powerUpEffect = function (ship) {
        ship.weaponRechargeSpeed += 0.5;
    }
}
PowerUpWeapon.prototype = new PowerUpBase();
PowerUpWeapon.prototype.constructor = PowerUpWeapon;


function PowerUpShield(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "lime");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 2);
    this.powerUpEffect = function (ship) {
        if (ship.shield != null) {
            ship.shield.trigger();
            if (ship.shield.HP == ship.shield.maxHP) {
                ship.shieldRechargeRate += 0.005;
            } else {
                ship.shield.applyHealth(ship.shield.maxHP);
            }
        }
    }
}
PowerUpShield.prototype = new PowerUpBase();
PowerUpShield.prototype.constructor = PowerUpShield;


function PowerUpSpeed(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "green");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 3);
    this.powerUpEffect = function (ship) {
        ship.speed += 1;
    }
}
PowerUpSpeed.prototype = new PowerUpBase();
PowerUpSpeed.prototype.constructor = PowerUpSpeed;
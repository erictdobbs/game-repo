var drawHitboxes = false;

function SpriteBase(x, y, scale, rotation) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.scale = scale === undefined ? 1 : scale;
    this.rotation = rotation === undefined ? 0 : rotation;
    this.collisionClasses = [];
    this.shadowColor = "white";
    this.shadowBlur = 0;
    this.executeRules = function () { };
    this.draw = function () {
        gameViewContext.shadowBlur = this.shadowBlur;
        gameViewContext.shadowColor = this.shadowColor;

        this.currentFrame.draw(this.x, this.y, this.scale, this.rotation);
        if ((drawHitboxes || keyboardState.isKeyPressed(keyboardState.key.H)) && this.hitbox != null) {
            if (this.hitbox.type == hitboxType.Circle) {
                gameViewContext.beginPath();
                gameViewContext.arc(this.x, this.y, this.hitbox.radius * this.scale, 0, 2 * Math.PI);
                gameViewContext.strokeStyle = "white";
                gameViewContext.stroke();
            }
        }
    }
    this.delete = function () {
        sprites.splice(sprites.indexOf(this), 1);
    }
}



function PlayerShip(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.PlayerShip, 0);
    this.collisionClasses = ["Player"];
    this.weaponCooldown = 0;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 8
    };
    this.speed = 5;
    this.executeRules = function () {
        if (this.weaponCooldown > 0) this.weaponCooldown -= 1;

        if (keyboardState.isKeyPressed(keyboardState.key.A) && this.x > 0) this.x -= this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.D) && this.x < viewWidth) this.x += this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.S) && this.y < viewHeight) this.y += this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.W) && this.y > 0) this.y -= this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.Space) && this.weaponCooldown == 0) {
            this.weaponCooldown = 30;
            sprites.push(new PlayerMissile(this.x, this.y - 32, 4));
        }
    };
}
PlayerShip.prototype = new SpriteBase();
PlayerShip.prototype.constructor = PlayerShip;






function PlayerMissile(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 0);
    this.collisionClasses = ["PlayerAttack"];
    this.shadowBlur = 20;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.dy = 6;
    this.executeRules = function () {
        this.y -= this.dy;
        if (this.y < -64) this.delete();

        var struckEnemies = getOverlappingSprites(this, "Enemy");
        if (struckEnemies.length > 0) {
            struckEnemies[0].delete();
            this.delete();
        }
    };
}
PlayerMissile.prototype = new SpriteBase();
PlayerMissile.prototype.constructor = PlayerMissile;





function TestEnemy(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.testImage, 0);
    this.collisionClasses = ["Enemy"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.movementCounter = 0;
    this.attackTimer = 200 + Math.random() * 500;
    this.originalScale = this.scale;
    this.executeRules = function () {
        this.movementCounter++;
        this.x += 10 * Math.cos(this.movementCounter / 20);

        this.attackTimer -= 1;
        if (this.attackTimer < 25) {
            this.scale = this.originalScale * (1 + (25 - this.attackTimer) / 75);
        }
        if (this.attackTimer <= 0) {
            this.scale = this.originalScale;
            this.attackTimer = 200 + Math.random() * 500;
            sprites.push(new TestMissile(this.x, this.y + 32, 4));
        }
    };
}
TestEnemy.prototype = new SpriteBase();
TestEnemy.prototype.constructor = TestEnemy;



function TestEnemy2(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.testImage, 1);
    this.collisionClasses = ["Enemy"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.executeRules = function () {
        this.rotation -= Math.PI / 48;
    };
}
TestEnemy2.prototype = new SpriteBase();
TestEnemy2.prototype.constructor = TestEnemy2;



function TestMissile(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 1);
    this.collisionClasses = ["EnemyAttack"];
    this.shadowBlur = 20;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.dy = 6;
    this.executeRules = function () {
        this.y += this.dy;
        if (this.y > viewHeight + 64) this.delete();
    };
}
TestMissile.prototype = new SpriteBase();
TestMissile.prototype.constructor = TestMissile;





function Asteroid(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.testImage, 2);
    this.collisionClasses = ["Enemy"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.dx = Math.random() * 4 - 2;
    this.dy = 12 - this.scale;
    this.executeRules = function () {
        this.x += this.dx;
        this.y += this.dy;
        this.rotation -= Math.PI / 48;
        if (this.y > viewHeight + 64) this.delete();
    };
}
Asteroid.prototype = new SpriteBase();
Asteroid.prototype.constructor = Asteroid;




function BackgroundStar(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.Background, parseInt(Math.random() * 2));
    this.dy = Math.random() * 4 + 16;
    this.executeRules = function () {
        this.y += this.dy;
        if (this.y > viewHeight + 64) {
            this.y = -64;
            this.dy = Math.random() * 4 + 16;
            this.x = Math.random() * viewWidth;
        }
    };
}
BackgroundStar.prototype = new SpriteBase();
BackgroundStar.prototype.constructor = BackgroundStar;






function PowerUpBase(x, y, scale, rotation, shadowColor) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.dy = 3;
    this.shadowColor = shadowColor;
    this.collisionClasses = ["PowerUp"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 8
    };
    this.glowTimer = 0;
    this.executeRules = function () {
        this.shadowBlur = Math.sin((this.glowTimer++) / 10) * 10 + 15;
        this.y += this.dy;
        if (this.y > viewHeight + 64) this.delete();
        var struckPlayer = getOverlappingSprites(this, "Player");
        if (struckPlayer.length > 0) {
            this.powerUpEffect(struckPlayer[0]);
            this.delete();
        }
    };
}
PowerUpBase.prototype = new SpriteBase();
PowerUpBase.prototype.constructor = PowerUpBase;


function PowerUpRepair(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "cyan");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 0);
    this.powerUpEffect = function (ship) {
        
    }
}
PowerUpRepair.prototype = new PowerUpBase();
PowerUpRepair.prototype.constructor = PowerUpRepair;


function PowerUpWeapon(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "magenta");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 1);
    this.powerUpEffect = function (ship) {

    }
}
PowerUpWeapon.prototype = new PowerUpBase();
PowerUpWeapon.prototype.constructor = PowerUpWeapon;


function PowerUpShield(x, y, scale, rotation) {
    PowerUpBase.call(this, x, y, scale, rotation, "lime");
    this.currentFrame = new Frame(graphicSheets.PowerUp, 2);
    this.powerUpEffect = function (ship) {

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
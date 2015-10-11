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
                gameViewContext.closePath();
                gameViewContext.stroke();

            }
        }

        if (this.shield != null) this.shield.draw();
    }

    this.maxHP = 6;
    this.HP = 5;
    this.damage = 5;

    this.handleCollisionDamage = function (category, shieldBlockedCategory) {
        var struckDamagers = getOverlappingSprites(this, category);
        for (var i = 0; i < struckDamagers.length; i++) {
            if (shieldBlockedCategory != undefined &&
                struckDamagers[i].collisionClasses.indexOf(shieldBlockedCategory) > -1 &&
                this.shield != null && this.shield.HP > 0) {

                var shieldHP = this.shield.HP;
                this.shield.applyDamage(struckDamagers[i].damage);
                this.shield.trigger();

                if (this.shield.HP <= 0) {
                    this.applyDamage(struckDamagers[i].damage - shieldHP);
                }
            } else {
                this.applyDamage(struckDamagers[i].damage);
            }
            struckDamagers[i].applyDamage(this.damage);
        }
    }
    
    this.applyHealth = function (health) {
        this.HP += health;
        if (this.HP > this.maxHP) {
            this.HP = this.maxHP;
        } else {
            console.log(this.constructor.name + " healed for " + health + " HP");
        }
    }
    this.applyDamage = function (damage) {
        console.log(this.constructor.name + " took " + damage + " damage");
        if (this.onTakeDamage) this.onTakeDamage();

        this.HP -= damage;
        if (this.HP <= 0) {
            this.HP = 0;
            this.kill();
        }
    }
    this.kill = function () {
        this.delete();
    }


    this.delete = function () {
        console.log("Deleting " + this.constructor.name + " (index " + sprites.indexOf(this) + ")");
        console.log(sprites.map(function (x) { return x.constructor.name; }));

        sprites.splice(sprites.indexOf(this), 1);
    }
}



function PlayerShip(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.PlayerShip, 0);
    this.collisionClasses = ["Player"];
    this.weaponCooldown = 0;
    this.weaponRechargeSpeed = 1;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 8
    };
    this.shield = new Shield(this, 10, "cyan");
    this.shieldRechargeRate = 0.01;
    this.speed = 5;
    this.maxHP = 20;
    this.HP = 20;
    this.executeRules = function () {
        if (this.weaponCooldown > 0) this.weaponCooldown -= this.weaponRechargeSpeed;

        if (keyboardState.isKeyPressed(keyboardState.key.A) && this.x > 0) this.x -= this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.D) && this.x < viewWidth) this.x += this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.S) && this.y < viewHeight) this.y += this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.W) && this.y > 0) this.y -= this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.Space) && this.weaponCooldown <= 0) {
            this.weaponCooldown = 30;
            sprites.push(new PlayerMissile(this.x, this.y - 32, 4));
        }

        if (this.shield.HP > 0) this.shield.applyHealth(this.shieldRechargeRate);

        this.handleCollisionDamage("HurtsPlayer", "BlockedByShield");
    };
}
PlayerShip.prototype = new SpriteBase();
PlayerShip.prototype.constructor = PlayerShip;



function Shield(parent, hp, color) {
    SpriteBase.call(this, parent.x, parent.y);
    this.parent = parent;
    this.color = color;
    this.HP = hp;
    this.maxHP = hp;
    this.shieldTimer = 0;

    this.active = false;
    this.trigger = function () {
        this.active = true;
        this.shieldTimer = 50;
    }

    this.draw = function () {
        if (this.HP <= 0) return;

        var x = this.parent.x;
        var y = this.parent.y;
        var radius = this.parent.currentFrame.graphicSheet.cellHeight * this.parent.scale / 1.5;
        gameViewContext.beginPath();
        gameViewContext.arc(x, y, radius, 0, 2 * Math.PI);
        gameViewContext.strokeStyle = 'rgba(0,255,255,0.3)';
        gameViewContext.closePath();
        gameViewContext.stroke();

        if (!this.active) return;
        var innerRadius = (this.shieldTimer < 200 ? 0 : this.shieldTimer - 200);
        var outerRadius = this.shieldTimer;
        var gradient = gameViewContext.createRadialGradient(x, y - radius, innerRadius, x, y - radius, outerRadius);

        // TODO: make color work from object's color value
        gradient.addColorStop(0, 'rgba(128,128,255,0)');
        gradient.addColorStop(0.9, 'rgba(128,255,255,1)');
        gradient.addColorStop(1, 'rgba(128,255,255,0)');
        gameViewContext.beginPath();
        gameViewContext.arc(x, y, radius, 0, 2 * Math.PI);
        gameViewContext.fillStyle = gradient;
        gameViewContext.closePath();
        gameViewContext.fill();

        this.shieldTimer += 5;
        if (this.shieldTimer > 300) {
            this.active = false;
            this.shieldTimer = 0;
        }
    }
}
Shield.prototype = new SpriteBase();
Shield.prototype.constructor = Shield;




function PlayerMissile(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 2);
    this.collisionClasses = ["PlayerAttack"];
    this.shadowBlur = 20;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.dy = 6;
    this.damage = 3;
    this.HP = 1;
    this.executeRules = function () {
        this.y -= this.dy;
        if (this.y < -64) this.delete();

        this.handleCollisionDamage("Enemy");
    };
}
PlayerMissile.prototype = new SpriteBase();
PlayerMissile.prototype.constructor = PlayerMissile;





function TestEnemy(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.testImage, 0);
    this.collisionClasses = ["Enemy", "HurtsPlayer"];
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
    this.collisionClasses = ["Enemy", "HurtsPlayer"];
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
    this.currentFrame = new Frame(graphicSheets.Projectiles, 3);
    this.collisionClasses = ["EnemyAttack", "HurtsPlayer", "BlockedByShield"];
    this.shadowBlur = 20;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.damage = 3;
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
    this.damage = parseInt(scale / 2);
    this.HP = scale;
    this.maxHP = scale;
    this.collisionClasses = ["Enemy", "HurtsPlayer", "BlockedByShield"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.dx = Math.random() * 4 - 2;
    this.dy = 12 - this.scale;

    this.onTakeDamage = function (damage) {
        this.dx /= 1.5;
        this.dy /= 1.5;
    }

    this.executeRules = function () {
        this.x += this.dx;
        this.y += this.dy;
        this.rotation -= Math.PI / 48;
        if (this.y > viewHeight + 64) this.delete();
    };
}
Asteroid.prototype = new SpriteBase();
Asteroid.prototype.constructor = Asteroid;







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
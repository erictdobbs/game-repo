var drawHitboxes = false;

function SpriteBase(x, y, scale, rotation) {
    this.active = true;

    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.scale = scale === undefined ? 1 : scale;
    this.rotation = rotation === undefined ? 0 : rotation;
    this.spriteClasses = [];
    this.shadowColor = "white";
    this.shadowBlur = 0;
    this.timeSinceHPChange = 1000;
    this.inventory = { commodities: {} }
    this.executeRules = function () { };
    this.draw = function () {
        if (!this.active) return;

        this.timeSinceHPChange += 1;

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

        if (this.spriteClasses.indexOf("Enemy") != -1) {
            var healthBarWidth = 48;
            var healthBarHeight = 4;
            var healthBarX = this.x - healthBarWidth / 2;
            var healthBarY = this.y - (this.hitbox.radius + 2) * this.scale - 4;
            var hpRatio = this.HP / this.maxHP;
            var healthBarOpacity = 3 - this.timeSinceHPChange / 50;
            if (healthBarOpacity > 1) healthBarOpacity = 1.0;
            if (healthBarOpacity < 0) healthBarOpacity = 0;
            if (healthBarOpacity < 0.4 && this.HP != this.maxHP) healthBarOpacity = 0.4;
            gameViewContext.fillStyle = "rgba(255,0,0," + healthBarOpacity.toString() + ")";
            gameViewContext.fillRect(healthBarX + healthBarWidth * hpRatio, healthBarY, healthBarWidth * (1 - hpRatio), healthBarHeight);
            gameViewContext.fillStyle = "rgba(0,255,0," + healthBarOpacity.toString() + ")";
            gameViewContext.fillRect(healthBarX, healthBarY, healthBarWidth * hpRatio, healthBarHeight);
        }
    }

    this.maxHP = 5;
    this.HP = 5;
    this.damage = 5;

    this.handleCollisionDamage = function (category, shieldBlockedCategory) {
        var struckDamagers = getOverlappingSprites(this, category);
        if (struckDamagers.length > 0 && category == "PlayerAttack") AddToScore("Hits Landed", 1);
        if (struckDamagers.length > 0 && category == "HurtsPlayer") AddToScore("Hits Taken", 1);
        for (var i = 0; i < struckDamagers.length; i++) {
            if (shieldBlockedCategory != undefined &&
                struckDamagers[i].spriteClasses.indexOf(shieldBlockedCategory) > -1 &&
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
    
    this.applyHealth = function (health, suppressIndicator) {
        this.HP += health;
        if (this.HP > this.maxHP) {
            this.HP = this.maxHP;
        } else {
            if (!suppressIndicator)
                logMessage(loggingSeverity.verbose, this.constructor.name + " healed for " + health + " HP");
        }
        this.timeSinceHPChange = 0;
        if (!suppressIndicator) {
            numberIndicators.push(new NumberIndicatorHeal(this, parseInt(health)));
        }
    }
    this.applyDamage = function (damage, suppressIndicator) {
        logMessage(loggingSeverity.information, this.constructor.name + " took " + damage + " damage");
        if (this.onTakeDamage) this.onTakeDamage();

        this.HP -= damage;
        if (this.HP <= 0) {
            this.HP = 0;
            this.kill();
        }
        if (!suppressIndicator && this.spriteClasses.indexOf("NoIndicator") == -1) {
            if (this instanceof Shield) numberIndicators.push(new NumberIndicatorShieldDamage(this.parent, parseInt(damage)));
            else numberIndicators.push(new NumberIndicatorDamage(this, parseInt(damage)));
        }
        this.timeSinceHPChange = 0;
    }
    this.kill = function () {
        if (this.onKill) this.onKill();

        SpawnLoot(this);
        this.active = false;
    }

    this.delete = function () {
        logMessage(loggingSeverity.verbose, "Deleting " + this.constructor.name + " (index " + sprites.indexOf(this) + ")");
        logMessage(loggingSeverity.verbose, sprites.map(function (x) { return x.constructor.name; }));

        sprites.splice(sprites.indexOf(this), 1);
    }
}



function PlayerShip(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    particleEffectGenerators.push(new ParticleEffectSmokeGenerator(this, 0, 1));
    this.dx = 0;
    this.dy = 0;
    var frame = new Frame(null, 0);
    frame.imageSource = document.getElementById('shipCanvas');
    frame.graphicSheet = { cellWidth: 17, cellHeight: 17, columns: 1 };
    this.currentFrame = frame;
    this.spriteClasses = ["Player"];
    this.weaponCooldownCounter = 0;
    this.weaponCooldown = 30;
    this.weaponRechargeSpeed = 1;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 8
    };
    this.shield = new Shield(this, 10, new Color(0, 255, 255, 1.0));
    this.shieldRechargeRate = 0.01;
    this.speed = 5;
    this.maxHP = 20;
    this.HP = 20;
    this.bulletDamage = 3;
    this.bulletSpeed = 6;
    this.executeRules = function () {
        if (isShopping || customizingShip) return;

        if (this.weaponCooldownCounter > 0) this.weaponCooldownCounter -= this.weaponRechargeSpeed;

        this.dx = 0;
        this.dy = 0;
        if (keyboardState.isKeyPressed(keyboardState.key.A) && this.x > 0) this.dx = -this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.D) && this.x < viewWidth) this.dx = this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.S) && this.y < viewHeight) this.dy = this.speed;
        if (keyboardState.isKeyPressed(keyboardState.key.W) && this.y > viewHeight * 0.6) this.dy = -this.speed;
        if (isMouseClicked) {
            this.dx = mouseX - this.x;
            this.dy = mouseY - this.y;
        }
        if (this.dx > this.speed) this.dx = this.speed;
        if (this.dx < -this.speed) this.dx = -this.speed;
        if (this.dy > this.speed) this.dy = this.speed;
        if (this.dy < -this.speed) this.dy = -this.speed;
        this.x += this.dx;
        this.y += this.dy;

        if (keyboardState.isKeyPressed(keyboardState.key.Space) || isMouseClicked) {
            if (this.weaponCooldownCounter <= 0) {
                this.weaponCooldownCounter = this.weaponCooldown;
                sprites.push(new PlayerMissile(this.x, this.y - 32, this.bulletSpeed, this.bulletDamage));
                AddToScore("Shots Fired", 1);
            }
        }

        if (this.shield.HP > 0) this.shield.applyHealth(this.shieldRechargeRate, true);

        this.handleCollisionDamage("HurtsPlayer", "BlockedByShield");
    };
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
        for (var i=0; i<20; i++)
            CreateParticleEffectExplosion(this.x + 120 * (Math.random() - 0.5), this.y + 120 * (Math.random() - 0.5));
        setTimeout(function () { sprites.push(new FadeOut(ClearGame, GameOver)); }, 3000);
    }
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

    this.shieldActive = false;
    this.trigger = function () {
        this.shieldActive = true;
        this.shieldTimer = 50;
    }

    this.draw = function () {
        if (this.HP <= 0) return;

        var x = this.parent.x;
        var y = this.parent.y;
        var radius = this.parent.currentFrame.graphicSheet.cellHeight * this.parent.scale / 1.5;
        gameViewContext.beginPath();
        gameViewContext.arc(x, y, radius, 0, 2 * Math.PI);
        this.color.a = 0.3;
        gameViewContext.strokeStyle = this.color.toString();
        gameViewContext.closePath();
        gameViewContext.stroke();

        if (!this.shieldActive) return;
        var innerRadius = (this.shieldTimer < 200 ? 0 : this.shieldTimer - 200);
        var outerRadius = this.shieldTimer;
        var gradient = gameViewContext.createRadialGradient(x, y - radius, innerRadius, x, y - radius, outerRadius);

        this.color.a = 1.0;
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.9, this.color.toString());
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        gameViewContext.beginPath();
        gameViewContext.arc(x, y, radius, 0, 2 * Math.PI);
        gameViewContext.fillStyle = gradient;
        gameViewContext.closePath();
        gameViewContext.fill();

        this.shieldTimer += 5;
        if (this.shieldTimer > 300) {
            this.shieldActive = false;
            this.shieldTimer = 0;
        }
    }
}
Shield.prototype = new SpriteBase();
Shield.prototype.constructor = Shield;



function PlayerMissile(x, y, speed, damage) {
    SpriteBase.call(this, x, y, 4, 0);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 1);
    this.spriteClasses = ["PlayerAttack", "BlockedByShield", "NoIndicator"];
    this.shadowBlur = 20;
    this.rotation = Math.PI / 2;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.dy = speed;
    this.damage = damage;
    this.HP = 1;
    this.executeRules = function () {
        this.y -= this.dy;
        if (this.y < -64) this.kill();
    };
}
PlayerMissile.prototype = new SpriteBase();
PlayerMissile.prototype.constructor = PlayerMissile;



function SpriteInvader(x, y, attackRate, attackDamage) {
    SpriteBase.call(this, x, y, 6, 0);
    this.targetY = y;
    this.y = -100;
    this.currentFrame = new Frame(graphicSheets.Invaders, 0);
    this.spriteClasses = ["EnemyShip", "Enemy", "HurtsPlayer"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.movementCounter = 0;
    this.attackRate = attackRate;
    this.attackDamage = attackDamage;
    this.attackTimer = 200 + Math.random() * 500;
    this.originalScale = this.scale;
    this.executeRules = function () {
        if (this.y < this.targetY) this.y += 2;
        this.movementCounter++;
        this.x += 4 * Math.cos(this.movementCounter / 18);

        this.attackTimer -= this.attackRate;
        if (this.attackTimer < 25) {
            this.scale = this.originalScale * (1 + (25 - this.attackTimer) / 75);
        }
        if (this.attackTimer <= 0) {
            this.scale = this.originalScale;
            this.attackTimer = 200 + Math.random() * 500;
            sprites.push(new SpriteEnemyBullet(this.x, this.y + 32, this.attackDamage));
        }

        this.handleCollisionDamage("PlayerAttack", "BlockedByShield");
    };

    this.itemDropPool = [itemTypes.Pixelite, itemTypes.PowerCell];
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
    }
}
SpriteInvader.prototype = new SpriteBase();
SpriteInvader.prototype.constructor = SpriteInvader;



function SpriteInvaderSniper(y, target) {
    SpriteBase.call(this, -100, y, 6, 0);
    this.target = target;
    this.shield = new Shield(this, 10, new Color(255, 255, 0, 1.0));
    this.currentFrame = new Frame(graphicSheets.Invaders, 4);
    this.spriteClasses = ["EnemyShip", "Enemy", "HurtsPlayer"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.acceleration = 0.5;
    this.maxSpeed = 5;
    this.attackTimer = 300 + Math.random() * 500;
    this.executeRules = function () {
        if (this.x > this.target.x) this.dx -= this.acceleration;
        else this.dx += this.acceleration;
        if (this.dx > this.maxSpeed) this.dx = this.maxSpeed;
        if (this.dx < -this.maxSpeed) this.dx = -this.maxSpeed;

        this.attackTimer -= 1;
        if (this.attackTimer > 25) this.x += this.dx;

        if (this.attackTimer <= 0) {
            this.attackTimer = 300 + Math.random() * 500;
            sprites.push(new SpriteLaser(this.x, this.y + 32, 4));
        }


        this.handleCollisionDamage("PlayerAttack", "BlockedByShield");
    };

    this.itemDropPool = [itemTypes.Pixelite, itemTypes.FuelCluster];
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
    }
}
SpriteInvaderSniper.prototype = new SpriteBase();
SpriteInvaderSniper.prototype.constructor = SpriteInvaderSniper;



function SpriteInvaderTurret(x, y, damage) {
    SpriteBase.call(this, x, y, 0, 0);
    this.target = player;
    this.maxHP = 30;
    this.HP = 30;
    this.currentFrame = new Frame(graphicSheets.Invaders, 2);
    this.spriteClasses = ["EnemyShip", "Enemy", "HurtsPlayer"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.originalScale = 6;
    this.rotationSpeed = Math.PI / 48;
    this.attackTimer = 200 + Math.random() * 300;
    this.missileDamage = damage;
    this.executeRules = function () {
        var targetRotation = Math.atan2(-this.target.y + this.y, this.target.x - this.x) + Math.PI / 2;
        var rotationDiff = this.rotation - targetRotation;
        rotationDiff %= (2 * Math.PI);

        if (Math.abs(rotationDiff) > 0.1) {
            if (rotationDiff > 0) this.rotation -= this.rotationSpeed;
            else this.rotation += this.rotationSpeed;
        }

        if (this.rotation > Math.PI) this.rotation -= 2 * Math.PI;
        if (this.rotation < -Math.PI) this.rotation += 2 * Math.PI;

        this.attackTimer -= 1;

        this.scale += 0.1;
        if (this.scale > this.originalScale) this.scale = this.originalScale;
        if (this.attackTimer < 50 && this.attackTimer != 0) {
            this.scale = this.originalScale * (1 + Math.random() / 5);
        }

        if (this.attackTimer <= 0) {
            this.attackTimer = 200 + Math.random() * 500;
            sprites.push(new SpriteMissile(this.x, this.y, this.missileDamage, this.rotation));
        }


        this.handleCollisionDamage("PlayerAttack", "BlockedByShield");
    };

    this.itemDropPool = [itemTypes.PowerCell, itemTypes.ShieldModule];
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
    }
}
SpriteInvaderTurret.prototype = new SpriteBase();
SpriteInvaderTurret.prototype.constructor = SpriteInvaderTurret;



function SpriteInvaderBulwark(x, y) {
    SpriteBase.call(this, -100, y, 12, 0);
    this.maxHP = 50;
    this.HP = 50;
    this.targetX = x;
    this.currentFrame = new Frame(graphicSheets.Invaders, 1);
    this.spriteClasses = ["EnemyShip", "Enemy", "HurtsPlayer"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    this.executeRules = function () {
        if (this.x < this.targetX) this.x += this.scale / 4;

        this.handleCollisionDamage("PlayerAttack", "BlockedByShield");
    };

    this.itemDropPool = [itemTypes.Pixelite, itemTypes.BulwarkPanel];
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
    }
}
SpriteInvaderBulwark.prototype = new SpriteBase();
SpriteInvaderBulwark.prototype.constructor = SpriteInvaderBulwark;



function SpriteInvaderGarage(x, y) {
    SpriteBase.call(this, viewWidth + 100, y, 6, 0);
    this.maxHP = 10;
    this.HP = 10;
    this.shield = new Shield(this, 20, new Color(255, 0, 255, 1.0));
    this.targetX = x;
    this.currentFrame = new Frame(graphicSheets.Invaders, 3);
    this.spriteClasses = ["EnemyShip", "Enemy", "HurtsPlayer"];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };

    this.attackTimer = 400 + Math.random() * 500;

    this.executeRules = function () {
        this.rotation += Math.PI / 300;
        this.rotation += Math.PI / (this.attackTimer);

        if (this.x > this.targetX) this.x -= this.scale;
        this.attackTimer -= 1;
        if (this.attackTimer <= 0) {
            this.attackTimer = 400 + Math.random() * 500;
            sprites.push(new SpriteEnemyHealthBubble(this.x, this.y, 10));
        }

        this.handleCollisionDamage("PlayerAttack", "BlockedByShield");
    };

    this.itemDropPool = [itemTypes.Pixelite, itemTypes.ShieldModule];
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
    }
}
SpriteInvaderGarage.prototype = new SpriteBase();
SpriteInvaderGarage.prototype.constructor = SpriteInvaderGarage;



function SpriteEnemyHealthBubble(x, y, healthValue) {
    SpriteBase.call(this, x, y, 24, 0);
    this.spriteClasses = [];
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.targetScale = 100;
    this.healTimer = 0;
    this.healthValue = healthValue;
    this.executeRules = function () {
        if (this.scale < this.targetScale) this.scale *= 1.01;
        if (this.scale >= this.targetScale) {
            this.scale = this.targetScale;
            this.healTimer += 1;
        }

        if (this.healTimer == 50) {
            var overlappingEnemies = getOverlappingSprites(this, "EnemyShip");
            for (var i = 0; i < overlappingEnemies.length; i++)
                overlappingEnemies[i].applyHealth(this.healthValue);
            this.kill();
        }
    };

    this.draw = function () {
        gameViewContext.beginPath();
        gameViewContext.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
        gameViewContext.fillStyle = "rgba(255,0,255,0.05)";
        gameViewContext.strokeStyle = "rgba(255,0,255,1.0)";
        gameViewContext.closePath();
        gameViewContext.fill();
        gameViewContext.stroke();
    }
}
SpriteEnemyHealthBubble.prototype = new SpriteBase();
SpriteEnemyHealthBubble.prototype.constructor = SpriteEnemyHealthBubble;






function SpriteEnemyBullet(x, y, damage) {
    SpriteBase.call(this, x, y, 4, 0);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 0);
    this.spriteClasses = ["EnemyAttack", "HurtsPlayer", "BlockedByShield", "NoIndicator"];
    this.shadowBlur = 20;
    this.rotation = Math.PI/2;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.damage = damage;
    this.dy = 6;
    this.executeRules = function () {
        this.y += this.dy;
        if (this.y > viewHeight + 64) this.kill();
    };
}
SpriteEnemyBullet.prototype = new SpriteBase();
SpriteEnemyBullet.prototype.constructor = SpriteEnemyBullet;



function SpriteMissile(x, y, damage, rotation) {
    SpriteBase.call(this, x, y, 4, rotation);
    particleEffectGenerators.push(new ParticleEffectMissileSmokeGenerator(this, 0, 0));
    this.currentFrame = new Frame(graphicSheets.Projectiles, 3);
    this.spriteClasses = ["EnemyAttack", "HurtsPlayer", "BlockedByShield", "NoIndicator"];
    this.shadowBlur = 20;
    this.rotation -= Math.PI / 2;
    this.velocity = 4;
    this.rotationSpeed = 0.5 * Math.PI / 180;
    this.target = player;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.damage = damage;
    
    this.executeRules = function () {
        var targetThetaOffset = (Math.atan2(-(this.target.y - this.y), this.target.x - this.x) - this.rotation - Math.PI/2) % (Math.PI * 2);
        var targetToLeft = (targetThetaOffset + Math.PI * 2) % Math.PI * 2 < Math.PI;
        this.rotation += -(targetToLeft ? 1 : -1) * this.rotationSpeed;
        this.dy = -this.velocity * Math.sin(this.rotation);
        this.dx = this.velocity * Math.cos(this.rotation);
        this.y += this.dy;
        this.x += this.dx;
        if (this.y > viewHeight + 64) this.kill();
        if (this.x > viewWidth + 64) this.kill();
        if (this.x < -64) this.kill();
    };
}
SpriteMissile.prototype = new SpriteBase();
SpriteMissile.prototype.constructor = SpriteMissile;



function SpriteLaser(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 2);
    this.spriteClasses = ["EnemyAttack", "HurtsPlayer", "BlockedByShield", "NoIndicator"];
    this.shadowBlur = 20;
    this.rotation = Math.PI / 2;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 1
    };
    this.damage = 2;
    this.dy = 12;
    this.executeRules = function () {
        this.y += this.dy;
        if (this.y > viewHeight + 64) this.kill();
    };
}
SpriteLaser.prototype = new SpriteBase();
SpriteLaser.prototype.constructor = SpriteLaser;



function Asteroid(x, scale) {
    SpriteBase.call(this, x, -100, scale, 0);
    if (this.scale < 3.5) this.scale = 3.5;
    this.currentFrame = new Frame(graphicSheets.Asteroid, 0);
    this.damage = parseInt(scale / 2);
    this.HP = scale;
    this.maxHP = scale;
    this.spriteClasses = ["Enemy", "HurtsPlayer", "BlockedByShield"];
    this.rotationSpeed = Math.PI / 48;
    this.hitbox = {
        type: hitboxType.Circle,
        radius: 4
    };
    //this.dx = Math.random() * 4 - 2;
    this.dy = 12 - this.scale;
    if (this.dy <= 2) this.dy = 2;

    this.onTakeDamage = function (damage) {
        this.scale *= 0.9;
        if (this.scale < 3.5) this.scale = 3.5;
        this.rotationSpeed *= 1.1;
    }

    this.executeRules = function () {
        this.x += this.dx;
        this.y += this.dy;
        this.rotation -= this.rotationSpeed;
        if (this.y > viewHeight + 256) this.kill();

        this.handleCollisionDamage("PlayerAttack", "BlockedByShield");
    };

    this.itemDropPool = [itemTypes.MeteorOre];
    this.onKill = function () {
        CreateParticleEffectExplosion(this.x, this.y);
    }
}
Asteroid.prototype = new SpriteBase();
Asteroid.prototype.constructor = Asteroid;

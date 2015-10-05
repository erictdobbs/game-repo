

function SpriteBase(x, y, scale, rotation) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.scale = scale === undefined ? 1 : scale;
    this.rotation = rotation === undefined ? 0 : rotation;
    this.executeRules = function () { };
    //this.currentFrame = new Frame(graphicSheets.testImage, 0);
    this.draw = function () {
        this.currentFrame.draw(this.x, this.y, this.scale, this.rotation);
    }
}



function PlayerShip(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.PlayerShip, 0);
    this.weaponCooldown = 0;
    this.executeRules = function () {
        if (this.weaponCooldown > 0) this.weaponCooldown -= 1;

        if (keyboardState.isKeyPressed(keyboardState.key.A) && this.x > 0) this.x -= 5;
        if (keyboardState.isKeyPressed(keyboardState.key.D) && this.x < viewWidth) this.x += 5;
        if (keyboardState.isKeyPressed(keyboardState.key.S) && this.y < viewHeight) this.y += 5;
        if (keyboardState.isKeyPressed(keyboardState.key.W) && this.y > 0) this.y -= 5;
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
    this.dy = 6;
    this.executeRules = function () {
        this.y -= this.dy;
        if (this.y < -64) sprites.splice(sprites.indexOf(this), 1);
    };
}
PlayerMissile.prototype = new SpriteBase();
PlayerMissile.prototype.constructor = PlayerMissile;





function TestEnemy(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.testImage, 0);
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
    this.executeRules = function () {
        this.rotation -= Math.PI / 48;
    };
}
TestEnemy2.prototype = new SpriteBase();
TestEnemy2.prototype.constructor = TestEnemy2;



function TestMissile(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.Projectiles, 1);
    this.dy = 6;
    this.executeRules = function () {
        this.y += this.dy;
        if (this.y > viewHeight + 64) sprites.splice(sprites.indexOf(this), 1);
    };
}
TestMissile.prototype = new SpriteBase();
TestMissile.prototype.constructor = TestMissile;





function Asteroid(x, y, scale, rotation) {
    SpriteBase.call(this, x, y, scale, rotation);
    this.currentFrame = new Frame(graphicSheets.testImage, 2);
    this.dx = Math.random() * 4 - 2;
    this.dy = 12 - this.scale;
    this.executeRules = function () {
        this.x += this.dx;
        this.y += this.dy;
        this.rotation -= Math.PI / 48;
        if (this.y > viewHeight + 64) sprites.splice(sprites.indexOf(this), 1);
    };
}
Asteroid.prototype = new SpriteBase();
Asteroid.prototype.constructor = Asteroid;

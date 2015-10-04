

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
            sprites.push(new TestMissile(this.x, this.y + 32, 8));
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
    this.currentFrame = new Frame(graphicSheets.testImage, 2);
    this.dy = 6;
    this.executeRules = function () {
        this.y += this.dy;
        if (this.y > viewHeight + 64) sprites.splice(sprites.indexOf(this), 1);
    };
}
TestMissile.prototype = new SpriteBase();
TestMissile.prototype.constructor = TestMissile;
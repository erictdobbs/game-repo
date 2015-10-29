

function SpriteGameLogo(x, y) {
    SpriteBase.call(this, x, y, 5, 0);
    this.currentFrame = new Frame(graphicSheets.GameLogo, 0);
    this.counter = 0;
    this.executeRules = function () {
        this.counter += 1;
        this.rotation += Math.cos(this.counter / 50) / 1000;
        this.scale += Math.cos(this.counter / 20) / 200;
    };
}
SpriteGameLogo.prototype = new SpriteBase();
SpriteGameLogo.prototype.constructor = SpriteGameLogo;


function StudioLogo(x, y) {
    SpriteBase.call(this, x, y, 1, 0);
    this.currentFrame = new Frame(graphicSheets.StudioLogo, 0);
}
StudioLogo.prototype = new SpriteBase();
StudioLogo.prototype.constructor = StudioLogo;


function FadeOut(fadeOutCallback, fadeInCallBack) {
    SpriteBase.call(this, 0, 0, 0, 0);
    this.fadeOutCallback = fadeOutCallback;
    this.fadeInCallBack = fadeInCallBack;
    this.color = new Color(30, 30, 80, 0);
    this.executeRules = function () {
        this.color.a += 0.05;
        if (this.color.a >= 1) {
            this.delete();
            if (this.fadeOutCallback) this.fadeOutCallback();
            sprites.push(new FadeIn(this.fadeInCallBack));
        }
    }
    this.draw = function () {
        gameViewContext.fillStyle = this.color.toString();
        gameViewContext.fillRect(0, 0, viewWidth, viewHeight);
    }
}
FadeOut.prototype = new SpriteBase();
FadeOut.prototype.constructor = FadeOut;


function FadeIn(callback) {
    SpriteBase.call(this, 0, 0, 0, 0);
    this.callback = callback;
    this.color = new Color(30, 30, 80, 1.0);
    this.executeRules = function () {
        this.color.a -= 0.05;
        if (this.color.a <= 0) {
            this.delete();
            if (this.callback) this.callback();
        }
    }
    this.draw = function () {
        gameViewContext.fillStyle = this.color.toString();
        gameViewContext.fillRect(0, 0, viewWidth, viewHeight);
    }
}
FadeIn.prototype = new SpriteBase();
FadeIn.prototype.constructor = FadeIn;



function GameStarter() {
    this.initialized = false;
    this.counter = 0;
    this.draw = function () { };
    this.executeRules = function () {
        this.counter += 1;
        if (!this.initialized) {
            this.initialized = true;
            for (var i = 0; i < buttons.length; i++) buttons[i].dy = 0;
            for (var i = 0; i < sprites.length; i++) sprites[i].dy = 0;
        }
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].dy += 0.2;
            buttons[i].y += buttons[i].dy;
        }
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].dy += 0.2;
            sprites[i].y += sprites[i].dy;
        }
        if (this.counter >= 100) {
            StartGame();
            sprites.push(new FadeIn());
        }
    };
}
GameStarter.prototype = new SpriteBase();
GameStarter.prototype.constructor = GameStarter;


function MainMenu() {
    ClearGame();
    sprites.push(new SpriteGameLogo(400, 100));
    sprites.push(new StudioLogo(140, 570));


    var playButton = new Button(300, 230, 200, 60, "START GAME");
    playButton.onClick = function () {
        this.sparkle();
        for (var i = 0; i < buttons.length; i++) buttons[i].onClick = null;
        sprites.push(new GameStarter());
    }
    buttons.push(playButton);

    var instructionsButton = new Button(300, 310, 200, 60, "INSTRUCTIONS");
    instructionsButton.onClick = function () {
        if (this.clicked) return;
        this.clicked = true;
        this.sparkle();
        var instructions = new Button(520, 230, 200, 40, "WASD to move.");
        instructions.font = "16px monospace";
        buttons.push(instructions);
        var instructions2 = new Button(520, 270, 200, 50, "Space to shoot.");
        instructions2.font = "16px monospace";
        buttons.push(instructions2);
        var instructions3 = new Button(520, 320, 200, 50, "That's it.");
        instructions3.font = "16px monospace";
        buttons.push(instructions3);
    };
    buttons.push(instructionsButton);

    var customizeButton = new Button(300, 390, 200, 60, "CUSTOMIZE SHIP");
    customizeButton.onClick = function () {
        sprites.push(new FadeOut(ShipCustomization));
    }
    buttons.push(customizeButton);
}


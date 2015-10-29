

function GameOver() {
    sprites.push(new GameOverHandler());
}

function GameOverHandler() {
    SpriteBase.call(this, 0, viewHeight, 0, 0);
    this.counter = 0;
    this.executeRules = function () {
        this.counter += 1
        this.y = shoppingCosMap(viewHeight, 0, (this.counter > 100 ? 100 : this.counter) / 100);
        DrawScores([levelScores], levelScores.length - 1, 0, this.y, "GAME OVER");
        if (keyboardState.isKeyPressed(keyboardState.key.Space))
            MainMenu();
    }
    this.draw = function () {}
}
GameOverHandler.prototype = new SpriteBase();
GameOverHandler.prototype.constructor = GameOverHandler;
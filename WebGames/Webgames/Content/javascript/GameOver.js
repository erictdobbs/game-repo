

function GameOver() {
    sprites.push(new GameOverHandler());
}

function GameOverHandler() {
    SpriteBase.call(this, 0, viewHeight, 0, 0);
    this.counter = 0;
    this.shareButton = new Button(150, 500, 250, 50, "CHALLENGE A FRIEND");
    this.shareButton.onClick = function () { DisplayShareLink(); };
    this.mainMenuButton = new Button(450, 500, 250, 50, "MAIN MENU");
    this.mainMenuButton.onClick = function () {
        levelScores = [];
        MainMenu();
    };
    this.executeRules = function () {
        this.counter += 1
        this.y = shoppingCosMap(viewHeight, 0, (this.counter > 100 ? 100 : this.counter) / 100);
        DrawScores(0, this.y, "GAME OVER");

        if (this.counter == 100) {
            buttons.push(this.shareButton);
            buttons.push(this.mainMenuButton);
        }
    }
    this.draw = function () {}
}
GameOverHandler.prototype = new SpriteBase();
GameOverHandler.prototype.constructor = GameOverHandler;



function DisplayShareLink() {
    var parameters = GetGameLinkParameters();
    var shareLink = createUrlWithParameters(parameters);
    prompt("Share this link to challenge someone to beat your scores!", shareLink);
}

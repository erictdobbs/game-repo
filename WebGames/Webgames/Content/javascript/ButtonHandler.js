var buttons = [];

function Button() {
    this.color = new Color(0, 0, 0, 0.3);
    this.textColor = new Color(255, 255, 255, 1.0);
    this.x = 0;
    this.y = 0;
    this.width = 300;
    this.height = 100;
    this.text = "Button!";
    this.font = "20px Arial";
    this.draw = function () {
        var y = this.y;
        if (this.getOffset) y += this.getOffset();

        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = this.color.toString();
        gameViewContext.fillRect(this.x, y, this.width, this.height);
        gameViewContext.font = this.font;
        var textSize = gameViewContext.measureText(this.text);
        gameViewContext.fillStyle = this.textColor.toString();
        gameViewContext.fillText(this.text, this.x + this.width / 2 - textSize.width / 2, y + this.height / 2 + 10);
    }

    this.onClick = function () {    }

    this.delete = function () {
        buttons.splice(buttons.indexOf(this), 1);
    }

    this.sparkle = function () {
        CreateParticleEffectSparkleRange(this.x, this.y, this.width, this.height);
    }
}

function onMouseClick(e) {
    if (currentShoppingState != shoppingStates.shopping) return;
    var x = event.x;
    var y = event.y;
    var canvas = document.getElementById("gameView");
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        if (button.x <= x && button.width + button.x >= x &&
            button.y <= y && button.height + button.y >= y) {
            button.onClick();
        }
    }
}
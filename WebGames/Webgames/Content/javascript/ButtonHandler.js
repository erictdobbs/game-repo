var buttons = [];

function Button(x, y, width, height, text) {
    this.color = new Color(0, 0, 0, 0.3);
    this.textColor = new Color(255, 255, 255, 1.0);
    this.x = 0;
    this.y = 0;
    this.width = 300;
    this.height = 100;
    this.text = "Button!";
    this.selected = false;
    if (x) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
    }
    this.font = "20px monospace";
    this.draw = function () {
        var y = this.y;
        if (this.getOffset) y += this.getOffset();

        gameViewContext.shadowColor = "white";
        gameViewContext.shadowBlur = 0;
        if (this.selected) gameViewContext.shadowBlur = 15;
        gameViewContext.fillStyle = this.color.toString();
        gameViewContext.fillRect(this.x, y, this.width, this.height);
        gameViewContext.font = this.font;
        var textSize = gameViewContext.measureText(this.text);
        gameViewContext.fillStyle = this.textColor.toString();
        gameViewContext.fillText(this.text, this.x + this.width / 2 - textSize.width / 2, y + this.height / 2 + 10);
    }

    this.radioSelect = function () {
        for (var i = 0; i < buttons.length; i++) buttons[i].selected = false;
        this.selected = true;
    }

    this.onClick = function () {    }

    this.delete = function () {
        buttons.splice(buttons.indexOf(this), 1);
    }

    this.sparkle = function () {
        CreateParticleEffectSparkleRange(this.x, this.y, this.width, this.height);
    }
}

function HandleButtonClickAtPosition(x, y) {
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        if (button.x <= x && button.width + button.x > x &&
            button.y <= y && button.height + button.y > y) {
            if (button.onClick) button.onClick();
        }
    }
}
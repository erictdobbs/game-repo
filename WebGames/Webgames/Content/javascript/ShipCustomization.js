
var customizingShip = false;
var shipColors = [];
var paintButtons = [];

function ShipCustomization() {
    ClearGame();
    customizingShip = true;

    var ship = new PlayerShip(viewWidth / 4, viewHeight / 2, 12);
    sprites.push(ship);

    for (var cRed = 0; cRed < 16; cRed += 5) {
        for (var cGreen = 0; cGreen < 16; cGreen += 5) {
            for (var cBlue = 0; cBlue < 16; cBlue += 5) {
                var x = 500 + cRed * 14;
                var y = 38 + cBlue * 5 + cGreen * 24;
                var colorButton = new Button(x, y, 60, 18, "");
                colorButton.color = new Color(cRed * 17, cGreen * 17, cBlue * 17, 1.0)
                colorButton.onClick = function () {
                    this.radioSelect();
                }
                buttons.push(colorButton);
            }
        }
    }
    buttons[0].radioSelect();

    paintButtons = [];
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5; j++) {
            var paintButton = new Button(12 * j + ship.x - 30, 12 * i + ship.y - 6, 12, 12, "");
            paintButton.color = RandomShipColor();
            if (shipColors.length != 0) paintButton.color = shipColors[i + j * 5];
            paintButton.onClick = function () {
                this.color = GetSelectedColor();
            }
            buttons.push(paintButton);
            paintButtons.push(paintButton);
        }
    }

    var doneButton = new Button(500, 520, 125, 50, "DONE");
    doneButton.onClick = function () {
        customizingShip = false;
        SaveCustomizationToImage('shipCanvas', paintButtons.map(function (x) { return x.color;}));
        sprites.push(new FadeOut(MainMenu));
    }
    buttons.push(doneButton);

    var cancelButton = new Button(645, 520, 125, 50, "CANCEL");
    cancelButton.onClick = function () {
        customizingShip = false;
        sprites.push(new FadeOut(MainMenu));
    }
    buttons.push(cancelButton);
}

function RandomShipColor() {
    var red = parseInt(Math.random() * 4) * 85;
    var green = parseInt(Math.random() * 4) * 85;
    var blue = parseInt(Math.random() * 4) * 85;
    return new Color(red, green, blue, 1.0);
}

function GetSelectedColor() {
    for (var i = 0; i < buttons.length; i++)
        if (buttons[i].selected) return buttons[i].color;
    return RandomShipColor();
}


function SaveCustomizationToImage(targetCanvasId, colors) {
    var targetImage = document.getElementById('PlayerShip');
    var shipCanvas = document.getElementById(targetCanvasId);
    var customizationCanvas = document.getElementById('customizationCanvas');

    shipColors = [];
    var ctx = customizationCanvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, customizationCanvas.width, customizationCanvas.height);
    for (var i = 0; i < colors.length; i++) {
        var color = colors[i];
        if (targetCanvasId == "shipCanvas") shipColors.push(color);

        var redIndex = i * 4;
        var greenIndex = redIndex + 1;
        var blueIndex = redIndex + 2;
        var alphaIndex = redIndex + 3;

        imageData.data[redIndex] = color.r;
        imageData.data[greenIndex] = color.g;
        imageData.data[blueIndex] = color.b;
        imageData.data[alphaIndex] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    var shipCtx = shipCanvas.getContext('2d');
    shipCtx.drawImage(targetImage, 0, 0);
    shipCtx.drawImage(customizationCanvas, 6, 8);
}
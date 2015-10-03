var viewWidth = 800;
var viewHeight = 600;
window.onload = startGame;

var gameViewContext;
var mouseInfo = { x: 0, y: 0, pressed: false, oldX: 0, oldY: 0, clicked: false };
var mainLoop = { interval: null, milliseconds: 20 };

function startGame() {
    initGraphicSheets();
    var gameView = document.getElementById('gameView');

    gameView.onmousedown = function (e) {
        e = e || window.event;
        mouseInfo.x = e.clientX;
        mouseInfo.y = e.clientY;
        mouseInfo.pressed = true;
        mouseInfo.clicked = true;
    };

    gameView.onmousemove = function (e) {
        e = e || window.event;
        mouseInfo.x = e.clientX;
        mouseInfo.y = e.clientY;
    };

    gameView.onmouseup = function (e) {
        mouseInfo.pressed = false;
    };

    gameView.onmouseout = function (e) {
        mouseInfo.pressed = false;
    };

    gameView.ontouchstart = function (e) {
        e = e || window.event;
        e.preventDefault();
        var touch = e.touches.item(0);
        mouseInfo.x = touch.clientX;
        mouseInfo.y = touch.clientY;
        mouseInfo.pressed = true;
        mouseInfo.clicked = true;
    };

    gameView.ontouchmove = function (e) {
        e = e || window.event;
        e.preventDefault();
        var touch = e.touches.item(0);
        mouseInfo.x = touch.clientX;
        mouseInfo.y = touch.clientY;
        mouseInfo.pressed = true;
    };

    gameView.ontouchend = function (e) {
        e = e || window.event;
        e.preventDefault();
        mouseInfo.pressed = false;
    }

    gameViewContext = gameView.getContext('2d');
    gameViewContext.imageSmoothingEnabled = false;
    mainLoop.interval = setInterval(pulse, mainLoop.milliseconds);
}

function pulse() {
    testDraw();
    cycleMouseInfo();

}

function cycleMouseInfo() {
    mouseInfo.oldX = mouseInfo.x;
    mouseInfo.oldY = mouseInfo.y;
    mouseInfo.clicked = false;
}




function SpriteBase() {
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.rotate = 0;
    //this.currentFrame = new Frame(graphicSheets.testImage, 0);
    this.draw = function () {
        this.currentFrame.draw(this.x, this.y, this.scale, this.rotation);
    }
}

function TestEnemy() {
    this.currentFrame = new Frame(graphicSheets.testImage, 0);
}
TestEnemy.prototype = new SpriteBase();
TestEnemy.prototype.constructor = TestEnemy;




var totalFrames = 0;
var totalTime = 0;

var test = 0;
function testDraw() {
    gameViewContext.clearRect(0, 0, viewWidth, viewHeight);
    gameViewContext.fillStyle = "white";
    gameViewContext.fillRect(Math.random() * viewWidth, Math.random() * viewHeight, 5, 5);

    var t = new Date();

    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 3; j++) {
            var enemy = new TestEnemy();
            enemy.x = i*150;
            enemy.y = j*150;
            enemy.scale = 16;
            enemy.rotation = ((i+j) % 2 == 0 ? test : -test); 
            enemy.draw();
        }
    }
    test += Math.PI / 24;
}

Array.prototype.rand = function () {
    return this[Math.floor(Math.random() * this.length)];
};


//
// Graphic Sheets   
// Represent raw image data divided into tiles  
//

var graphicSheets = new Object();
function GraphicSheet(image, cellWidth, cellHeight) {
    this.image = image;
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    this.columns = image.width / cellWidth;
    this.rows = image.height / cellHeight;
}
function initGraphicSheets() {
    var images = document.getElementsByClassName("graphicSheet");
    for (var i = 0; i < images.length; i++) {
        var imageName = images[i].id;
        var cellWidth = parseInt(images[i].dataset.cellwidth);
        var cellHeight = parseInt(images[i].dataset.cellheight);
        var sheet = new GraphicSheet(images[i], cellWidth, cellHeight);
        graphicSheets[imageName] = sheet;
    }
}


//
// Frames
// Represent tiles of image data
//

function Frame(graphicSheet, cellIndex) {
    this.graphicSheet = graphicSheet;
    this.imageSource = graphicSheet.image;
    this.cellIndex = cellIndex;
}
Frame.prototype.draw = function (x, y, scale, rotation) {
    if (this.imageSource == null) return;
    if (scale === undefined) scale = 1;
    if (rotation === undefined) rotation = 0;

    var frameWidth = this.graphicSheet.cellWidth;
    var frameHeight = this.graphicSheet.cellHeight;
    var imageX = (this.cellIndex % this.graphicSheet.columns) * this.graphicSheet.cellWidth;
    var imageY = Math.floor(this.cellIndex / this.graphicSheet.columns) * this.graphicSheet.cellHeight;

    gameViewContext.save();
    gameViewContext.transform(1, 0, 0, 1, x, y);
    gameViewContext.rotate(-rotation);
    gameViewContext.drawImage(this.imageSource, imageX, imageY, frameWidth, frameHeight,
        -frameWidth * scale / 2, -frameHeight * scale / 2, frameWidth * scale, frameHeight * scale);

    gameViewContext.restore();
};
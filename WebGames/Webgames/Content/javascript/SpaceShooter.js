var viewWidth = 800;
var viewHeight = 600;
window.onload = startGame;

var gameViewContext;
var mouseInfo = { x: 0, y: 0, pressed: false, oldX: 0, oldY: 0, clicked: false };
var mainLoop = { interval: null, milliseconds: 20 };

function startGame() {
    initGraphicSheets();
    initFrameSets();
    //initTilesets();
    //initTileCategories();
    //firstMap();
    //onGameStart();
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

var test = 0;
function testDraw() {
    gameViewContext.clearRect(0, 0, viewWidth, viewHeight);
    gameViewContext.fillStyle = "white";
    gameViewContext.fillRect(Math.random() * viewWidth, Math.random() * viewHeight, 5, 5);

    var imageFile = document.getElementById("testImage");

    gameViewContext.translate(228, 228);
    gameViewContext.rotate(test);
    gameViewContext.drawImage(imageFile, 0, 0, 8, 8, -128, -128, 256, 256);
    gameViewContext.rotate(-test);
    gameViewContext.translate(-228, -228);
    test += 0.06
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
Frame.prototype.draw = function (ctx, x, y) {
    if (this.imageSource == null) return;
    var imageX = (this.cellIndex % this.graphicSheet.columns) * this.graphicSheet.cellWidth;
    var imageY = Math.floor(this.cellIndex / this.graphicSheet.columns) * this.graphicSheet.cellHeight;
    var frameWidth = this.graphicSheet.cellWidth;
    var frameHeight = this.graphicSheet.cellHeight;
    ctx.drawImage(this.imageSource, imageX, imageY, frameWidth, frameHeight, x, y, frameWidth, frameHeight);
};


//
// XFrames
// Represent tiles of image data with predefined 
// rotation, translation, and scaling
//

function XFrame(m11, m12, m21, m22, dx, dy, graphicSheet, cellIndex) {
    this.m11 = m11; // Horizontal scaling
    this.m12 = m12; // Vertical shearing
    this.m21 = m21; // Horizontal shearing
    this.m22 = m22; // Vertical scaling
    this.dx = dx;   // Horizontal offset
    this.dy = dy;   // Vertical offset
    this.graphicSheet = graphicSheet;
    this.imageSource = graphicSheet.image;
    this.cellIndex = cellIndex;
}
XFrame.prototype.draw = function (ctx, x, y) {
    ctx.save();
    ctx.transform(this.m11, this.m12, this.m21, this.m22, this.dx + x, this.dy + y);
    var imageX = (this.cellIndex % this.graphicSheet.columns) * this.graphicSheet.cellWidth;
    var imageY = Math.floor(this.cellIndex / this.graphicSheet.columns) * this.graphicSheet.cellHeight;
    var frameWidth = this.graphicSheet.cellWidth;
    var frameHeight = this.graphicSheet.cellHeight;
    ctx.drawImage(this.imageSource, imageX, imageY, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
    ctx.restore();
};


// 
// Framesets
// Represent collections of Frames
//

var frameSets = new Object();
function FrameSet(name, frames) {
    this.name = name;
    this.frames = frames;
}
function initFrameSets() {
    for (graphicSheetName in graphicSheets) {
        var frames = [];
        var graphicSheet = graphicSheets[graphicSheetName];
        for (var i = 0; i < graphicSheet.columns * graphicSheet.rows; i++) 
            frames.push(new Frame(graphicSheet, i));
        frameSets[graphicSheetName] = new FrameSet(graphicSheetName, frames);
    }
}


//
// Sprite Definitions
// Represents the logic and rules for moveable game objects
//

var spriteDefinitions = new Object();



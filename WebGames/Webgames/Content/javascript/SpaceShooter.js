var viewWidth = 800;
var viewHeight = 600;
window.onload = startGame;

var gameViewContext;
var sprites = [];
var mouseInfo = { x: 0, y: 0, pressed: false, oldX: 0, oldY: 0, clicked: false };
var mainLoop = { interval: null, milliseconds: 20 };

function startGame() {
    initGraphicSheets();
    initializeSprites();
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




function initializeSprites() {
    sprites.push(new PlayerShip(400, 500, 4));

    sprites.push(new TestEnemy(200, 80, 8));
    sprites.push(new TestEnemy(300, 80, 8));
    sprites.push(new TestEnemy(400, 80, 8));
    sprites.push(new TestEnemy(500, 80, 8));
    sprites.push(new TestEnemy(600, 80, 8));

    sprites.push(new TestEnemy2(80, 240, 16));
    sprites.push(new TestEnemy2(240, 240, 16));
    sprites.push(new TestEnemy2(400, 240, 16));
    sprites.push(new TestEnemy2(560, 240, 16));
    sprites.push(new TestEnemy2(720, 240, 16));

    setInterval(function () {
        if (Math.random() < 0.20)
            sprites.push(new Asteroid(200 + 400 * Math.random(), -100, 4 + 6 * Math.random()));
    }, 1000);
}




var test = 0;
function testDraw() {
    gameViewContext.clearRect(0, 0, viewWidth, viewHeight);
    gameViewContext.fillStyle = "white";
    gameViewContext.fillRect(Math.random() * viewWidth, Math.random() * viewHeight, 5, 5);

    for (var i = 0; i < sprites.length; i++) sprites[i].executeRules();
    for (var i = 0; i < sprites.length; i++) sprites[i].draw();

    test += Math.PI / 24;
}

Array.prototype.rand = function () {
    return this[Math.floor(Math.random() * this.length)];
};


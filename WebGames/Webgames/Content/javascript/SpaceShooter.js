var viewWidth = 800;
var viewHeight = 600;
window.onload = startGame;

var gameViewContext;
var sprites = [];
var particleEffects = [];
var particleEffectGenerators = [];
var meters = [];
var mouseInfo = { x: 0, y: 0, pressed: false, oldX: 0, oldY: 0, clicked: false };
var mainLoop = { interval: null, milliseconds: 19 };

var player;

function startGame() {
    initializeGraphicSheets();
    initializeItemTypes();
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

var frameTimes = [];
function pulse() {
    testDraw();
    cycleMouseInfo();

    frameTimes.push(new Date());
    if (frameTimes.length > 50) frameTimes.splice(0, 1);
    var fpsText = "FPS: " + parseInt(1000 * frameTimes.length / (frameTimes[frameTimes.length - 1] - frameTimes[0]));
    gameViewContext.font = "16px Arial";
    gameViewContext.fillStyle = "white";
    gameViewContext.shadowBlur = 0;
    gameViewContext.fillText(fpsText, 10, 20);
}

function cycleMouseInfo() {
    mouseInfo.oldX = mouseInfo.x;
    mouseInfo.oldY = mouseInfo.y;
    mouseInfo.clicked = false;
}


var level;

function initializeSprites() {
    level = new SampleLevel();
    player = new PlayerShip(400, 500, 4)
    sprites.push(player);

    var hpMeter = new MeterBase(400, 585, 500, 10, "green",
        function () { return player.HP },
        function () { return player.maxHP; })
    var shieldMeter = new MeterBase(275, 575, 250, 5, "blue",
        function () { return player.shield.HP },
        function () { return player.shield.maxHP; })
    shieldMeter.minorTicks = 2;

    meters.push(shieldMeter);
    meters.push(hpMeter);

    //setInterval(function () {
    //    if (Math.random() < 0.20)
    //        sprites.push(new Asteroid(200 + 400 * Math.random(), -100, 4 + 6 * Math.random()));
    //}, 1000);

    setInterval(function () {
        if (Math.random() < 0.20) {
            var type = parseInt(Math.random() * 4);
            if (type == 0) sprites.push(new PowerUpRepair(200 + 400 * Math.random(), -100, 4));
            if (type == 1) sprites.push(new PowerUpWeapon(200 + 400 * Math.random(), -100, 4));
            if (type == 2) sprites.push(new PowerUpShield(200 + 400 * Math.random(), -100, 4));
            if (type == 3) sprites.push(new PowerUpSpeed(200 + 400 * Math.random(), -100, 4));
        }
    }, 5000);
}



function testDraw() {
    gameViewContext.clearRect(0, 0, viewWidth, viewHeight);
    gameViewContext.fillStyle = "white";
    gameViewContext.fillRect(Math.random() * viewWidth, Math.random() * viewHeight, 5, 5);

    if (level) level.update();

    for (var i = 0; i < particleEffects.length; i++)
        particleEffects[i].draw();
    for (var i = 0; i < particleEffectGenerators.length; i++)
        particleEffectGenerators[i].update();
    for (var i = 0; i < numberIndicators.length; i++)
        numberIndicators[i].update();

    for (var i = 0; i < sprites.length; i++)
        if (sprites[i] && sprites[i].active)
            sprites[i].executeRules();
    for (var i = sprites.length - 1; i > 0; i--)
        if (sprites[i] && !sprites[i].active)
            sprites[i].delete();
    for (var i = 0; i < sprites.length; i++)
        sprites[i].draw();
    for (var i = 0; i < numberIndicators.length; i++)
        numberIndicators[i].draw();
    for (var i = 0; i < meters.length; i++)
        meters[i].draw();
    DrawInventory(player);
}

Array.prototype.rand = function () {
    return this[Math.floor(Math.random() * this.length)];
};


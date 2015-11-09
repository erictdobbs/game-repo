
var isMouseClicked = false;
var mouseX = 0;
var mouseY = 0;

function onMouseDown(e) {
    if (e.button === undefined || e.button === 0) {
        isMouseClicked = true;
        if (player == null || currentShoppingState == shoppingStates.shopping) {
            var canvas = document.getElementById("gameView");

            var pageX = e.pageX;
            var pageY = e.pageY;
            if (e.touches) {
                pageX = e.touches[0].pageX;
                pageY = e.touches[0].pageY;
            }

            var x = pageX - canvas.offsetLeft;
            var y = pageY - canvas.offsetTop;
            mouseX = x;
            mouseY = y;

            HandleButtonClickAtPosition(x, y);
        }
    }
}

function onMouseUp(e) {
    if (e.button === undefined || e.button === 0) {
        isMouseClicked = false;
    }
}


function onMouseMove(e) {
    var canvas = document.getElementById("gameView");
    var pageX = e.pageX;
    var pageY = e.pageY;
    if (e.touches) {
        pageX = e.touches[0].pageX;
        pageY = e.touches[0].pageY;
    }

    var x = pageX - canvas.offsetLeft;
    var y = pageY - canvas.offsetTop;

    mouseX = x;
    mouseY = y;
}
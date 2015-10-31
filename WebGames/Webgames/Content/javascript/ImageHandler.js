
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
function initializeGraphicSheets() {
    var images = document.getElementsByClassName("graphicSheet");
    for (var i = 0; i < images.length; i++) {
        var imageName = images[i].id;
        var cellWidth = parseInt(images[i].dataset.cellwidth);
        var cellHeight = parseInt(images[i].dataset.cellheight);
        var sheet = new GraphicSheet(images[i], cellWidth, cellHeight);
        graphicSheets[imageName] = sheet;
    }
}

function initializeCustomization() {
    var shipCanvas = document.getElementById('shipCanvas');
    var shipCtx = shipCanvas.getContext('2d');
    var targetImage = document.getElementById('PlayerShip');
    shipCtx.drawImage(targetImage, 0, 0);

    var opponentShipCanvas = document.getElementById('opponentShipCanvas');
    var opponentShipCtx = opponentShipCanvas.getContext('2d');
    var targetImage = document.getElementById('PlayerShip');
    opponentShipCtx.drawImage(targetImage, 0, 0);
}


//
// Frames
// Represent tiles of image data
//
function Frame(graphicSheet, cellIndex) {
    this.graphicSheet = graphicSheet;
    if (graphicSheet) this.imageSource = graphicSheet.image;
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
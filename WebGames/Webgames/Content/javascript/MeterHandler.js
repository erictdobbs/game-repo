


function MeterBase(x, y, width, height, color, getMeterValue, getMeterMax) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    this.backgroundColor = "darkblue";

    this.borderColor = "black";
    this.borderWidth = 2.0;

    this.ticks = 5; // Number of cells
    this.tickWidth = 2.0;
    this.tickColor = "black";

    this.minorTicks = 4; // ticks per major tick
    this.minorTickWidth = 1.0;
    this.minorTickColor = "darkblue";

    this.draw = function () {
        var left = this.x - this.width / 2;
        var top = this.y - this.height / 2;

        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = this.borderColor;
        gameViewContext.fillRect(left - this.borderWidth,
            top - this.borderWidth,
            this.width + this.borderWidth * 2,
            this.height + this.borderWidth * 2);

        gameViewContext.fillStyle = this.backgroundColor;
        gameViewContext.fillRect(left,
            top,
            this.width,
            this.height);

        var fillRatio = getMeterValue() / getMeterMax();
        gameViewContext.fillStyle = this.color;
        gameViewContext.fillRect(left,
            top,
            this.width * fillRatio,
            this.height);

        var widthBetweenTicks = this.width / (this.ticks * this.minorTicks);
        for (var i = 1; i < this.ticks * this.minorTicks; i++) {
            var tickLeft = left + widthBetweenTicks * i;
            
            gameViewContext.fillStyle = (i % this.minorTicks == 0) ? this.tickColor : this.minorTickColor;
            gameViewContext.fillRect(tickLeft, 
                top,
                (i % this.minorTicks == 0) ? this.tickWidth : this.minorTickWidth,
                this.height);
        }
    }
}


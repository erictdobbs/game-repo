var numberIndicators = [];

function NumberIndicator(parent, value) {
    if (parent) {
        this.x = parent.x;
        this.y = parent.y;
    }
    this.value = value;
    this.color = new Color(255, 255, 255, 1.0);
    this.update = function () { };
    this.draw = function () {
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = this.color.toString();
        gameViewContext.font = "20px Arial";
        gameViewContext.fillText(this.value, this.x, this.y);
    }
    this.delete = function () {
        numberIndicators.splice(numberIndicators.indexOf(this), 1);
    }
}



function NumberIndicatorDamage(parent, value) {
    NumberIndicator.call(this, parent, value);
    this.dx = (Math.random() - 0.5) * 4;
    this.dy = -3;
    this.update = function () {
        this.dy += 0.3;
        this.x += this.dx;
        this.y += this.dy;
        this.color.a -= 0.03;
        if (this.color.a <= 0) this.delete();
    }
}
NumberIndicatorDamage.prototype = new NumberIndicator();
NumberIndicatorDamage.prototype.constructor = NumberIndicatorDamage;


function NumberIndicatorShieldDamage(parent, value) {
    NumberIndicator.call(this, parent, value);
    this.color = new Color(0, 255, 255, 1.0);
    this.y = parent.y - 50;
    this.update = function () {
        this.color.a -= 0.03;
        if (this.color.a <= 0) this.delete();
    }
}
NumberIndicatorShieldDamage.prototype = new NumberIndicator();
NumberIndicatorShieldDamage.prototype.constructor = NumberIndicatorShieldDamage;


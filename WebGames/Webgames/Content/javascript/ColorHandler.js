

function Color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.toString = function () {
        return "rgba(" + parseInt(this.r) +
            "," + parseInt(this.g) +
            "," + parseInt(this.b) +
            "," + this.a + ")";
    }
}
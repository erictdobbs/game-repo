

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

function ConvertColorTo64Bit(color) {
    var compressedRed = parseInt(color.r / 85);
    var compressedGreen = parseInt(color.g / 85);
    var compressedBlue = parseInt(color.b / 85);

    var combinedColorValue = compressedRed * 16 + compressedGreen * 4 + compressedBlue;
    return combinedColorValue;
}

function Convert64BitToColor(combinedColorValue) {
    var unpackedRed = parseInt(combinedColorValue / 16);
    var unpackedGreen = parseInt(combinedColorValue / 4) - unpackedRed * 4;
    var unpackedBlue = combinedColorValue - unpackedGreen * 4 - unpackedRed * 16;

    var ret = new Color(unpackedRed * 85, unpackedGreen * 85, unpackedBlue * 85, 1.0);
    return ret;
}
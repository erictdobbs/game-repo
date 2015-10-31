
function CheckForAndHandleUrlParameters() {
    var parameters = getUrlParameters();
    SetupGameFromParameters(parameters);
}


function createUrlWithParameters(parameters) {
    var maximumUrlLength = 2083;
    var ret = getUrlWithoutParameters();

    var parameterStrings = [];
    for (paramName in parameters) {
        var paramString = paramName + '=' + parameters[paramName];
        parameterStrings.push(paramString);
    }

    var parameterString = parameterStrings.reduce(function (previousValue, currentValue) {
        return previousValue + '&' + currentValue;
    });

    return ret + '?' + parameterString;
}

function getUrlWithoutParameters() {
    var url = window.location.href;
    var paramCharIndex = url.indexOf('?');

    if (paramCharIndex == -1) return url;

    return url.substring(0, paramCharIndex);
}


function GetGameLinkParameters() {
    var version = "1.0";

    var shipCustomizationColorString = "";
    for (var i = 0; i < shipColors.length; i++) {
        var decimalValue = ConvertColorTo64Bit(shipColors[i]);
        var base64Value = DecimalToBase64Char(decimalValue);
        shipCustomizationColorString += base64Value;
    }
    
    var scoreString = "";
    var scoreTotals = SumScores(levelScores);
    for (var i = 0; i < levelScores.length; i++) {
        var levelScoreString = "";
        if (levelScores[i]["Shots Fired"]) levelScoreString += "A" + levelScores[i]["Shots Fired"];
        if (levelScores[i]["Hits Landed"]) levelScoreString += "B" + levelScores[i]["Hits Landed"];
        if (levelScores[i]["Hits Taken"]) levelScoreString += "C" + levelScores[i]["Hits Taken"];
        if (levelScores[i]["Items Collected"]) levelScoreString += "D" + levelScores[i]["Items Collected"];
        levelScoreString += "E";
        scoreString += levelScoreString;
    }
    scoreString = scoreString.substring(0, scoreString.length - 1);


    var ret = {
        v: version,
        c: shipCustomizationColorString,
        s: scoreString
    }

    return ret;
}

function SetupGameFromParameters(parameters) {
    
    if (parameters.c) {
        var shipCustomizationColorString = parameters.c;
        var unpackedShipColors = [];
        for (var i = 0; i < shipCustomizationColorString.length; i++) {
            var decimalValue = Base64CharToDecimal(shipCustomizationColorString[i]);
            var newColor = Convert64BitToColor(decimalValue);
            unpackedShipColors.push(newColor);
        }
        SaveCustomizationToImage("opponentShipCanvas", unpackedShipColors);
    }

    // Probably a much less hacky way to do this, but trying to make the score
    // string at least a LITTLE obfuscated. Can't make cheating THAT easy...
    if (parameters.s) {
        var opponentScoreString = parameters.s;
        opponentScores = [];
        var opponentLevelScoreStrings = opponentScoreString.split("E");
        var splitters = "ABCDE";
        var scoreTypes = {
            A: "Shots Fired",
            B: "Hits Landed",
            C: "Hits Taken",
            D: "Items Collected",
            E: "Test"
        }
        for (var i = 0; i < opponentLevelScoreStrings.length; i++) {
            var levelString = opponentLevelScoreStrings[i] + "E";

            var scoreObject = new LevelScore();
            var currentType = "";
            var currentString = "";
            for (var j = 0; j < levelString.length; j++) {
                if (splitters.indexOf(levelString[j]) > -1) {
                    var scoreValue = parseInt(currentString);
                    if (scoreValue) scoreObject[scoreTypes[currentType]] = scoreValue;
                    currentString = "";
                    currentType = levelString[j];
                } else {
                    currentString += levelString[j];
                }
            }
            opponentScores.push(scoreObject);
        }
    }
}


var base64EncodingString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._";
function DecimalToBase64Char(dec) {
    return base64EncodingString[dec];
}
function Base64CharToDecimal(b64) {
    return base64EncodingString.indexOf(b64);
}

function getUrlParameters() {
    var ret = {};

    var url = window.location.href;
    var paramCharIndex = url.indexOf('?');

    if (paramCharIndex == -1) return ret;

    var paramString = url.substring(paramCharIndex + 1);
    var paramList = paramString.split('&');
    for (var i = 0; i < paramList.length; i++) {
        var param = paramList[i];
        var paramDelimitIndex = param.indexOf('=');

        if (paramDelimitIndex == -1) continue;

        var paramName = param.substring(0, paramDelimitIndex);
        var paramValue = param.substring(paramDelimitIndex + 1);
        ret[paramName] = paramValue;
    }

    return ret;
}
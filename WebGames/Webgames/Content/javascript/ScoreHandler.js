
var levelScores = [];
var opponentScores = [];

function CreateScoreForLevel() {
    levelScores.push(new LevelScore());
}

function LevelScore() { }

function AddToScore(key, value) {
    var score = levelScores[levelScores.length - 1];

    if (!score[key]) {
        score[key] = value;
        return;
    } else {
        score[key] += value;
    }
}

function SumScores(list, upToLevel) {
    if (!list) return;
    var lastIndex = list.length - 1;
    if (upToLevel !== undefined) lastIndex = upToLevel;

    var ret = {};
    for (var i = 0; i <= lastIndex; i++) {
        var score = list[i];
        for (propName in score) {
            if (!ret[propName]) ret[propName] = score[propName];
            else ret[propName] += score[propName];
        }
    }
    return ret;
}

function DrawScores(x, y, titleText) {
    var scoreLists = [levelScores];
    var upToLevel = levelScores.length - 1;
    if (opponentScores.length) scoreLists.push(opponentScores);
    y += 50;
    var columns = scoreLists.length + 1;


    var playerFrame = new Frame(null, 0);
    playerFrame.imageSource = document.getElementById('shipCanvas');
    playerFrame.graphicSheet = { cellWidth: 17, cellHeight: 17, columns: 1 };

    var opponentFrame = new Frame(null, 0);
    opponentFrame.imageSource = document.getElementById('opponentShipCanvas');
    opponentFrame.graphicSheet = { cellWidth: 17, cellHeight: 17, columns: 1 };

    var margin = 30;
    var columnWidth = (viewWidth - margin) / columns;
    var rowHeight = 36;

    var scoreFont = "24px monospace";
    var scoreColor = "white";
    var scoreSubFont = "16px monospace";
    var scoreSubColor = "gray";
    if (titleText == undefined) titleText = "SCORES";
    if (titleText == "GAME OVER") {
        scoreSubFont = scoreFont;
        scoreSubColor = scoreColor;
    }

    gameViewContext.font = "48px monospace";
    gameViewContext.fillStyle = "white";
    gameViewContext.shadowBlur = 0;
    gameViewContext.fillText(titleText, x + margin, y + margin / 2);
    gameViewContext.font = scoreFont;
    gameViewContext.fillStyle = scoreColor;

    var playerTotals = SumScores(scoreLists[0], upToLevel);

    playerFrame.draw(x + margin + columnWidth + 34, y, 4, 0);
    if (opponentScores.length) opponentFrame.draw(x + margin + 2*columnWidth + 34, y, 4, 0);

    var drawY = y + margin;
    for (scoreType in playerTotals) {
        drawY += rowHeight;
        gameViewContext.font = scoreFont;
        gameViewContext.fillStyle = scoreColor;
        gameViewContext.fillText(scoreType, x + margin, drawY);
        gameViewContext.font = scoreSubFont;
        gameViewContext.fillStyle = scoreSubColor;
        if (titleText != "GAME OVER") gameViewContext.fillText("Up to level " + upToLevel, x + margin * 2, drawY + rowHeight);
        for (var i = 0; i < scoreLists.length; i++) {
            var drawX = x + margin + columnWidth * (i + 1);
            gameViewContext.font = scoreFont;
            gameViewContext.fillStyle = scoreColor;

            var scoreText = "MIA";
            if (scoreLists[i][upToLevel] !== undefined) scoreText = scoreLists[i][upToLevel][scoreType];
            if (scoreText == undefined) scoreText = "0";
            if (titleText != "GAME OVER") gameViewContext.fillText(scoreText, drawX, drawY);
            gameViewContext.font = scoreSubFont;
            gameViewContext.fillStyle = scoreSubColor;
            var scoreSubText = SumScores(scoreLists[i], upToLevel)[scoreType];
            if (scoreSubText == undefined) scoreSubText = "0";
            gameViewContext.fillText(scoreSubText, drawX, drawY + rowHeight);
        }
        drawY += rowHeight;
    }
    gameViewContext.font = scoreFont;
    gameViewContext.fillStyle = scoreColor;
    if (titleText != "GAME OVER") gameViewContext.fillText("Space/click to continue", x + margin, drawY + rowHeight * 2);
}
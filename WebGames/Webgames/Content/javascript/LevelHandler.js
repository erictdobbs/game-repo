function LevelBase(name, waves) {
    this.name = name;
    this.waves = waves;
    this.waveIndex = 0;
    this.active = true;
    if (waves) CreateScoreForLevel();

    this.update = function () {
        if (!this.active) return;
        var wave = this.waves[this.waveIndex];
        wave.update();
        if (wave.stage == waveStage.complete) {
            this.waveIndex += 1;
            if (this.waveIndex >= this.waves.length) {
                this.active = false;
                startShopping();
            }
        }
    }
}


function WaveTextMapping(timer) {
    // map input to range [0,1]
    var mappedTimer = timer / 100;
    var result = 0;

    if (mappedTimer < 0.2) result = -4 * Math.pow(mappedTimer - 0.25, 2) + 0.48;
    if (mappedTimer >= 0.2 && mappedTimer <= 0.8) result = mappedTimer / 10 + 0.45;
    if (mappedTimer > 0.8) result = 4 * Math.pow(mappedTimer - 0.75, 2) + 0.52;

    return 2*(result - 0.25);
}

var waveStage = {
    uninitialized: 0,
    intro: 1,
    inProgress: 2,
    outro: 3,
    complete: 4
}

function WaveBase(level, name, waveEvents) {
    this.level = level;
    this.timer = 0;
    this.name = name;
    this.stage = waveStage.intro;
    this.waveEvents = waveEvents;
    if (waveEvents) this.latestDelay = Math.max.apply(Math, waveEvents.map(function (x) { return x.delay }));

    this.intro = function () {
        var width = 400;
        var x = WaveTextMapping(this.timer) * (viewWidth + width) - width;
        var y = viewHeight / 2;
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = "red";
        gameViewContext.fillRect(x, y, width, 3);
        gameViewContext.font = "italic 48px monospace";
        gameViewContext.fillStyle = "red";
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillText(this.name, x, y - 30);

        if (this.timer >= 110) {
            this.stage = waveStage.inProgress;
            this.timer = 0;
        }
    }

    this.outro = function () {
        var width = 400;
        var x = WaveTextMapping(this.timer) * (viewWidth + width) - width;
        var y = viewHeight / 2;
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = "red";
        gameViewContext.fillRect(x, y, width, 3);
        gameViewContext.font = "italic 48px monospace";
        gameViewContext.fillStyle = "red";
        gameViewContext.shadowBlur = 0;
        var text = "Wave Complete!";
        if (this.level.waveIndex == this.level.waves.length - 1) text = "Level Complete!";
        gameViewContext.fillText(text, x, y - 30);

        if (this.timer >= 110) {
            this.stage = waveStage.complete;
            this.timer = 0;
        }
    }

    this.update = function () {
        this.timer += 1;
        if (this.stage == waveStage.intro) {
            this.intro();
        } else if (this.stage == waveStage.inProgress) {
            for (var i = 0; i < this.waveEvents.length; i++) {
                var waveEvent = this.waveEvents[i];
                if (waveEvent.active && waveEvent.delay < this.timer) {
                    waveEvent.trigger(this);
                }
            }
            if (IsWaveComplete(this)) {
                this.stage = waveStage.outro;
                this.timer = 0;
            }
        } else if (this.stage == waveStage.outro) {
            this.outro();
        }
    }
}

function IsWaveComplete(wave) {
    return wave.timer > wave.latestDelay && !AreWaveEnemiesStillActive();
}
function AreWaveEnemiesStillActive() {
    return sprites.filter(function (x) { return x.isWaveSprite }).length != 0;
}


function WaveEventSpawnSprite(sprite, delay) {
    // Spawns the given sprite after [delay] frames
    this.sprite = sprite;
    this.delay = delay;
    this.active = true;
    this.trigger = function (wave) {
        this.active = false;
        this.sprite.isWaveSprite = true;
        sprites.push(this.sprite);
    }
}
function WaveEventWaitForWaveSpritesCleared(delay) {
    // Pauses the wave at [delay] frames until all active wave enemies are defeated
    this.delay = delay;
    this.active = true;
    this.trigger = function (wave) {
        if (AreWaveEnemiesStillActive()) {
            wave.timer -= 1;
        } else {
            this.active = false;
        }
    }
}


function GetWaveSuffix(levelNumber, waveNumber) {
    return levelNumber + 'ABCDEFGHIJ'[waveNumber];
}


function WaveAsteroid(level, levelNumber, waveNumber) {
    var numberOfAsteroidSets = scaleValueForLevel(levelNumber, 15, 0.3, 50);
    var asteroidGenerationSpeed = scaleValueForLevel(levelNumber, 100, -4, 20);
    var chanceOfMultiples = scaleValueForLevel(levelNumber, 0.10, 0.08, 0.50);

    var waveEvents = [];
    for (var i = 0; i < numberOfAsteroidSets; i++) {
        var asteroidSize = Math.random() * 12;
        if (asteroidSize < 3.5) asteroidSize = 3.5;
        var asteroidPosition = Math.random()*viewWidth;
        var waveEvent = new WaveEventSpawnSprite(new Asteroid(asteroidPosition, asteroidSize), asteroidGenerationSpeed * i);
        waveEvents.push(waveEvent);
        if (Math.random() < chanceOfMultiples) i--;
    }
    
    WaveBase.call(this, level, "Asteroid Belt " + GetWaveSuffix(levelNumber, waveNumber), waveEvents);
}
WaveAsteroid.prototype = new WaveBase();
WaveAsteroid.prototype.constructor = WaveAsteroid;


function WaveFleet(level, levelNumber, waveNumber) {
    var waveEvents = [];

    var numberOfInvaders = scaleValueForLevel(levelNumber, 6, 2, 30);
    var invaderAttackRate = scaleValueForLevel(levelNumber, 1, 0.2, 4);
    var invaderAttackDamage = scaleValueForLevel(levelNumber, 3, 0.2, 10);

    var chanceOfSniper = scaleValueForLevel(levelNumber, 0, 0.06, 0.4);
    var maxSnipers = scaleValueForLevel(levelNumber, 0, 0.4, 4);

    var chanceOfStationaryRow = scaleValueForLevel(levelNumber, 0, 0.08, 0.5);
    var numberOfStationaries = scaleValueForLevel(levelNumber, 0, 1, 9);
    var missileDamage = scaleValueForLevel(levelNumber, 5, 0.2, 10);

    var waveHasStationary = Math.random() < chanceOfStationaryRow;

    // Invaders
    for (var row = 0; row < 3; row++) {
        var y = row * 75 + 80;
        var delay = (2 - row) * 56;
        for (var col = 0; col < 9; col++) {
            var x = 100 + 75 * col;
            var spotsRemaining = ((waveHasStationary ? 1 : 2) - row) * 9 + (9 - col);
            if (Math.random() < numberOfInvaders / spotsRemaining) {
                numberOfInvaders -= 1;
                var invader = new SpriteInvader(x, y, invaderAttackRate, invaderAttackDamage);
                waveEvents.push(new WaveEventSpawnSprite(invader, delay));
            }
        }
        if (waveHasStationary) row++;
    }

    // Snipers
    for (var row = 0; row < 4; row++) {
        var y = row * 75 + 40;
        if (maxSnipers > 0 && Math.random() < chanceOfSniper) {
            var sniper = new SpriteInvaderSniper(y, player);
            maxSnipers -= 1;
            waveEvents.push(new WaveEventSpawnSprite(sniper, 0));
        }
    }

    // Stationaries
    if (waveHasStationary) {
        for (var col = 0; col < 9; col++) {
            var x = 100 + 75 * col;
            var spotsRemaining = ((waveHasStationary ? 1 : 2) - row) * 9 + (9 - col);
            if (Math.random() < numberOfStationaries / spotsRemaining) {
                numberOfStationaries -= 1;
                var stationary = new SpriteInvaderTurret(x, 155, missileDamage);
                if (Math.random() < 0.5) stationary = new SpriteInvaderGarage(x, 155);
                waveEvents.push(new WaveEventSpawnSprite(stationary, 0));
            }
        }
    }

    WaveBase.call(this, level, "Pixelien Fleet " + GetWaveSuffix(levelNumber, waveNumber), waveEvents);
}
WaveFleet.prototype = new WaveBase();
WaveFleet.prototype.constructor = WaveFleet;


function WaveTurrets(level, levelNumber, waveNumber) {
    var waveEvents = [];

    var numberOfInvaders = scaleValueForLevel(levelNumber, 4, 1, 30);
    var missileDamage = scaleValueForLevel(levelNumber, 4, 0.2, 10);

    // Invaders
    for (var row = 0; row < 3; row++) {
        var y = row * 75 + 80;
        var delay = (2 - row) * 56;
        for (var col = 0; col < 9; col++) {
            var x = 100 + 75 * col;
            var spotsRemaining = (2 - row) * 9 + (9 - col);
            if (Math.random() < numberOfInvaders / spotsRemaining) {
                numberOfInvaders -= 1;
                var invader = new SpriteInvaderTurret(x, y, missileDamage);

                if (Math.random() < 0.2 && row == 1) invader = new SpriteInvaderGarage(x, y);
                if (Math.random() < 0.2 && row == 2) invader = new SpriteInvaderBulwark(x, y);

                waveEvents.push(new WaveEventSpawnSprite(invader, delay));
            }
        }
    }

    WaveBase.call(this, level, "Turret Formation " + GetWaveSuffix(levelNumber, waveNumber), waveEvents);
}
WaveTurrets.prototype = new WaveBase();
WaveTurrets.prototype.constructor = WaveTurrets;


function scaleValueForLevel(levelNumber, initialValue, perLevel, limitValue) {
    var ret = 2* levelNumber * perLevel + initialValue;
    if (limitValue > initialValue && ret > limitValue) ret = limitValue;
    if (limitValue < initialValue && ret < limitValue) ret = limitValue;
    return ret;
}



function Level(levelNumber) {
    var waves = [
        new WaveFleet(this, levelNumber, 0),
        new WaveAsteroid(this, levelNumber, 1),
        new WaveTurrets(this, levelNumber, 2)
    ];
    LevelBase.call(this, "Level " + levelNumber, waves);
}
Level.prototype = new LevelBase();
Level.prototype.constructor = Level;
function LevelBase(name, waves) {
    this.name = name;
    this.waves = waves;
    this.waveIndex = 0;
    this.active = true;

    this.update = function () {
        if (!this.active) return;
        var wave = this.waves[this.waveIndex];
        wave.update();
        if (wave.stage == waveStage.complete) {
            this.waveIndex += 1;
            if (this.waveIndex >= this.waves.length) {
                this.active = false;
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
    this.latestDelay = Math.max.apply(Math, waveEvents.map(function (x) { return x.delay }));

    this.intro = function () {
        var width = 400;
        var x = WaveTextMapping(this.timer) * (viewWidth + width) - width;
        var y = viewHeight / 2;
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = "red";
        gameViewContext.fillRect(x, y, width, 3);
        gameViewContext.font = "italic 48px Arial";
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
        gameViewContext.font = "italic 48px Arial";
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


function SampleLevel() {
    var wave1 = new WaveBase(this, "Start Wave", [
        new WaveEventSpawnSprite(new Invader(300, 80, 8), 0),
        new WaveEventSpawnSprite(new Invader(400, 80, 8), 0),
        new WaveEventSpawnSprite(new Invader(500, 80, 8), 0)
    ]);
    var wave2 = new WaveBase(this, "Asteroid Wave", [
        new WaveEventSpawnSprite(new Asteroid(200, -100, 7), 50),
        new WaveEventSpawnSprite(new Asteroid(600, -100, 7), 150),
        new WaveEventSpawnSprite(new Asteroid(400, -100, 7), 250),
        new WaveEventSpawnSprite(new Asteroid(200, -100, 5), 350),
        new WaveEventSpawnSprite(new Asteroid(600, -100, 5), 350),
        new WaveEventSpawnSprite(new Asteroid(300, -100, 4), 450),
        new WaveEventSpawnSprite(new Asteroid(400, -100, 4), 450),
        new WaveEventSpawnSprite(new Asteroid(500, -100, 4), 450),
        new WaveEventSpawnSprite(new Asteroid(200, -100, 6), 650),
        new WaveEventSpawnSprite(new Asteroid(300, -100, 6), 650),
        new WaveEventSpawnSprite(new Asteroid(400, -100, 6), 650),
        new WaveEventSpawnSprite(new Asteroid(500, -100, 6), 650),
        new WaveEventSpawnSprite(new Asteroid(600, -100, 6), 650),
        new WaveEventSpawnSprite(new Asteroid(400, -100, 10), 950)
    ]);
    var wave3 = new WaveBase(this, "Last Wave", [
        new WaveEventSpawnSprite(new TestEnemy2(80, 240, 16),0),
        new WaveEventSpawnSprite(new TestEnemy2(240, 240, 16), 0),
        new WaveEventWaitForWaveSpritesCleared(10),
        new WaveEventSpawnSprite(new TestEnemy2(400, 240, 16),20),
        new WaveEventSpawnSprite(new TestEnemy2(560, 240, 16),20),
        new WaveEventSpawnSprite(new TestEnemy2(720, 240, 16),20),
    ]);

    var waves = [wave1, wave2 ,wave3];
    LevelBase.call(this, "Sample Level", waves);
}
SampleLevel.prototype = new LevelBase();
SampleLevel.prototype.constructor = SampleLevel;
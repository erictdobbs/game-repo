function LevelBase(name, waves) {
    this.name = name;
    this.waves = waves;
    this.waveIndex = 0;
    this.active = true;

    this.update = function () {
        if (!this.active) return;
        var wave = this.waves[this.waveIndex];
        wave.update();
        if (wave.timer > wave.latestDelay &&
            sprites.filter(function (x) { return x.isWaveSprite }).length == 0) {
            this.waveIndex += 1;
            if (this.waveIndex >= this.waves.length) {
                this.active = false;
            }
        }
    }
}


function WaveBase(name, waveEvents) {
    this.timer = 0;
    this.name = name;
    this.waveEvents = waveEvents;
    this.latestDelay = Math.max.apply(Math, waveEvents.map(function(x) {return x.delay}));

    this.update = function () {
        this.timer += 1;
        for (var i = 0; i < this.waveEvents.length; i++) {
            var waveEvent = this.waveEvents[i];
            if (waveEvent.active && waveEvent.delay < this.timer) {
                waveEvent.trigger();
                waveEvent.active = false;
            }
        }
    }
}


function WaveEventSpawnSprite(sprite, delay) {
    this.sprite = sprite;
    this.delay = delay;
    this.active = true;
    this.trigger = function () {
        this.sprite.isWaveSprite = true;
        sprites.push(this.sprite);
    }
}


function SampleLevel() {
    var wave1 = new WaveBase("Start Wave", [
        new WaveEventSpawnSprite(new TestEnemy(200, 80, 8), 0),
        new WaveEventSpawnSprite(new TestEnemy(300, 80, 8), 0),
        new WaveEventSpawnSprite(new TestEnemy(400, 80, 8), 0),
        new WaveEventSpawnSprite(new TestEnemy(500, 80, 8), 0),
        new WaveEventSpawnSprite(new TestEnemy(600, 80, 8), 0)
    ]);
    var wave2 = new WaveBase("Asteroid Wave", [
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
        new WaveEventSpawnSprite(new Asteroid(400, -100, 12), 950)
    ]);
    var wave3 = new WaveBase("Last Wave", [
        new WaveEventSpawnSprite(new TestEnemy2(80, 240, 16),0),
        new WaveEventSpawnSprite(new TestEnemy2(240, 240, 16),0),
        new WaveEventSpawnSprite(new TestEnemy2(400, 240, 16),0),
        new WaveEventSpawnSprite(new TestEnemy2(560, 240, 16),0),
        new WaveEventSpawnSprite(new TestEnemy2(720, 240, 16),0),
    ]);

    var waves = [wave1, wave2 ,wave3];
    LevelBase.call(this, "Sample Level", waves);
}
SampleLevel.prototype = new LevelBase();
SampleLevel.prototype.constructor = SampleLevel;
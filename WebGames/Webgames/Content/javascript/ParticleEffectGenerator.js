

function ParticleEffectGenerator(parent, delay) {
    // [particleEffect] will be generated
    // centered on [parent]
    // every [delay] frames

    this.parent = parent;
    this.delay = delay;

    this.counter = 0;

    this.delete = function () {
        logMessage(loggingSeverity.verbose, "Deleting " + this.constructor.name + " (index " + particleEffectGenerators.indexOf(this) + ")");
        particleEffectGenerators.splice(particleEffectGenerators.indexOf(this), 1);
    }

    this.update = function () {
        if (!this.parent.active) this.delete();
        this.counter += 1;
        if (this.counter > this.delay) {
            this.counter = 0;
            var particleEffect = this.getNewParticle();
            particleEffects.push(particleEffect);
        }
    }
}




function ParticleEffectSmokeGenerator(parent, dx, dy) {
    ParticleEffectGenerator.call(this, parent, 5);
    this.dx = dx;
    this.dy = dy;
    this.getNewParticle = function () {
        var dx = (this.dx + Math.random() - 0.5) * this.parent.scale / 4;
        var dy = (this.dy + Math.random() - 0.5) * this.parent.scale / 4;
        return new ParticleEffectSmokeFragment(this.parent.x, this.parent.y + this.parent.scale * 5, dx, dy, this.parent.scale * 1.25, 0, 1)
    }
}
ParticleEffectSmokeGenerator.prototype = new ParticleEffectGenerator();
ParticleEffectSmokeGenerator.prototype.constructor = ParticleEffectSmokeGenerator;


function ParticleEffectMissileSmokeGenerator(parent, dx, dy) {
    ParticleEffectGenerator.call(this, parent, 5);
    this.dx = dx;
    this.dy = dy;
    this.getNewParticle = function () {
        var dx = (-this.parent.dx + Math.random() - 0.5) * 0.5;
        var dy = (-this.parent.dy + Math.random() - 0.5) * 0.5;
        return new ParticleEffectSmokeFragment(this.parent.x, this.parent.y, dx, dy, 5, 0, 1)
    }
}
ParticleEffectSmokeGenerator.prototype = new ParticleEffectGenerator();
ParticleEffectSmokeGenerator.prototype.constructor = ParticleEffectSmokeGenerator;
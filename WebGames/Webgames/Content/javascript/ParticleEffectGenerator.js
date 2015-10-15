

function ParticleEffectGenerator(parent, particleEffect, delay) {
    // [particleEffect] will be generated
    // centered on [parent]
    // every [delay] frames

    this.parent = parent;
    this.particleEffect = particleEffect;
    this.delay = delay;

    this.counter = 0;

    this.update = function () {
        this.counter += 1;
        if (this.counter > this.delay) {
            this.counter = 0;

        }
    }
}

﻿

function ParticleEffectBase(x, y, dx, dy, scale, rotation, opacity) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.scale = scale;
    this.rotation = rotation;
    this.opacity = opacity;
    this.draw = function (x, y, scale, rotation, opacity) { };
    this.color = { r: 255, g: 255, b: 255, a: 1.0 };
    this.getColor = function () {
        return "rgba(" + parseInt(this.color.r) +
            "," + parseInt(this.color.g) +
            "," + parseInt(this.color.b) +
            "," + this.color.a + ")";
    }
    this.delete = function () {
        logMessage(loggingSeverity.verbose, "Deleting " + this.constructor.name + " (index " + particleEffects.indexOf(this) + ")");
        particleEffects.splice(particleEffects.indexOf(this), 1);
    }
}


function CreateParticleEffectExplosion(x, y) {
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, 6, 6, 10, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, -6, 6, 10, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, 6, -6, 10, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, -6, -6, 10, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, 3, 3, 15, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, -3, 3, 15, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, 3, -3, 15, 0, 1));
    particleEffects.push(new ParticleEffectExplosionFragment(x, y, -3, -3, 15, 0, 1));
}

function ParticleEffectExplosionFragment(x, y, dx, dy, scale, rotation, opacity) {
    ParticleEffectBase.call(this, x, y, dx, dy, scale, rotation, opacity);
    this.counter = 0;
    this.draw = function () {
        this.counter += 1;
        this.x += this.dx;
        this.y += this.dy;
        this.dx *= 0.95;
        this.dy *= 0.95;
        this.scale *= 0.95;
        this.color.a *= 0.95;
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = this.getColor();
        gameViewContext.fillRect(this.x - this.scale, this.y - this.scale, this.scale * 2, this.scale * 2);
        if (this.scale < 1) this.delete();
    }
}
ParticleEffectExplosionFragment.prototype = new ParticleEffectBase();
ParticleEffectExplosionFragment.prototype.constructor = ParticleEffectExplosionFragment;





function ParticleEffectSmokeFragment(x, y, dx, dy, scale, rotation, opacity) {
    ParticleEffectBase.call(this, x, y, dx, dy, scale, rotation, opacity);
    this.counter = 0;
    this.draw = function () {
        this.counter += 1;
        this.x += this.dx;
        this.y += this.dy;
        this.scale += 0.1;
        this.color.a *= 0.98;
        this.color.r *= 0.98;
        this.color.g *= 0.98;
        this.color.b *= 0.98;
        gameViewContext.shadowBlur = 0;
        gameViewContext.fillStyle = this.getColor();
        gameViewContext.beginPath();
        gameViewContext.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
        gameViewContext.closePath();
        gameViewContext.fill();

        if (this.color.a < 0.05) this.delete();
    }
}
ParticleEffectSmokeFragment.prototype = new ParticleEffectBase();
ParticleEffectSmokeFragment.prototype.constructor = ParticleEffectSmokeFragment;



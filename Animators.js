class ColorActor{
  constructor(color){

    this.color = new Color(0,0,0,0);
    this.color.setWithColor(color);

    this.phasing = false;

    this.phaseStartColor = new Color(0,0,0,0);
    this.phaseEndColor = new Color(0,0,0,0);
    this.phaseDiffColor = new Color(0,0,0,0);

    this.phaseTimer = new Alarm(0, 100, true);
  }


  setColor(color){
    this.color.setWithColor(color);
  }

  setRGB(r, g, b, a = 1){
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    this.color.a = a;
  }

  startPhase(startColor, endColor, time){
    this.phasing = true;
    this.phaseStartColor = startColor.copy();
    this.phaseEndColor = endColor.copy();
    this.phaseDiffColor = this.phaseEndColor.diff(this.phaseStartColor);
    this.phaseTimer.timeInit = time;
    this.phaseTimer.start();
  }

  update(dt){
    if(this.phasing){
      this.phaseTimer.update(dt);
      var progress = this.phaseTimer.percentage();
      var progressColor = this.phaseDiffColor.mult(progress).add(this.phaseStartColor);
      this.setColor(progressColor);

      if(this.phaseTimer.finished){
        this.setColor(this.phaseEndColor);
        this.phaseTimer.stop();
        this.phasing = false;
      }
    }
  }
}

class WobbleActor{
  constructor(wobbleTime){
    this.alarm = new Alarm(wobbleTime, wobbleTime);

    this.freq = 2;
    this.scl = 1;
    this.ang = 0;

    this.intensity = 1;

    this.angAmp = 10;
    this.sclAmp = 1;


    this.active = true;

  }

  wobble(intensity = 1){
    this.intensity = intensity;
    this.alarm.restart();
  }

  update(dt){
    this.alarm.update(dt);
     if(this.active && !this.alarm.finished){
          var wobFreq = this.freq;

          var wobPerc = this.alarm.percentage();
          this.ang = (tweenInOut(zigzag((tweenOut(wobPerc)*wobFreq)%wobFreq))-0.5)*2*deg2rad(this.angAmp*this.intensity)*(1-tweenOut(wobPerc));

          this.scl = 1 + (tweenInOut(zigzag((tweenOut(wobPerc)*wobFreq)%wobFreq))-0.5)*2*(1-tweenOut(wobPerc))*0.5*this.sclAmp*this.intensity;
      } else {
          this.ang = 0;
          this.scl = 1;
      }
  }
}


class BoosterOpenActor{
  constructor(wobbleTime){
    this.alarm = new Alarm(wobbleTime, wobbleTime);

    this.freq = 4;
    this.scl = 1;
    this.ang = 0;

    this.intensity = 1;

    this.angAmp = 20;
    this.sclAmp = 0.5;


    this.active = true;

  }

  wobble(intensity = 1){
    this.intensity = intensity;
    this.alarm.restart();
  }

  update(dt){
    this.alarm.update(dt);
     if(this.active && !this.alarm.finished){
          var wobFreq = this.freq;

          var wobPerc = this.alarm.percentage();
          var increase = tweenOut(wobPerc);
          var wob = (tweenInOut(zigzag((tweenOut(wobPerc)*wobFreq)%wobFreq))-0.5);
          var amp =  2*deg2rad(this.angAmp*this.intensity)*increase;

          this.ang = wob*amp;

          this.scl = 1 + increase*this.sclAmp;

          //this.scl = 1 + (tweenInOut(zigzag((tweenOut(wobPerc)*wobFreq)%wobFreq))-0.5)*2*(1-tweenOut(wobPerc))*0.5*this.sclAmp*this.intensity;
      } else {
          this.ang = 0;
          this.scl = 1;
      }
  }
}






class FlipActor {
    constructor() {
      this.flipping = false;
      this.phase = 0;
      this.targetPhase = 0;
      this.normalSpd = 0.1;
      this.spd = this.normalSpd;
      this.isFront = true;
      this.isHFlip = true;
  
      this.freeMoveSpd = 0;
      this.freeMoveSpdMax = 10;
      this.freeMoveDamp = 0.02;
  
      this.lastFront = false;
  
      this.flipped = false;
    }
  
    startFlip(flipAmount = 2, flipSnap = true, flipSpd = this.normalSpd) {
      this.spd = flipSpd;
      this.flipping = true;
  
      if (flipSnap) {
        this.targetPhase = (this.phase - (this.phase % (Math.PI))) + flipAmount * Math.PI;
      } else {
        this.targetPhase = this.phase + flipAmount * Math.PI;
      }
  
      this.freeMoveSpd = 0;
    }
  
    update(dt) {
  
      this.flipped = false;
  
  
      this.isFront = phaseAngleToSide(this.phase);
  
      // FLIPPING
      if (this.flipping) {
        this.phase += this.spd * dt;
  
        this.isFront = phaseAngleToSide(this.phase);
        if (this.isFront != this.lastFront) {
          this.flipped = true;
          // We should update the object properties as soon as it changes front-back
          // if(this.flipPhase >= this.flipTargetPhase - Math.PI/2){
        }
  
        // Flipping stops when it reaches target Phase
        if (this.phase >= this.targetPhase) {
          this.flipping = false;
          this.isFront = phaseAngleToSide(this.phase);
          //this.phase = Math.PI * (1 - this.isFront);
          this.phase = this.targetPhase % (Math.PI * 2);
        }
      } else {
        this.freeMoveSpd *= Math.pow(1 - this.freeMoveDamp, dt);
        this.freeMoveSpd = clamp(this.freeMoveSpd, -this.freeMoveSpdMax, this.freeMoveSpdMax);
        this.phase += this.freeMoveSpd * dt;
      }
  
      this.lastFront = this.isFront;
    }
  }
  
  class SneezeActor {
    constructor() {
      this.sneezing = false;
      this.sneezeTries = 0;
      this.sneezePauseTime = 0;
      this.sneezeWait = 0;
      this.sneezeTimer = 0;
  
      this.sneezeBlast = false;
  
      this.xScl = 1;
      this.yScl = 1;
    }
  
    sneeze() {
      if (this.sneezing) return;
      this.sneezing = true;
    }
  
    update(dt) {
  
      if (this.sneezing) {
        if (this.sneezeWait > 0) {
          this.sneezeWait -= dt;
  
          this.sneezeTimer -= dt;
  
          if (this.sneezeWait <= 0) {
            this.sneezeTries++;
            this.sneezePauseTime = this.sneezeTimer + randInt(20, 40) * this.sneezeTries;
          }
        } else {
          this.sneezeTimer += 2 * dt;
  
          if (this.sneezeTimer > this.sneezePauseTime) {
            this.sneezeWait = randInt(20, 40);
          }
  
          if (this.sneezeTimer > 175) {
  
            this.sneezeBlast = true;
            // manager.explosionImpulse(los.x, los.y, 100);
            this.sneezing = false;
            this.sneezeTries = 0;
            this.sneezePauseTime = 0;
            this.sneezeWait = 0;
          }
        }
      } else {
        if (this.sneezeTimer > 0) {
          this.sneezeTimer *= Math.pow(0.9, dt);
        }
      }
  
  
      var sneezePerc = (this.sneezeTimer / 200);
      this.xScl = 1 + sneezePerc * 0.4;
      this.yScl = 1 + sneezePerc * 0.4;
      // los.depth += sneezePerc*(-10);
  
    }
  }
  
  class WiggleActor {
    constructor() {
      this.wiggling = false;
  
      this.wiggleAmp = 0;
      this.wigglePhase = 0;
      this.wiggleSpd = 0.2;
  
      this.xScl = 1;
      this.yScl = 1;
    }
  
    wiggle(ang, amp) {
      if (this.wiggling) {
        if (this.wiggleAmp > amp) return;
      }
      this.wiggling = true;
      this.wiggleAmp = amp;
      this.wigglePhase = ang;
  
    }
  
    update(dt) {
      if (this.wiggling) {
        this.wigglePhase += this.wiggleSpd * dt;
        this.xScl = 1 + Math.sin(this.wigglePhase) * this.wiggleAmp;
        this.yScl = 1 - Math.sin(this.wigglePhase) * this.wiggleAmp;
        this.wiggleAmp *= Math.pow(0.95, dt);
        if (Math.abs(this.wiggleAmp) <= 0.0025) {
          this.wiggling = false;
          this.xScl = 1;
          this.yScl = 1;
        }
      }
    }
  }
  
  
  class SpringActor{
    constructor(){
      this.springing = false;
  
      this.treshold = 0.01;
  
      this.force = 0;
      this.coef = 0.05;
      this.loss = 0.05;
      this.spd = 0;
      this.pos = 0;
    }
  
    displace(amount){
      this.pos = amount;
      this.spd = 0;
      this.springing = true;
    }
  
    update(dt){
      if(!this.springing) return;
  
      this.force = -this.pos*this.coef;
      this.spd += this.force*dt;
      this.pos += this.spd*dt;
      this.spd *= Math.pow(1-this.loss, dt);
  
      if(Math.abs(this.pos) + Math.abs(this.spd) < this.treshold){
        this.springing = false;
        this.pos = 0;
        this.spd = 0;
        this.force = 0;
      }
    }
  }

class PhaseActor{
    constructor(amp, spd, phase) {
        this.phase = phase;
        this.spd = spd;
        this.amp = amp;
        this.value = 0;
      }
    
      update(dt) {
        this.phase += this.spd*dt;
        this.value = this.amp*(Math.sin(this.phase));
      }
}
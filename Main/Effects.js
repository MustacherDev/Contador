class EffectManager{
    constructor(owner){
        this.effects = [];
        this.effectQueue = new ActionQueue();

        this.owner = owner;

        this.rotation  = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetDepth = 0;
    }

    addEffect(effect){
        this.effects.push(effect);
        return effect;
    }

    addAction(action){
      this.effectQueue.add(action);
      return action;
    }

    addActionEffect(actionEffect){
      this.effectQueue.add(new ActionEffect(actionEffect, this));
      return actionEffect;
    }

    absorbEffect(effect){
      // LATER THIS CAN BE PLACED INSIDE THE OWNER OBJECT SO THAT EACH OBJECT
      // CAN SOLVE THIS ABSORBING THEIR OWN WAY
      this.owner.ang  += effect.rotation;
      this.owner.x += effect.offsetX;
      this.owner.y += effect.offsetY;
      this.owner.sclX *= effect.scaleX;
      this.owner.sclY *= effect.scaleY;
      this.owner.depth += effect.offsetDepth;
    }

    integrateEffect(effect){
      this.rotation  += effect.rotation;
      this.offsetX += effect.offsetX;
      this.offsetY += effect.offsetY;
      this.scaleX *= effect.scaleX;
      this.scaleY *= effect.scaleY;
      this.offsetDepth += effect.offsetDepth;
    }

    update(dt){
        this.rotation  = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.offsetDepth = 0;
        // THE DIFFERENCE BETWEEN ACTION EFFECTS AND NORMAL ONES IS THAT THE FORMER
        // ALTERS THE STATE OF THE OBJECT AT THE END OF ITS LIFE AND IS EXECUTED IN SEQUENCE
        // LIKE ACTIONS

        // VISUAL EFFECT UPDATE
        for(var effect of this.effects){
          effect.update(dt);
          this.integrateEffect(effect);
        }

        this.effectQueue.update(dt);

    }
}

class Effect {
  constructor() {
    this.active = true;
    this.absorvable = false;

    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetDepth = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.rotation = 0;
  }

  start() {
    this.active = true;
    return this;
  }

  stop() {
    this.active = false;
    return this;
  }

  resetTransform() {
    this.offsetX = 0;
    this.offsetY = 0;

    this.offsetDepth = 0;

    this.scaleX = 1;
    this.scaleY = 1;

    this.rotation = 0;
  }

  update(dt) { }
}

class ActionEffect extends Action{
  constructor(effect, effectManager){
    super();
    this.effect = effect;
    this.effectManager = effectManager;
    this.finished = false;
  }

  finish(){
    this.finished = true;
    if(this.effect.absorvable){
      this.effectManager.absorbEffect(this.effect);
    }
  }

  update(dt){
    if(this.isFinished()) return;

    this.effect.update(dt);
    if(!this.effect.active) {
      this.finish();
    } else {
      this.effectManager.integrateEffect(this.effect);
    }
  }

  isFinished(){
    return this.finished;
  }
}







class MoveEffect extends Effect{
    constructor(duration, xAmount, yAmount, easingX = t => t, easingY = t => t){
        super();

        this.absorvable = true;

        this.duration = duration;
        this.xAmount = xAmount;
        this.yAmount = yAmount;

        this.easingX = easingX;
        this.easingY = easingY;

        this.timer = 0;
    }

    start(){
        super.start();

        this.timer = 0;
        this.resetTransform();

        return this;
    }

    update(dt){
        if(!this.active) return;

        this.timer = Math.min(this.timer + dt, this.duration);

        let progress = this.duration > 0 ? this.timer / this.duration : 1;

        this.offsetX = this.xAmount * this.easingX(progress);
        this.offsetY = this.yAmount * this.easingY(progress);

        if(progress >= 1){
            this.stop();
        }
    }
}




class ShakeEffect extends Effect {
  constructor(config = {amplitude: 20, frequency: 0.05, duration: 40}) {
    super();

    this.amplitude = config.amplitude ?? 20;
    this.frequency = config.frequency ?? 0.05;
    this.duration = config.duration ?? 40;

    this.speed = 1;

    this.elapsed = 0;
  }

  start() {
    super.start();
    this.elapsed = 0;
    return this;
  }

  update(dt) {
    if (!this.active) {
      return;
    }

    this.elapsed += dt*this.speed;

    if (this.elapsed >= this.duration) {
      this.resetTransform();
      this.stop();
      return;
    }

    const progress = this.elapsed / this.duration;
    const strength = 1 - progress;

    var freq =  this.frequency * (1+progress*0.5);

    this.offsetX =
      Math.sin(this.elapsed * freq * Math.PI * 2) *
      this.amplitude *
      strength;
  }
}

class OscillatorEffect extends Effect {
  constructor(amplitude = 1, speed = 0.1, phase = 0) {
    super();

    this.amplitude = amplitude;
    this.speed = speed;
    this.phase = phase;

    this.value = 0;
    this.active = true;
  }

  update(dt) {
    this.phase += this.speed * dt;
    this.value =
      Math.sin(this.phase) *
      this.amplitude;
  }
}



class WiggleEffect extends Effect {
  constructor() {
    super();

    this.amplitude = 0;
    this.phase = 0;

    this.speed = 0.2;
    this.decay = 0.95;
  }

  start(amplitude = 0.2, phase = 0) {
    if (
      this.active &&
      this.amplitude > amplitude
    ) {
      return;
    }

    this.amplitude = amplitude;
    this.phase = phase;

    this.active = true;
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;

    this.phase +=
      this.speed * dt;

    const value =
      Math.sin(this.phase) *
      this.amplitude;

    this.scaleX = 1 + value;
    this.scaleY = 1 - value;

    this.amplitude *=
      Math.pow(this.decay, dt);

    if (
      Math.abs(this.amplitude)
      < 0.0025
    ) {
      this.active = false;
    }
  }
}

class ZoomHoverEffect extends Effect {
  constructor(duration = 20, amplitude = 1) {
    super();

    this.amplitude = amplitude;
    this.stateFlow = new StateFlow(duration);
  }

  start() {
    this.stateFlow.trigger();
    this.active = true;
  }

  stop() {
    this.stateFlow.hide();
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;
    this.stateFlow.update(dt);

    var t = this.stateFlow.progress;

    var t2 = tweenOut(t);

    this.scaleX = 1 + t2 * 0.025;
    this.scaleY = 1 + t2 * 0.025;


  }
}

class ZoomWiggleEffect extends Effect {
  constructor(duration = 20, amplitude = 1) {
    super();

    this.speed = 1;

    this.amplitude = amplitude;
    this.stateFlow = new StateFlow(duration);
  }

  start() {
    this.stateFlow.trigger();
    this.active = true;
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;
    this.stateFlow.update(dt * this.speed);

    var t = this.stateFlow.progress;

    var t2 = (tweenOut(zigzag(t)));
    var t3 = tweenInOut(zigzag(t));

    this.rotation = t3 * this.amplitude * Math.PI / 36;
    this.scaleX = 1 + t2 * 0.05;
    this.scaleY = 1 + t2 * 0.05;

    if (this.stateFlow.state == 2) {
      this.active = false;
      this.stateFlow.setState(0);
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;
    }
  }
}

class BounceWiggleEffect extends Effect {
  constructor(duration = 20, amplitude = 1, frequency = 1) {
    super();

    this.speed = 1;
    this.frequency = frequency;

    this.amplitude = amplitude;
    this.stateFlow = new StateFlow(duration);
  }

  start() {
    this.stateFlow.trigger();
    this.active = true;
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;
    this.stateFlow.update(dt * this.speed);

    var t = zloop(this.stateFlow.progress, this.frequency);

    var t2 = tweenOut(t);
    var t3 = tweenInOut(t);

    var tAmp = tweenOut(1-t);

    this.rotation = tAmp* t3 * this.amplitude * Math.PI / 36;
    this.scaleX = 1 + t2 * 0.05*this.amplitude*tAmp;
    this.scaleY = 1 + t2 * 0.05*this.amplitude*tAmp;

    if (this.stateFlow.state == 2) {
      this.active = false;
      this.stateFlow.setState(0);
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;
    }
  }
}

class SelectionWobbleEffect extends Effect{
  constructor(config = {fadeDuration:50, wobbleDuration:80, wobbleAngle:0.2}) {
    super();
    this.wobbleAngle = config.wobbleAngle;
    this.stateFlow = new StateFlow(config.fadeDuration);
    this.alarm = new Alarm(config.wobbleDuration);
    this.alarm.loop = true;
  }

  start() {
    this.stateFlow.trigger();
    this.active = true;
  }

  stop() {
    this.stateFlow.hide();
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;
    this.stateFlow.update(dt);

    this.alarm.update(dt);

    var t = this.stateFlow.progress;
    var t2 = tweenOut(t);

    this.rotation = this.wobbleAngle*(tweenInOut(zigzag(this.alarm.percentage()))-0.5)*t2;
  }
}

class SelectionZoomOutEffect extends Effect{
  constructor(config = {fadeDuration:40, amplitude:0.04}) {
    super();
    this.stateFlow = new StateFlow(config.fadeDuration);
    this.amplitude = config.amplitude;
  }

  start() {
    this.stateFlow.trigger();
    this.active = true;
  }

  stop() {
    this.stateFlow.hide();
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;
    this.stateFlow.update(dt);

    var t = this.stateFlow.progress;
    var t2 = tweenOut(t);

    this.scaleX = 1 - t2*this.amplitude;
    this.scaleY = this.scaleX;
  }
}

class SelectionZoomEffect extends Effect{
  constructor(config = {riseDuration:10, fallDuration:20, amplitude: 0.05}) {
    super();
    this.riseDur = config.riseDuration;
    this.fallDur = config.fallDuration;
    this.riseFraction = this.riseDur/(this.riseDur+this.fallDur);
    this.alarm = new Alarm(this.riseDur+this.fallDur);

    this.amplitude = config.amplitude;
  }

  start() {
    this.alarm.restart();
    this.active = true;
  }

  update(dt) {
    this.resetTransform();

    if (!this.active) return;


    this.alarm.update(dt);

    var t = this.alarm.percentage();
    var t2 = risefall(t, this.riseFraction);

    this.scaleX = 1 + tweenOut(t2)*this.amplitude;
    this.scaleY = 1 + tweenOut(t2)*this.amplitude;

    if(this.alarm.finished){
      this.active = false;
    }
  }
}

class RiseEffect extends Effect{
  constructor(){
    super();

    this.stateFlow = new StateFlow(30);
    this.amplitude = 100;
  }

  trigger(){
    this.stateFlow.trigger();
  }

  hide(){
    this.stateFlow.hide();
  }

  update(dt){
    this.stateFlow.update(dt);
    this.offsetDepth = this.stateFlow.progress*this.amplitude;
  }
}

class MoveEffectBase extends Effect {
  constructor() {
    super();

    this.targetX = 0;
    this.targetY = 0;

    this.targetDepth = 0;
    this.peakDepth = 0;
    this.baseDepth = 0;

    this.speed = 1;
    this.alarm = new Alarm(50);

    this.tweenMethod = "tweenInOut";
    this.resetOnFinish = true;
  }

  start(curX, curY, targetX, targetY, config = {}) {
    this.targetX = targetX - curX;
    this.targetY = targetY - curY;

    this.speed = config.speed || 1;
    this.tweenMethod = config.tweenMethod || "tweenInOut";
    this.resetOnFinish = config.resetOnFinish ?? true;

    if(config.targetDepth && config.curDepth){
      this.targetDepth = (config.targetDepth - config.curDepth);
      this.peakDepth = (Math.max(config.targetDepth, config.curDepth) + 100) - config.curDepth;
      this.baseDepth = Math.max(config.targetDepth, config.curDepth);
    } else {
      this.targetDepth = 0;
      this.peakDepth = 100;
      
    }

    this.alarm.restart();
    this.active = true;
  }

  getBaseT(t) {
    return t;
  }

  applyTween(t) {
    switch (this.tweenMethod) {
      case "tweenIn":
        return tweenIn(t);

      case "tweenOut":
        return tweenOut(t);

      case "tweenInOut":
        return tweenInOut(t);

      case "linear":
      default:
        return t;
    }
  }

  update(dt) {
    if (!this.active) return;

    this.alarm.update(dt * this.speed);

    const t = this.alarm.percentage();

    const baseT = this.getBaseT(t);
    const t2 = this.applyTween(baseT);

    this.offsetX = t2 * this.targetX;
    this.offsetY = t2 * this.targetY;

    const turnSign = sign(this.targetX);
    const turn =
      tweenInOut(zigzag(t)) *
      Math.min(Math.abs(this.targetX / 100), Math.PI / 8) *
      turnSign;

    this.rotation = turn;

    this.offsetDepth = risefallExt(t, 0.5, 0, this.peakDepth, this.targetDepth);
    

    if (this.alarm.finished) {
      this.active = false;

      if (this.resetOnFinish) {
        this.resetTransform();
      }
    }
  }
}

class MoveToEffect extends MoveEffectBase {
  getBaseT(t) {
    return t;
  }
}

class MoveFromEffect extends MoveEffectBase {
  getBaseT(t) {
    return 1 - t;
  }
}

class FlipEffect extends Effect {
  constructor(flipCallback = null) {
    super();

    this.phase = 0;
    this.targetPhase = 0;

    this.speed = 0.1;

    this.flipped = false;
    this.isFront = true;
    this.lastFront = true;

    this.flipCallback = flipCallback;
  }

  flip(turns = 1) {
    this.targetPhase = this.phase + turns * Math.PI;

    this.active = true;
  }

  setFlip(flipSide){
    this.phase = flipSide*Math.PI;
    this.targetPhase = this.phase;
    this.active = true;
    this.update(0);
    if (this.flipCallback) {
      this.flipCallback();
    }
  }





  update(dt) {
    this.flipped = false;

    if (!this.active) return;

    this.phase += this.speed * dt;

    this.scaleX = Math.cos(this.phase);

    this.isFront = phaseAngleToSide(this.phase);

    if (this.isFront !== this.lastFront) {
      this.flipped = true;
      if (this.flipCallback) {
        this.flipCallback();
      }
    }

    this.lastFront = this.isFront;

    if (this.phase >= this.targetPhase) {
      this.phase = this.targetPhase;

      this.active = false;
    }
  }
}
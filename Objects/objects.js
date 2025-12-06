

const OBJTAG = Object.freeze(new Enum(
  "TILE",
  "MOVETILE",
  "FLOORTILE",
  "BRIDGE",
  "TOTAL"
));



class Ball extends Box {
  constructor(x, y, radius, sprite) {
    super(x, y, radius * 2, radius * 2, sprite);
    this.type = OBJECT.BALL;
    this.xOffset = radius;
    this.yOffset = radius;

    this.scale2FitSprite(1, 1.2);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.boundingBox.setOffset(this.xOffset, this.yOffset);
    this.clickBox.setOffset(this.xOffset, this.yOffset);

    //this.collideWith = [OBJECT.GRAVESTONE];
    this.roomLimitsActive = [false, false, false, false];

    this.r = radius;

    this.setDepth();
  }
}

class BalloonZombie extends AnimeBox{
  constructor(x, y){
    super(x, y, 100, 100, sprites[SPR.BALLOONZOMBIE]);

    this.scale2Overflow();
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.xScl *= 2;
    this.yScl = this.xScl;
    this.setSpriteOffsetRelative(0.5, 0.5);
    

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();

    this.roomLimitsActive = [false, false, false, false];

    this.canBeHeld = false;

    this.type = OBJECT.BALLOONZOMBIE;

    this.triggered =false;
    this.grabbing = false;
    this.finished = false;
    this.target = null;

    this.targetYOff= 0;

    

    
    this.imgSpd = 0.25;
    this.img = 0;
  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }

  trigger(){
    if(this.triggered) return;
    playSound(SND.BALLOONINFLATE);
    
    var obj = null;

    if(this.room.id == ROOM.NAT){
      obj = this.room.classes[OBJECT.CATFOOD][0];
    } else if (this.room.id == ROOM.DAN){
      obj = this.room.classes[OBJECT.BANANA][0];
    }

    if(!obj) return;

    this.target = obj;

    this.x = obj.x;
    this.y = canvasHeight + this.height;

    this.triggered = true;

    this.vspd = -3;
    
  } 


  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

    this.img += this.imgSpd*dt;

    // if(manager.balloonTrigger){
    //   this.trigger();
    // }

    if(this.triggered && !this.grabbing){
      if(this.boundingBox.intersects(this.target.boundingBox)){
        this.grabbing = true;
        this.targetYOff = this.target.y - this.y;

        // TRIGGERING CAT ALERT
        var cat = manager.search.getFirstObjByType(OBJECT.CATTHING);
        if(cat){
          cat.triggerAlert();
        }
      }
    }

    if(this.grabbing && !this.finished){
      this.target.y = this.y + this.targetYOff;

      if(this.boundingBox.getBottom() < 0){
        this.finished = true;
        this.target.active = false;
        var cat = manager.search.getFirstObjByType(OBJECT.CATTHING);
        if(cat){
          cat.triggerAnger();
        }
      }
    }
  }

  draw(ctx){
    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    this.sprite.drawExt(this.x, this.y, Math.floor(this.img), xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);

    //this.boundingBox.draw(ctx);
  }
}


class Calendar extends AnimeBox{
  constructor(x, y){
    super(x, y, 200, 200, sprites[SPR.CALENDAR]);

    this.scale2Overflow();
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();


    this.roomLimitsActive = [true, true, true, true];
    this.rotateOnCollision = false;
    this.canBeHeld = false;

    this.type = OBJECT.CALENDAR;

    this.hoverAlarm = new Alarm(0, 20);
    this.hoverState = new StateFlow(0, 10);

    this.day = 0;

    
    this.imgSpd = 0;
    this.img = 0;
  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }


  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

    if(this.hovered){
      if(this.hoverState.state == 0){
        if(this.hoverAlarm.finished){
          this.hoverState.trigger();
          this.hoverAlarm.restart();
        }
      } else {
        this.hoverAlarm.restart();
      }
    } else {
      if(this.hoverState.state == 2){

        if(this.hoverAlarm.finished){
          this.hoverState.hide();
          this.hoverAlarm.restart();
        }
        
      } else {
        this.hoverAlarm.restart();
      }
    }

    this.hoverAlarm.update(dt);
    this.hoverState.update(dt);

    if(this.hovered && input.mouseState[0][1]){
      if(this.hoverState.state == 0){
        this.hoverState.trigger();
      } else {
        this.hoverState.hide();
      }
    }

  }

  draw(ctx){
    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    this.sprite.drawExt(this.x, this.y, this.img, xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);

    if(this.hoverState.state != 0){
      var alpha = ctx.globalAlpha;
      ctx.globalAlpha = alpha*tweenIn(this.hoverState.progress);
      sprites[SPR.BIRTHDAY].drawExtRelative(this.x, this.y - 250, this.day, xScl, yScl, this.and, 0.5, 0.5);
      ctx.globalAlpha= alpha;
    }
  }
}

class Banana extends AnimeBox{
  constructor(x, y){
    super(x, y, 100, 100, sprites[SPR.BANANA]);

    this.scale2Overflow();
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();

    this.roomLimitsActive = [true, true, true, true];

    this.type = OBJECT.BANANA;

    
    this.imgSpd = 0;
    this.img = 0;
  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }


  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

  }

  draw(ctx){
    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    this.sprite.drawExt(this.x, this.y, this.img, xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);
  }
}

class CatFood extends AnimeBox{
  constructor(x, y){
    super(x, y, 100, 100, sprites[SPR.CATFOOD]);

    this.scale2Overflow();
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();

    this.roomLimitsActive = [true, true, true, true];
    this.rotateOnCollision = false;

    this.type = OBJECT.CATFOOD;

    
    this.imgSpd = 0;
    this.img = 0;
  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }


  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

  }

  draw(ctx){
    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    this.sprite.drawExt(this.x, this.y, this.img, xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);

    //this.boundingBox.draw(ctx);
  }
}


class GreenArrow extends AnimeBox{
  constructor(x, y){
    super(x, y, 100, 100, sprites[SPR.GREENARROW]);

    this.scale2Overflow();
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();

    this.roomLimitsActive = [true, true, true, true];
    this.rotateOnCollision = false;
    this.canBeHeld = false;

    this.type = OBJECT.GREENARROW;

    
    this.imgSpd = 0;
    this.img = 0;
  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }


  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

    if(this.hovered && manager.roomTransition.finished){
      if(input.mouseState[0][1]){
         if(this.room.id == ROOM.NAT){
              manager.roomTransition.startTransition(200, ROOM.DAN, null);
          } else {
              manager.roomTransition.startTransition(200, ROOM.NAT, null);
          }
      }
    }

  }

  draw(ctx){



    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    if(this.hovered){
      xScl *= 1.1;
      yScl *= 1.1;
    }

    this.sprite.drawExt(this.x, this.y, this.img, xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);

    //this.boundingBox.draw(ctx);
  }
}

class CatThing extends AnimeBox{
  constructor(x, y){
    super(x, y, 160, 200, sprites[SPR.OIIA]);

    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();

    this.catSounds = [SND.CATO, SND.CATI, SND.CATI, SND.CATA, SND.CATI, SND.CATON, SND.CATI, SND.CATI,SND.CATI, SND.CATI, SND.CATA, SND.CATI];
    this.catSoundIndex = 0;
    this.catAlarm = new Alarm(0, 5);

    this.roomLimitsActive = [true, true, true, true];

    this.eating = false;
    this.eatingPartAlarm = new Alarm(0, 5);
    this.eatUpdateAlarm = new Alarm(0, 10);
    this.eatingSounds = [];

    this.eatSoundDur = 1.5;
    this.eatSoundAlarm = new Alarm(60*this.eatSoundDur, 60*this.eatSoundDur);

    this.timesEaten = 0;

    this.alert = false;

    this.type = OBJECT.CATTHING;
    this.imgSpd = 0;
    this.img = 0;

  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }

  catting(){
    if(!this.catAlarm.finished) return;
    this.wiggle();
    playSound(this.catSounds[this.catSoundIndex]);
    this.catSoundIndex++;
    if(this.catSoundIndex >= this.catSounds.length) {
      this.catSoundIndex = 0;
      this.flipAct.startFlip(1);
    }
    this.catAlarm.restart();
  }

  isEating(){
    if(this.alert) return false;
    if(this.holder.holded) return false;
    var obj = manager.search.getFirstColliderByType([OBJECT.CATFOOD], this.boundingBox);
    if(!obj) return false;
    return true;
  }

  triggerAlert(){
    this.alert = true;

    this.hspd = 10;
    this.linDamp = 0.95;
    this.canBeHeld = false;

    this.wiggle();
    playSound(SND.MEOW1);

    this.img = 1;
  }

  triggerAnger(){

    this.wiggle();
    playSound(SND.ANGRYMEOW);

    var greenArrow = new GreenArrow(canvasWidth - 120, canvasHeight * 0.5);
    this.room.addObject(greenArrow);

    this.img = 2;
  }

  eat(){
    if(this.alert) return;

    this.timesEaten++;

    if(this.timesEaten >= 4){

      //this.triggerAlert();
      var zombie = this.room.classes[OBJECT.BALLOONZOMBIE][0];
      if(zombie){
        zombie.trigger();
      }
      this.eatSoundAlarm.restart();
      return;
    } 

    var newSoundId = playSound(SND.MINEEATING);
      
    if(newSoundId){
      this.eatingSounds.push(newSoundId);
    }

    this.eatSoundAlarm.restart();
  }

  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

    this.catAlarm.update(dt);

    if(this.holder.holdEvent){
      this.catting();
      this.holder.holdEvent = false;
    }

    this.eatUpdateAlarm.update(dt);
    this.eatingPartAlarm.update(dt);

    if(this.eatUpdateAlarm.finished){
      this.eating = this.isEating();
      this.eatUpdateAlarm.restart();
    }




    if(this.eating && !this.alert){
      this.eatSoundAlarm.update(dt);

      if(this.eatingPartAlarm.finished){
        manager.addParticle(particleDirtSlide(this.x, this.y));
        this.eatingPartAlarm.restart();
      }

      if(this.eatSoundAlarm.finished){
        this.eat();
      }
    } else {
      if(this.eatingSounds.length > 0){
        this.eatingSounds = [];
      }
    }

     for(var i = 0; i < this.eatingSounds.length; i++){
        var sound = this.eatingSounds[i];
        var eatSound = sounds[SND.MINEEATING];
        var nower = eatSound.howl.seek(sound);
        var dur = this.eatSoundDur;
        if(nower >= dur - 0.1){
          console.log("SPLICED " + sound);
          this.eatingSounds.splice(i, 1);
          i--;
        }
      }
  }

  draw(ctx){
    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    this.sprite.drawExt(this.x, this.y, this.img, xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);

    //this.boundingBox.draw(ctx);
  }
}

class MonkeyThing extends AnimeBox{
  constructor(x, y){
    super(x, y, 100, 100, sprites[SPR.MONKEYWHEEL]);

    this.scale2Overflow();
    this.xScl *= 2;
    this.yScl = this.xScl;
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.5);

    this.gravityOn = false;
    this.flipAct = new FlipActor();
    this.sneezeAct = new SneezeActor();
    this.wiggleAct = new WiggleActor();

    this.catSounds = [SND.CATO, SND.CATI, SND.CATI, SND.CATA, SND.CATI, SND.CATON, SND.CATI, SND.CATI,SND.CATI, SND.CATI, SND.CATA, SND.CATI];
    this.catSoundIndex = 0;
    this.catAlarm = new Alarm(0, 5);

    this.rotateOnCollision = false;

    this.roomLimitsActive = [true, true, true, true];

    this.eating = false;
    this.eatingPartAlarm = new Alarm(0, 5);
    this.eatUpdateAlarm = new Alarm(0, 10);
    this.eatingSounds = [];

    this.eatSoundDur = 1.5;
    this.eatSoundAlarm = new Alarm(60*this.eatSoundDur, 60*this.eatSoundDur);

    this.timesEaten = 0;

    this.alert = false;

    this.type = OBJECT.MONKEYTHING;
    this.imgSpd = 0.2;
    this.img = 0;

    this.spinSpd = 0;
    this.spinBoostSpd = 0;

  }

  wiggle(){
    this.wiggleAct.wiggle(0, 0.25);
  }

  isEating(){
    if(this.holder.holded) return false;
    var obj = manager.search.getFirstColliderByType([OBJECT.BANANA], this.boundingBox);
    if(!obj) return false;
    obj.x = randRange(0, canvasWidth);
    obj.y = randRange(0, canvasHeight);
    this.spinSpd = clamp(this.spinSpd, 0, 0.5);
    this.spinBoostSpd += 0.2;
    return true;
  }



  

  update(dt){
    this.updateActors(dt);
    this.updateBox(dt);

    this.isEating();

    this.spinBoostSpd *= Math.pow(0.98, dt);
    this.imgSpd = this.spinSpd + this.spinBoostSpd;
    this.img += this.imgSpd*dt;
  }

  draw(ctx){
    var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
    var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

    this.sprite.drawExt(this.x, this.y, Math.floor(this.img), xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);

    //this.boundingBox.draw(ctx);
  }
}
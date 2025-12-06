class GenericPlayer extends Actor{
  constructor(x, y) {
    super(x, y, 64, 64, sprites[SPR.XAROP]);
    this.type = OBJECT.GENERICPLAYER;

    this.scale2FitSprite(2, 2);
    this.setGeneralOffsetRelative(0.5, 0.5);
    this.setSpriteOffsetRelative(0.5, 0.75);

    this.facing = 1;
    this.img = 0;
    this.imgSpd = 0.05;

    this.vspdMax = 30;
    this.hspdMax = 30;

    this.walkSpd = 5;

    this.jumpGravity = 0.4;
    this.fallGravity = 0.5;

    this.gravity.y = 0.2;
    this.vLoss = 0.5;


    this.rotateOnCollision = false;

    this.collideWith = [];
    this.semiCollideWith = [];

    // JUMPING
    this.groundJumps = 1;
    this.airJumps = 1;
    this.airJumpMax = 1;
    this.jumpingFrames = 0;

    this.coyoteTime = new Alarm(0, 10);
    this.jumpBufferTime = new Alarm(10, 10);
    this.jumpResetTimer = new Alarm(0, 2);

    // LIFE AND DAMAGE
    this.lifeMax = 10;
    this.life = 10;
    this.damageCooldown = new Alarm(0, 10);
    this.hurtFaceAlarm = new Alarm(25, 25);

    this.dead = false;


    this.wobbleAlarm = new Alarm(0, 50);

    this.sleepAlarm = new Alarm(0, 500);

    this.onWall = false;

    this.holder = new Holder();
    this.hovered = false;


    this.flipAct = new FlipActor();
    this.wiggleAct = new WiggleActor();


    this.drawXScl = this.xScl;
    this.drawYScl = this.yScl;

    this.setDepth();
  }

  onVCollide() {
    var spd = Math.abs(this.vspd);
    if (spd >= 1.5) {
      var ang = deg2rad(0);
      var amp = clamp(1 - (4 / spd), 0, 0.5);
      amp *= 0.5;
      this.wiggleAct.wiggle(ang, amp);
    }

    this.vspd = 0;
  }

  onHCollide() {
    var spd = Math.abs(this.hspd);
    if (spd >= 1.5) {
      var ang = deg2rad(180);
      var amp = clamp(1 - (4 / spd), 0, 0.5);
      this.wiggleAct.wiggle(ang, amp);
    }

    this.hspd = 0;
  }

  jump() {
    if(!this.onGround){
      if(this.coyoteTime.finished) {
        return false;
      } else {
        if(this.groundJumps > 0){
          this.groundJumps = 0;
        } else {
          return false;
        }
      }
    } else if(this.onGround){
      this.groundJumps = 0;
    }

    this.gravity.y = this.jumpGravity;
    this.vspd = -10;
    this.wiggleAct.wiggle(deg2rad(180), 0.5);
    this.jumpingFrames = 2;

    this.jumpResetTimer.restart();
    return true;
  }
    

  doHurt(amount){
    if(this.damageCooldown.finished){
      this.life -= amount;

      this.wiggleAct.wiggle(0, 0.7);
      this.damageCooldown.restart();
      this.hurtFaceAlarm.restart();

      //manager.screenShaker.startShake(6, 20);
      playSound(SND.HIT);
    }
  }


  getCollision(){
    if(this.room.tileMap.collision(this.boundingBox)) return true;

    if(manager.search.getFirstSolidColliderByType(this.collideWith, this.boundingBox)) return true;

    if(this.vspd >= 0){
      var semiSolids = manager.search.getSolidCollidersByType(this.semiCollideWith, this.boundingBox);
      for(var i = 0; i < semiSolids.length; i++){
        var obj = semiSolids[i];
        if(obj.boundingBox.getTop() >= this.boundingBox.getBottom() - 1){
          if(this.boundingBox.intersects(obj.boundingBox)) return true;
        }
      }
    }

    return false;
  }

  update(dt) {

    if(manager.editor.editing) return;

    var gdt = dt * manager.gameSpeed;

    this.coyoteTime.update(gdt);
    this.jumpResetTimer.update(gdt);
    this.jumpBufferTime.update(gdt);
    this.damageCooldown.update(dt);
    
    this.hovered = this.boundingBox.contains(manager.mouseX, manager.mouseY);

   
    if(this.onGround){
      this.gravityOn = false;
    } else {
      this.gravityOn = true;
    }

    this.updateActor(gdt);

    if(this.onGround){
      if(this.jumpingFrames > 0){
        this.jumpingFrames--;
      }
    }

    // MOVEMENT INPUT
    var moveX = 0;
    var moveY = 0;

    if(gdt > 0){
      if (input.keyState[KeyCodes.ArrowLeft][0]) {
        moveX -= 1;
      }
      if (input.keyState[KeyCodes.ArrowRight][0]) {
        moveX += 1;
      }

      if (input.keyState[KeyCodes.ArrowUp][0]) {
        moveY -= 1;
      }
      if (input.keyState[KeyCodes.ArrowDown][0]) {
        moveY += 1;
      }
    }


    if(!this.dead){
      this.hspd = moveX * this.walkSpd;

      // JUMP INPUT
      if(input.keyState[KeyCodes.KeyC][0]){ 
        if (input.keyState[KeyCodes.KeyC][1]) {
          if(!this.jump()){
            // IF COULD NOT JUMP AT THE MOMENT, STORE THE INPUT IN THE JUMP BUFFER TIMER
            // WHILE IT DOESN'T FINISH CHECK IF THE JUMP IS POSSIBLE
            this.jumpBufferTime.restart();
          }
        }
      } else {
        // FRAMES HOLDING JUMP BUTTON
        this.jumpingFrames = 0;
      }

      // CHECKING IF THE STORED JUMP IS POSSIBLE
      if(!this.jumpBufferTime.finished){
        if(this.jump()){
          this.jumpBufferTime.finished = true; //??????
        }
      }
    }
    
    


    // ON WALL AND ON GROUND CHECKS
    this.boundingBox.y += 1;
    if (this.getCollision()) {
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    this.boundingBox.y = this.y;


    this.boundingBox.x += 1 * this.facing;
    if (this.getCollision()) {
      this.onWall = true;
    } else {
      this.onWall = false;
    }
    this.boundingBox.x = this.x;


    // GRAVITY ADJUSTMENT
    if(!this.onGround){
      if(this.vspd > 0){
        this.gravity.y = this.fallGravity;
        //console.log("heavy gravity");
      } else {
        if(this.jumpingFrames > 0){
          this.gravity.y = this.jumpGravity - 0.15;
          //console.log("less gravity");
        } else {
          this.gravity.y = this.jumpGravity;
          //console.log("normal gravity");
        }
      }
    } else {
      this.coyoteTime.restart();
    }

    if (this.onGround) {
      if(this.jumpResetTimer.finished){
        this.groundJumps = 1;
      }
    }



   

    // ANIMATIONS
    this.xSprOffset = this.sprite.width/2;
    if (moveX != 0) {
      this.facing = moveX;
      this.sprite = sprites[SPR.XAROP];
      this.imgSpd = 0.24;
    } else {
      this.sprite = sprites[SPR.XAROP];
      this.imgSpd = 0.08;
    }
    
    

    this.hurtFaceAlarm.update(gdt);
    if(!this.hurtFaceAlarm.finished){
      this.sprite = sprites[SPR.XAROP];
    }

    if(this.dead){
      this.sprite = sprites[SPR.XAROP];
      this.imgSpd = 0;
    }

    this.img += this.imgSpd * gdt;



    this.wobbleAlarm.update(gdt);
    if (this.wobbleAlarm.finished) {
      this.wobbleAlarm.restart();
    }


    if (this.holder.holded) {
      this.wasGrabbed = true;
      this.ang = Math.PI / 12 * tweenInOut(zigzag(this.wobbleAlarm.percentage())) - Math.PI / 24;
    } else {
      this.ang *= 0.95;
    }

    this.flipAct.update(gdt);
    this.wiggleAct.update(gdt);


    this.holder.getHold(this);
    this.holder.update(this);

    this.drawXScl = this.xScl * Math.cos(this.flipAct.phase) * this.wiggleAct.xScl * this.facing;
    this.drawYScl = this.yScl * this.wiggleAct.yScl;

    if(this.life <= 0){
      this.dead = true;
      manager.gameOver = true;
    } else {
      this.dead = false;
    }
  }

  draw(ctx) {
    var xScl = this.drawXScl;
    var yScl = this.drawYScl;

    this.sprite.drawExt(this.x, this.y, Math.floor(this.img), xScl, yScl, this.ang, this.xSprOffset, this.ySprOffset);
  }
}
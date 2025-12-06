class Box extends GameObject {
    constructor(x, y, width, height, sprite) {
      super(x, y, sprite);
  
      this.type = OBJECT.BOX;
  
      this.width = width;
      this.height = height;
  
      this.xOffset = 0;
      this.yOffset = 0;
  
      this.xSprOffset = 0;
      this.ySprOffset = 0;
  
      this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
      this.boundingBox.xOffset = this.xOffset;
      this.boundingBox.yOffset = this.yOffset;
  
      this.clickBox = new BoundingBox(this.x, this.y, this.width, this.height);
      this.clickBox.xOffset = this.xOffset;
      this.clickBox.yOffset = this.yOffset;
  
      this.hovered = false;
  
      this.hspdMax = 20;
      this.vspdMax = 20;
      this.angSpdMax = 1;
  
      this.angDamp = 0.99;
      this.linDamp = 0.999;
  
      this.frictionDamp = 0.95;
  
      this.vLoss = 0.8;
      this.hLoss = 0.9;
  
      this.gravityOn = true;
      this.gravity = new Vector(0, 0.1);
  
      this.rotateOnCollision = true;
  
      this.hacc = 0;
      this.vacc = 0;
  
      this.solid = true;
  
      // EAST, NORTH, WEST, SOUTH
      this.roomLimitsActive = [true, false, true, true];
      this.roomLimits = [canvasWidth, 0, 0, canvasHeight];
  
      this.onGround = false;
  
      this.holder = new Holder();
      this.canBeHeld = true;
  
  
      this.collideWith = [];

      this.setDepth();
    }
  
    getHitBox(){
      return this.boundingBox;
    }
  
    getClickBox(){
      return this.clickBox;
    }
  
    scale2FitSprite(extraSclX = 1, extraSclY = extraSclX) {
      this.xScl = extraSclX * this.width / this.sprite.width;
      this.yScl = extraSclY * this.height / this.sprite.height;
    }
  
    setGeneralOffsetRelative(xOffRel, yOffRel) {
      this.setGeneralOffset(xOffRel * this.width, yOffRel * this.height);
    }
  
    setGeneralOffset(xOff, yOff) {
      this.xOffset = xOff;
      this.yOffset = yOff;
      this.xSprOffset = this.xOffset / this.xScl;
      this.ySprOffset = this.yOffset / this.yScl;
      this.boundingBox.setOffset(this.xOffset, this.yOffset);
      this.clickBox.setOffset(this.xOffset, this.yOffset);
    }
  
    setSpriteOffsetRelative(xOffRel, yOffRel) {
      this.setSpriteOffset(xOffRel * this.sprite.width, yOffRel * this.sprite.height);
    }
    setSpriteOffset(xOff, yOff) {
      this.xSprOffset = xOff;
      this.ySprOffset = yOff;
    }
  
    scale2Contain() {
      var ratX = this.width / this.sprite.width;
      var ratY = this.height / this.sprite.height;
  
      var rat = Math.min(ratX, ratY);
      this.xScl = rat;
      this.yScl = rat;
    }
  
    scale2Overflow() {
      var ratX = this.width / this.sprite.width;
      var ratY = this.height / this.sprite.height;
  
      var rat = Math.max(ratX, ratY);
      this.xScl = rat;
      this.yScl = rat;
    }
  
    draw(ctx) {
      this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.ang, this.xSprOffset, this.ySprOffset);
      //this.boundingBox.draw(ctx);
    }
  
  
    parameterStep(dt) {
  
      if(manager.mainRoom){
        this.roomLimits[0] = manager.mainRoom.width;
        this.roomLimits[3] = manager.mainRoom.height;
      }
  
  
      if (this.gravityOn) {
        this.hacc += this.gravity.x;
        this.vacc += this.gravity.y;
      }
  
      this.hspd += this.hacc * dt;
      this.vspd += this.vacc * dt;
  
      this.hspd *= Math.pow(this.linDamp, dt);
      this.vspd *= Math.pow(this.linDamp, dt);
      this.angSpd *= Math.pow(this.angDamp, dt);
  
      this.hspd = clamp(this.hspd, -this.hspdMax, this.hspdMax);
      this.vspd = clamp(this.vspd, -this.vspdMax, this.vspdMax);
      this.angSpd = clamp(this.angSpd, -this.angSpdMax, this.angSpdMax);
  
      if(manager.topDownDepth){
        this.depth = -this.y;
      }
  
      this.objectHCollisions(dt);
      this.x += this.hspd * dt;
      this.objectVCollisions(dt);
      this.y += this.vspd * dt;
  
      this.boundingBox.updatePos(this.x, this.y);
      this.clickBox.updatePos(this.x, this.y);
      this.ang += this.angSpd * dt;
  
  
  
  
      this.hacc = 0;
      this.vacc = 0;
  
    }
  
    collisionAction(isHorizontal, velocity) {
  
    }
  
    objectHCollisions(dt) {
      // HORIZONTAL
      var search = manager.search;
      var hdir = sign(this.hspd * dt);
      if (hdir == 0) return;
  
      if (search.getFirstSolidColliderByType(this.collideWith, this.boundingBox.copy(this.hspd * dt, 0))) {
        if (Math.abs(this.hspd * dt) >= 1) {
          var iter = 0;
          while (!search.getFirstSolidColliderByType(this.collideWith, this.boundingBox.copy(hdir, 0))) {
            this.x += hdir;
            this.boundingBox.x = this.x;
            iter++;
            if (iter > 100) {
              console.log("Crash Aborted");
              console.log("X: " + this.x);
              console.log("Y: " + this.y);
              console.log("HSPD: " + this.hspd * dt);
              break;
            }
          }
        }
        this.hspd = 0;
      }
    }
    objectVCollisions(dt) {
      // VERTICAL
      var search = manager.search;
      var vdir = sign(this.vspd * dt);
      if (vdir == 0) return;
      if (search.getFirstSolidColliderByType(this.collideWith, this.boundingBox.copy(this.vspd * dt, 0))) {
        if (Math.abs(this.vspd * dt) > 1) {
          var iter = 0;
          while (!search.getFirstSolidColliderByType(this.collideWith, this.boundingBox.copy( vdir, 0))) {
            this.y += vdir;
            this.boundingBox.y = this.y;
            iter++;
            if (iter > 100) {
              console.log("Crash Aborted");
              console.log("X: " + this.x);
              console.log("Y: " + this.y);
              console.log("VSPD: " + this.vspd * dt);
              break;
            }
          }
        }
        this.vspd = 0;
      }
    }
  
    wallCollisions(dt) {
      // Wall Collisions
      if (!this.holder.holded) {
  
        if (this.roomLimitsActive[0]) {
          if (this.x - this.boundingBox.xOffset + this.width > this.roomLimits[0]) {
            this.collisionAction(true, this.hspd);
  
            this.x = this.roomLimits[0] - this.width + this.boundingBox.xOffset;
  
            if (this.rotateOnCollision) {
              this.angSpd -= this.vspd / 40;
            }
            this.hspd *= -this.hLoss;
          }
        }
  
        if (this.roomLimitsActive[2]) {
          if (this.x - this.boundingBox.xOffset < this.roomLimits[2]) {
            this.collisionAction(true, this.hspd);
  
            this.x = this.roomLimits[2] + this.boundingBox.xOffset;
  
            if (this.rotateOnCollision) {
              this.angSpd += this.vspd / 40;
            }
            this.hspd *= -this.hLoss;
          }
        }
  
        if (this.roomLimitsActive[1]) {
          if (this.y - this.boundingBox.yOffset < this.roomLimits[1]) {
            if (Math.abs(this.vspd) > Math.abs(this.gravity.y * 3)) {
              this.collisionAction(false, this.vspd);
              if (this.rotateOnCollision) {
                this.angSpd -= this.hspd / 40;
              }
            }
  
            this.y = this.roomLimits[1] + this.boundingBox.yOffset;
            this.vspd *= -this.vLoss;
            this.hspd *= this.frictionDamp;
          }
        }
  
        if (this.roomLimitsActive[3]) {
          if (this.y - this.boundingBox.yOffset + this.height > this.roomLimits[3]) {
            if (Math.abs(this.vspd) > Math.abs(this.gravity.y * 3)) {
              this.collisionAction(false, this.vspd);
              if (this.rotateOnCollision) {
                this.angSpd -= this.hspd / 40;
              }
            }
  
            this.y = this.roomLimits[3] - this.height + this.boundingBox.yOffset;
            this.vspd *= -this.vLoss;
            this.hspd *= this.frictionDamp;
          }
        }
      }
  
      if (this.roomLimitsActive[3]) {
        if (this.y - this.boundingBox.yOffset + this.height + 1 > this.roomLimits[3]) {
          this.onGround = true;
        } else {
          this.onGround = false;
        }
      } else {
        this.onGround = false;
      }
    }
  
    updateBox(dt) {
  
      this.parameterStep(dt);
  
      this.hovered = false;
      if (this.clickBox.isPointInside(manager.mouseX, manager.mouseY)) {
        this.hovered = true;
      }
  
      this.holder.getHold(this);
  
      this.wallCollisions(dt);
  
      if (this.onGround) {
        if (this.rotateOnCollision) {
          this.angSpd = this.hspd / 40;
        }
      }
  
      this.holder.update(this);
    }
  
    update(dt) {
      this.updateBox(dt);
    }
  }
  
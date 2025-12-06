class Actor extends Box {
    constructor(x, y, width, height, sprite) {
      super(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height), sprite);
  
      this.xRemainder = 0;
      this.yRemainder = 0;

      this.setDepth();
    }
  
    onHCollide() {
  
    }
  
    onVCollide() {
  
    }
  
    getCollision(){
      return (manager.search.getFirstSolidColliderByType(this.collideWith, this.boundingBox) || this.room.tileMap.collision(this.boundingBox));
    }
  
  
    moveX(amount) {
      this.xRemainder += amount;
      var move = Math.round(this.xRemainder);
      if (move != 0) {
        this.xRemainder -= move;
        var dir = sign(move);
        while (move != 0) {
          this.boundingBox.x += dir;
          if (!this.getCollision()) {
            // There is no Solid immediately beside us
            this.x += dir;
            this.boundingBox.x = this.x;
            move -= dir;
          } else {
            // Hit a solid!
            this.boundingBox.x = this.x;
            this.onHCollide();
            break;
          }
        }
      }
    }
  
    moveY(amount) {
      this.yRemainder += amount;
      var move = Math.round(this.yRemainder);
      if (move != 0) {
        this.yRemainder -= move;
        var dir = sign(move);
        while (move != 0) {
          this.boundingBox.y += dir;
          if (!this.getCollision()) {
            // There is no Solid immediately beside us
            this.y += dir;
            this.boundingBox.y = this.y;
            move -= dir;
          } else {
            // Hit a solid!
            this.boundingBox.y = this.y;
            this.onVCollide();
            break;
          }
        }
      }
    }
  
    parameterStep(dt) {
  
  
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
  
      this.depth = -this.y;
  
      this.boundingBox.updatePos(this.x, this.y);
      this.clickBox.updatePos(this.x, this.y);
      this.ang += this.angSpd * dt;
  
      this.hacc = 0;
      this.vacc = 0;
    }
  
    updateActor(dt) {
      this.parameterStep(dt);
  
      this.moveX(this.hspd * dt);
      this.moveY(this.vspd * dt);
    }
  }
  
  
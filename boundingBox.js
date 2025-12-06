class BoundingBox {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
  
      this.xOffset = 0;
      this.yOffset = 0;
    }

    contains(x, y){
        return this.isPointInside(x, y);
    }

    intersects(otherBounding){
      if(!otherBounding) return false;
        return this.checkCollision(otherBounding);
    }

    getTop(){
      return this.y - this.yOffset;
    }

    getBottom(){
      return this.y - this.yOffset + this.height;
    }

    getLeft(){
      return this.x - this.xOffset;
    }

    getRight(){
      return this.x - this.xOffset + this.width;
    }

    getCenterX(){
      return this.x - this.xOffset + this.width*0.5;
    }

    getCenterY(){
      return this.y - this.yOffset + this.height*0.5;
    }

  
    checkCollision(otherBB) {
      if (this.x - this.xOffset < otherBB.x - otherBB.xOffset + otherBB.width &&
        this.x - this.xOffset + this.width > otherBB.x - otherBB.xOffset &&
        this.y - this.yOffset < otherBB.y - otherBB.yOffset + otherBB.height &&
        this.y - this.yOffset + this.height > otherBB.y - otherBB.yOffset) {
        return true;
      }
      return false;
    }
  
    isPointInside(x, y) {
      return pointInRect(x, y, this.x - this.xOffset, this.y - this.yOffset, this.x - this.xOffset + this.width, this.y - this.yOffset + this.height);
    }
  
    updatePos(x, y) {
      this.x = x;
      this.y = y;
    }
  
    setOffset(xOff, yOff) {
      this.xOffset = xOff;
      this.yOffset = yOff;
    }
  
    setOffsetRelative(xOffRelative, yOffRelative) {
      this.xOffset = this.width*xOffRelative;
      this.yOffset = this.height*yOffRelative;
    }
  
    show(col =  "rgb(255, 0, 0)") {
      // Draw the rectangle border
      ctx.strokeStyle = col;
      ctx.strokeRect(this.x - this.xOffset, this.y - this.yOffset, this.width, this.height);
    }

    draw(ctx){
      this.show();
    }

    drawExt(ctx, lineWid, color){
      ctx.lineWidth =lineWid;
      ctx.strokeStyle = color;
      ctx.strokeRect(this.x - this.xOffset, this.y - this.yOffset, this.width, this.height);
    }

    copy(xOff =0, yOff =0){
      var bb = new BoundingBox(this.x + xOff, this.y + yOff, this.width, this.height);
      bb.setOffset(this.xOffset, this.yOffset);
      return bb;
    }

    
  }
  
  
  class BoundingArea {
    constructor() {
      this.areas = [];

    }

    contains(x, y){
      return this.isPointInside(x, y);
    }

    intersects(otherBounding){
      if(!otherBounding) return false;
        return this.checkCollision(otherBounding);
    }

    // getTop(){
    //   return this.y - this.yOffset;
    // }

    // getBottom(){
    //   return this.y - this.yOffset + this.height;
    // }

    // getLeft(){
    //   return this.x - this.xOffset;
    // }

    // getRight(){
    //   return this.x - this.xOffset + this.width;
    // }


    checkCollision(otherBoundingBox) {
  
      if (otherBoundingBox instanceof BoundingArea) {
        for (var i = 0; i < otherBoundingBox.areas.length; i++) {
          var area = otherBoundingBox.areas[i];
          if (this.checkCollisionBoundingBox(area)) {
            return true;
          }
        }
      } else {
        if (this.checkCollisionBoundingBox(otherBoundingBox)) {
          return true;
        }
      }
      return false; // No collision
    }
  
    checkCollisionBoundingBox(otherBB) {
      for (var i = 0; i < this.areas.length; i++) {
        var area = this.areas[i];
  
        if (area.checkCollision(otherBB)) {
          return true;
        }
      }
      return false;
    }
  
    isPointInside(x, y) {
      for (var i = 0; i < this.areas.length; i++) {
        var area = this.areas[i];
        if (area.isPointInside(x, y)) {
          return true;
        }
      }
      return false;
    }
  
  }
  
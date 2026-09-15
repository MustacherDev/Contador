class BoundingBox {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
  
      this.originX = 0;
      this.originY = 0;
    }

    contains(x, y){
        return Area.pointInside(x, y, this.getLeft(), this.getTop(), this.width, this.height);
    }

    intersects(other){
      if(!other) return false;
      return Area.rectCollision(
         this.getLeft(),  this.getTop(),  this.width,  this.height,
        other.getLeft(), other.getTop(), other.width, other.height
      );
    }

    // Simulates if the box will colide with a determined offset
    placeMeeting(other, x = 0, y = 0){
      var xx = this.x;
      var yy = this.y;
      this.x += x;
      this.y += y;

      var result = this.intersects(other);
      this.x = xx;
      this.y = yy;
      return result;
    }

    getTop(){ return this.y - this.originY*this.height;}
    getBottom(){ return this.getTop() + this.height;}
    getLeft(){ return this.x - this.originX*this.width;}
    getRight(){ return this.getLeft() + this.width;}
    getCenterX(){ return this.getLeft() + this.width*0.5;}
    getCenterY(){ return this.getTop() + this.height*0.5;}

    setPosition(x, y) {
      this.x = x;
      this.y = y;
    }
  
    setOrigin(originX, originY) {
      this.originX = originX;
      this.originY = originY;
    }

    setSize(width, height){
      this.width = width;
      this.height = height;
    }
  }
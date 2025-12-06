class Holder {
    constructor() {
      this.holded = false;
      this.holdX = 0;
      this.holdY = 0;
      this.holdEvent = false;
      this.throwEvent = false;
    }
  
    getHold(obj) {
      if (obj.hovered && !this.holded && input.mouseState[0][1] && manager.holdingObject == null && obj.canBeHeld) {
        manager.holdingObject = obj;
  
        this.holded = true;
        this.holdEvent = true;
        this.holdX = manager.mouseX - obj.x;
        this.holdY = manager.mouseY - obj.y;
  
  
        obj.hspd = 0;
        obj.vspd = 0;
      }
    }
  
    update(obj) {
      if (this.holded) {
  
        var dx = -obj.x + (manager.mouseX - this.holdX);
        var dy = -obj.y + (manager.mouseY - this.holdY);
        obj.moveX(dx);
        obj.moveY(dy);
  
        if (!input.mouseState[0][0]) {
          this.holded = false;
          this.throwEvent = true;
  
          this.throw(obj);
        }
      }
    }
  
    throw(obj) {
      let totalXDiff = 0;
      let totalYDiff = 0;
  
      for (const mousePos of manager.prevMousePos) {
        totalXDiff += (obj.x + this.holdX) - mousePos.x;
        totalYDiff += (obj.y + this.holdY) - mousePos.y;
      }
  
      var throwForce = 1;
      obj.hspd = (totalXDiff / manager.prevMousePos.length) * throwForce;
      obj.vspd = (totalYDiff / manager.prevMousePos.length) * throwForce;
    }
  }
  
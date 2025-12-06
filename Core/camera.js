class Camera {
    constructor(x, y, scale, ang){
      this.x = x;
      this.y = y;
      this.xOff = 0;
      this.yOff = 0;
      // X AND Y THAT GET SET TO 0 EACH FRAME
      this.xAdd = 0;
      this.yAdd = 0;
  
      this.xAddTemp = 0;
      this.yAddTemp = 0;
  
      this.scale = scale;
      this.angle = ang;
      this.width = canvasWidth; // Actual Room space
      this.height = canvasHeight; // Actual Room space

      this.angleAdd = 0;
      this.angleAddTemp = 0;
  
      this.viewPortX = 0;
      this.viewPortY = 0;
      this.viewPortW = canvasWidth;
      this.viewPortH = canvasHeight;
  
      this.doesClipping = false;
      this.hasOverlay = false;
  
      this.frame = 0;
  
      this.hovered = false;
      this.holded = false;
      this.holdX = 0;
      this.holdY = 0;
      
    }
  
  
  
    worldPos(canvasX, canvasY){
      var dx = (canvasX);
      var dy = (canvasY);
    
      var vec = new Vector(dx, dy);
  
      vec.x -= + this.viewPortX + this.viewPortW/2;
      vec.y -= + this.viewPortY + this.viewPortH/2;
  
      vec.x /= this.scale;
      vec.y /= this.scale;
  
      vec.rotate(-this.angle);
  
      var ratX = this.viewPortW/this.width;
      var ratY = this.viewPortH/this.height;
  
      vec.x /= ratX;
      vec.y /= ratY;
  
      vec.x += this.x + this.xOff + this.xAdd;
      vec.y += this.y + this.yOff + this.yAdd;
  
      return vec; 
    }

    viewPos(worldX, worldY){
      var dx = (worldX);
      var dy = (worldY);

      dx -= this.x + this.xOff + this.xAdd;
      dy -= this.y + this.yOff + this.yAdd;

      var ratX = this.viewPortW/this.width;
      var ratY = this.viewPortH/this.height;

      dx *= ratX;
      dy *= ratY;
    
      var vec = new Vector(dx, dy);

      vec.rotate(this.angle);

      vec.x *= this.scale;
      vec.y *= this.scale;

      vec.x += + this.viewPortX + this.viewPortW/2;
      vec.y += + this.viewPortY + this.viewPortH/2;
  
      return vec; 
    }
  
    addPos(x, y){
      this.xAddTemp += x;
      this.yAddTemp += y;
    }

    addAng(ang){
      this.angleAddTemp += ang;
    }

    getWorldArea(){
      return new BoundingBox(this.x - (this.width/this.scale)*0.5, this.y - (this.height/this.scale)*0.5, this.width/this.scale, this.height/this.scale);
    }
  
    lateUpdate(dt){
      this.xAdd = this.xAddTemp;
      this.yAdd = this.yAddTemp;
      this.angleAdd = this.angleAddTemp;
      this.xAddTemp = 0;
      this.yAddTemp = 0;
      this.angleAddTemp = 0;
  
      this.frame += dt;
  
      this.hovered = false;
  
      // if(input.mouseViewX >= this.viewPortX && input.mouseViewX < this.viewPortX + this.viewPortW){
      //   if(input.mouseViewY >= this.viewPortY && input.mouseViewY < this.viewPortY + this.viewPortH){
      //     this.hovered = true;
      //   }
      // }
  
      // if(this.hovered && input.mouseState[0][1]){
      //   this.holded = true;
      //   this.holdX = input.mouseViewX - this.viewPortX;
      //   this.holdY = input.mouseViewY - this.viewPortY;
      // }
  
      // if(this.holded){
      //   this.viewPortX = input.mouseViewX - this.holdX;
      //   this.viewPortY = input.mouseViewY - this.holdY;
      //   if(!input.mouseState[0][0]){
      //     this.holded = false;
      //   }
      // }
    }
  
    applyTransform(ctx){
      ctx.translate(this.viewPortX + this.viewPortW/2, this.viewPortY + this.viewPortH/2);
      ctx.rotate(this.angle + this.angleAdd);
      ctx.scale(this.scale, this.scale);
      var ratX = this.viewPortW/this.width;
      var ratY = this.viewPortH/this.height;
      ctx.scale(ratX, ratY);
      ctx.translate(-this.x -this.xOff - this.xAdd, -this.y - this.yOff - this.yAdd);
      
    }
  
  
    clip(ctx){
      if(!this.doesClipping) return;
      ctx.beginPath();
      ctx.rect(this.viewPortX, this.viewPortY, this.viewPortW, this.viewPortH);
      ctx.closePath();
      ctx.clip();
    }
    camOverlay(ctx){
      if(!this.hasOverlay) return;

      ctx.save();

      ctx.translate(canvasOffsetX, canvasOffsetY);
      ctx.scale(canvasSclX, canvasSclY);
     
  
      var b = 8;
      ctx.strokeStyle = "rgb(255, 0, 0)";
      ctx.strokeRect(b + this.viewPortX, b + this.viewPortY, this.viewPortW - b*2, this.viewPortH - b*2);
      
      if((Math.floor(this.frame/10))%2 == 0){
        ctx.fillStyle = "rgb(255, 0, 0)";
        ctx.beginPath();
        ctx.arc(50 + this.viewPortX , 50 + this.viewPortY , 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }

      ctx.restore();
    }
  }
  
  var mainCam = new Camera(canvasWidth/2, canvasHeight/2, 1, 0);
  
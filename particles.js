
class Particle{
  constructor(x, y, life){
    this.x = x;
    this.y = y;
    this.depth = 0;

    this.origin = new Vector(this.x, this.y);

    this.lifeMax = this.life = life;

    this.angle = 0;
    this.angleSpd = 0;

    this.spd = new Vector(0, 0);
    this.acc = new Vector(0, 0);

    this.radAcc = 0;
    this.tanAcc = 0;

    this.damp = new Vector(0, 0);
    this.accDamp = new Vector(0, 0);


    this.active = true;
  }

  normalize(vec){
    var mag = Math.sqrt(vec.x*vec.x + vec.y*vec.y);
    if(mag == 0) return {x: 0, y: 0};
    return {x: vec.x/mag, y: vec.y/mag};
  }

  drawRequest(ctx, parameter){
    this.draw(ctx);
  }

  pushDraw() {
    manager.addDrawRequest(new DrawRequest(this, this.depth, 0), OBJECT.DRAW);
  }

  draw(ctx){
  }

  baseStep(dt){
    this.life -= dt;

    var radVec = this.normalize({x: this.x - this.origin.x, y: this.y - this.origin.y});
    var tanVec = {x: -radVec.y, y: radVec.x};

    this.spd.x += (this.acc.x + radVec.x*this.radAcc + tanVec.x*this.tanAcc)*dt;
    this.spd.y += (this.acc.y + radVec.y*this.radAcc + tanVec.y*this.tanAcc)*dt;

    this.spd.x *= Math.pow(1 - this.damp.x, dt);
    this.spd.y *= Math.pow(1 - this.damp.y, dt);

    this.acc.x *= Math.pow(1 - this.accDamp.x, dt);
    this.acc.y *= Math.pow(1 - this.accDamp.y, dt);

    this.x += this.spd.x*dt;
    this.y += this.spd.y*dt;

    this.angle += this.angleSpd*dt;
  }

  update(dt){

    if(this.life > 0){
      this.baseStep(dt);
    } else {
      this.active = false;
    }
  }
}

class ParticleShape extends Particle{
  constructor(x, y, life){
    super(x, y, life);
    
    this.color    = new Color(0,0,0);
    this.colorSpd = new Color(0,0,0,0);
  }

  shapeStep(dt){
    this.color.r += this.colorSpd.r*dt;
    this.color.g += this.colorSpd.g*dt;
    this.color.b += this.colorSpd.b*dt;
    this.color.a += this.colorSpd.a*dt;
  }

  update(dt){

    if(this.life > 0){
      this.baseStep(dt);
      this.shapeStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(ctx){
    
  }
}

class ParticleCircle extends ParticleShape{
  constructor(x, y, life){
    super(x, y, life);

    this.radius = 1;
    this.radiusSpd = 0;
  }

  ballStep(dt){
    this.shapeStep(dt);

    this.radius += this.radiusSpd*dt;
    this.radius = Math.max(0, this.radius);
  }

  update(dt){

    if(this.life > 0){
      this.baseStep(dt);
      this.ballStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(ctx){
    ctx.fillStyle = this.color.toCSS();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

class ParticleRect extends ParticleShape{
  constructor(x, y, life){
    super(x, y, life);

    this.width = 2;
    this.height = 2;

    this.extentSpd = new Vector(0, 0);
  }

  rectStep(dt){
    this.shapeStep(dt);

    this.width  += this.extentSpd.x*dt;
    this.height += this.extentSpd.y*dt;
  }

  update(dt){

    if(this.life > 0){
      this.baseStep(dt);
      this.rectStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(ctx){
    ctx.fillStyle = this.color.toCSS();
    ctx.fillRect(this.x- this.width/2, this.y - this.height/2, this.width, this.height);
  }
}

class ParticleRotateRect extends ParticleRect{
  constructor(x, y, life){
    super(x, y, life);
    this.xOff = 0.5;
    this.yOff = 0.5;

    this.alphaMode = 0;
  }

  draw(ctx){
    var ratio = clamp(this.life/this.lifeMax, 0, 1);
    var alpha = 1;
    if(this.alphaMode == 1){
      alpha = tweenIn(ratio);
    } else if (this.alphaMode == 2){
      alpha = tweenIn(1-Math.abs((ratio*2)-1));
    } else if (this.alphaMode == 3){
      alpha = tweenOut(ratio);
    }
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.color.toCSS();
    ctx.fillRect( -this.width*this.xOff, -this.height * this.yOff, this.width, this.height);
    ctx.restore();
  }
}








class ParticleText extends Particle{
  constructor(x, y, life, text, color){
    super(x, y, life);
    
    this.font = "Fixedsys";
    this.fontSize = 18;

    this.text = text;
    this.color = color;

    this.scl = 1;
    this.sclSpd = 0;

    this.alphaMode = 0;
  }

  textStep(dt){
  }

  draw(ctx) {

    ctx.font = this.fontSize + "px " + this.font;

    var ratio = clamp(this.life/this.lifeMax, 0, 1);

    var scl = this.scl;

    var alpha = 1;
    if(this.alphaMode == 1){
      alpha = tweenIn(ratio);
    } else if (this.alphaMode == 2){
      alpha = tweenIn(1-Math.abs((ratio*2)-1));
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scl, scl);
    ctx.fillStyle = "rgba(0,0,0,"+ alpha +")";
    ctx.fillText(this.text, 2, 2);
    ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }

  update(dt){
    if(this.life > 0){
      this.baseStep(dt);
      this.textStep(dt);
    } else {
      this.active = false;
    }
  }
}

class ParticleSprite extends Particle{
  constructor(x, y, life, sprite){
    super(x, y, life);
    
    this.scl = 1;
    this.sclSpd = 0;

    this.sprite = sprite;
    this.xOffset = 0;
    this.yOffset = 0;
    this.img = 0;
    this.imgSpd = 0;

    this.alpha = 1;
    this.alphaMode = 0;
  }

  spriteStep(dt){
    this.img += this.imgSpd*dt;
    this.scl += this.sclSpd*dt;

    var ratio = clamp(this.life/this.lifeMax, 0, 1);

    this.alpha = 1;
    if(this.alphaMode == 1){
      this.alpha = tweenIn(ratio);
    } else if (this.alphaMode == 2){
      this.alpha = tweenIn(1-Math.abs((ratio*2)-1));
    }
  }

  update(dt){
    if(this.life > 0){
      this.baseStep(dt);
      this.spriteStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(ctx){
    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = this.alpha;
    this.sprite.drawExt(this.x, this.y, Math.floor(this.img)%this.sprite.imgNum , this.scl, this.scl, this.angle, this.xOffset, this.yOffset);
    ctx.globalAlpha = alpha;
  }
}

class ParticleAnim extends Particle{
  constructor(x, y, life, animation){
    super(x, y, life);
    this.animation = animation;
    this.scl = 1;
    this.sclSpd = 0;
  }

  animationStep(dt){
    this.animation.update(dt);
    this.scl += this.sclSpd*dt;
  }

  update(dt){
    if(this.life > 0){
      this.baseStep(dt);
      this.animationStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(ctx){
    this.animation.draw(this.x, this.y, this.scl, this.scl, this.angle);
  }
}

function particleClick(x, y, scl = 5){
  var life = 5;
  var part = new ParticleAnim(x, y, life, new AnimationObjectClick());
  part.scl = scl;
  part.animation.stepSpd = 1/life;

  part.depth = -3000;

  return part;
}





function placesInRect(num, x, y, wid, hei, distributionType = 0){
  var list = [];



  for(var i = 0; i < num; i++){
    var percY = randRange(0, 1);
    var percX = randRange(0, 1);
    if(distributionType == 1){
      percX = (percX - 0.5)*2;
      percY = (percY - 0.5)*2;
      var sinal = sign(percX);
      percX = 0.5 + (sinal*percX*percX)/2;
      sinal = sign(percY);
      percY = 0.5 + (sinal*percY*percY)/2;
    } else if(distributionType == 2){
      percX = (percX - 0.5)*2;
      percY = (percY - 0.5)*2;
      var sinal = sign(percX);
      percX = 0.5 + (sinal*percX*percX)/2;
      sinal = sign(percY);
      percY = 0.5 + (sinal*percY*percY)/2;

      percX = 1- percX;
      percY = 1- percY;
    } else if(distributionType == 3){

      var perc = percX;
      percY = Math.sqrt(1-perc)/2;
      percX = Math.sqrt(perc)/2;

      var xSign = chance(0.5) ? 1 : -1;
      var ySign = chance(0.5) ? 1 : -1;

      percY *= ySign;
      percX *= xSign;

      percX += 0.5;
      percY += 0.5;
    } 
      list.push(new Vector(x + percX*wid, y + percY*hei));

  }
  return list;
}

function placesInArea(num, area, distributionType = 0){
  var x = area.getLeft();
  var y = area.getTop();
  var wid = area.width;
  var hei = area.height;
  return placesInRect(num, x, y, wid, hei, distributionType);
}





function createParticleWithPlaces(partCreateFunc, places){
  var partList = [];
  for(var i = 0; i < places.length; i++){
    partList.push(partCreateFunc(places[i].x, places[i].y));
  }

  return partList;
}

function createParticlesInRect(partCreateFunc, num, x, y, wid, hei){
  var places = placesInRect(num,x,y,wid,hei);
  return createParticleWithPlaces(partCreateFunc, places);
}


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

class ParticleCalatroText extends Particle{
 constructor(x, y, life, text, colorId){
    super(x, y, life);

    this.textCal = new CalatroText(0, 0, colorId, CCOLOR.SHADOW, 10000);
    this.textCal.page.options.align = 0.5;
    this.textCal.page.options.alignV = 0.25;
    this.textCal.setText("<36px Calatro>" + text);
  }

  textStep(dt){
    this.textCal.update(dt);
  }

  draw(ctx) {
    var ratio = clamp(this.life/this.lifeMax, 0, 1);

    var alpha = 1;


    if(this.alphaMode == 1){
      alpha = tweenIn(ratio);
    } else if (this.alphaMode == 2){
      alpha = tweenIn(1-Math.abs((ratio*2)-1));
    }

    var scl = (ratio < 0.3) ? ratio/0.3:1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.scale(scl, scl);
    ctx.rotate(this.angle);
    this.textCal.draw(ctx);
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


class ParticleCalatroLabelBox extends Particle{
  constructor(x, y, wid, hei, scl, xOff, yOff, color, colorBot, life, text, colorId){
    super(x, y, life);

    this.box = new CalatroLabelBox(0, 0, wid, hei, scl, xOff, yOff, color, colorBot);
    this.box.text.scaleIn = true; 
    this.box.text.shrinkIn = false;
    this.box.text.digitarChars = true;
    this.box.text.charSpd = 0.25;
    this.box.setText("<sclIn>"+text, colorId, CCOLOR.SHADOW);

    this.alphaMode = 1;
  }


  boxStep(dt){
    this.box.update(dt);
  }

  draw(ctx) {
    var ratio = clamp(this.life/this.lifeMax, 0, 1);

    var alpha = 1;


    alpha = tweenOut(ratio);
    //var scl = (ratio < 0.3) ? ratio/0.3:1;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    //ctx.scale(scl, scl);
    ctx.rotate(this.angle);
    this.box.draw(ctx);
    ctx.restore();
  }

  update(dt){
    if(this.life > 0){
      this.baseStep(dt);
      this.boxStep(dt);
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

class ParticleEmitter extends Particle{
  constructor(x, y, life, partFunc){
    super(x, y, life);

    this.partLife = 50;
    this.partFunc = partFunc;
    this.emitSpd = 0.2;
    this.emitTimer = 0;

    this.emitPattern = 0;

  }

  draw(ctx){

  }

  update(dt){
    if(this.life <= 0) {
      this.active = false;
      return;
    }

    this.life -= dt;
    this.emitTimer += this.emitSpd*dt;

    while(this.emitTimer > 0){
      var part = this.partFunc(this.x, this.y, this.partLife);
      manager.addParticle(part);
      this.emitTimer -= 1;
    }
  }
}


function particleBlackHole(x, y){
  var life = 50;


  var part = new ParticleCircle(x, y, life);
  var dir = randRange(0, Math.PI*2);
  var rad = 100;
  part.x = x + rad*Math.cos(dir);
  part.y = y + rad*Math.sin(dir);

  part.radius = randInt(5, 10);
  part.color = Color.fromHSL(0, 0, randInt(0, 100));
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;

  part.tanAcc = 0.03;
  part.radAcc = -0.1;

  var dir = randRange(0, deg2rad(360));
  var dirVec = new Vector(Math.cos(dir), Math.sin(dir));
  var spd = randRange(0.25, 2);

  part.spd = dirVec.mult(spd);
  part.acc = new Vector(0, 0);
  part.damp = new Vector(0.01, 0.01);
  part.depth = -10;

  return part;
}



function particleConfetti(x, y){
  var life = 200;
  var part = new ParticleCircle(x, y, life);
  part.radius = randInt(5, 10);
  part.color = Color.fromHSL(randRange(0, 360), 100, 50);
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;

  var dir = randRange(0, deg2rad(360));
  var dirVec = new Vector(Math.cos(dir), Math.sin(dir));
  var spd = randRange(1, 5);

  part.spd = dirVec.mult(spd);
  part.acc = new Vector(0, 0);
  part.damp = new Vector(0.01, 0.01);
  part.depth = -10;

  return part;
}


function particleCalatro(x, y, colorId){
  var life = 60;
  var part = new ParticleRotateRect(x, y, life);
  part.width = 2;
  part.height = part.width;

  part.color = CColors.getColor(colorId);
  part.colorSpd = new Color(0,0,0, -1/life);

  part.extentSpd = new Vector(40*part.width/life, 40*part.width/life); 

  part.angle = randRange(0,1) * Math.PI;
  part.angleSpd = randRange(-0.001, 0.001);

  part.acc = new Vector(0, 0);
  part.depth = -10;

  return part;
}

function particleCalatroDestroy(x, y){
  var life = 60;
  var part = new ParticleRotateRect(x, y, life);
  part.width = 20;
  part.height = part.width;

  part.color = CColors.getColor(CCOLOR.WHITE);
  part.colorSpd = new Color(0,0,0, -1/life);

  part.extentSpd = new Vector(-0.25*part.width/life, -0.25*part.width/life); 

  part.angle = randRange(0,1) * Math.PI;
  part.angleSpd = randRange(-0.001, 0.001);

  var spd = randRange(2, 4);
  var ang = randRange(0,2) * Math.PI;
  part.spd = new Vector(spd*Math.cos(ang), spd*Math.sin(ang));

  part.acc = new Vector(0, 0);
  part.depth = -10;

  return part;
}

function particleEmitterCalatroDestroy(x, y){
  var part = new ParticleEmitter(x, y, 35, particleCalatroDestroy);
  part.emitSpd = 0.5;
  
  return part;
}






function particleDirtSlide(x, y){
  var life = 100 + randInt(0, 50);
  var part = new ParticleRect(x, y, life);
  part.width = randInt(10, 25);
  part.height = part.width;

  var light = randInt(-20, 20);

  var red = 180;
  var blue = 90;
  var green = 125;

  var alpha = randRange(1, 1);

  part.color = new Color(light + red, light + green, light + blue, alpha);
  part.colorSpd = new Color(0,0,0, -alpha*0.5/life);

  part.extentSpd = new Vector(-0.75*part.width/life, -0.75*part.width/life); 

  

  var dir = randRange(0, deg2rad(75));

  facing = chance(0.5) == 0 ? 1 : -1; 
 
  if(facing == -1)    dir = deg2rad(180) - dir;
  
  var dirVec = new Vector(Math.cos(dir), Math.sin(dir));
  var spd = -randRange(4, 7);

  part.spd = dirVec.mult(spd);
  part.spd.y -= 0.5;
  part.spd.x *= 0.5;
  part.damp = new Vector(0.005, 0.005);

  part.acc = new Vector(0, 0.2);
  part.accDamp = new Vector(0, 0);

  part.depth = -10;


  return part;
}





function particleCalatroFire(x, y,scl, color,colorFade){
  var life = 50 + randInt(0, 50);

  var part = new ParticleRect(x, y, life);

  part.width = scl+2;
  part.height = part.width;

  part.alphaMode = 3;
  part.color = color.copy();
  part.colorSpd = colorFade.diff(color).mult(1/life);

  part.extentSpd = new Vector(-0.25*part.width/life, -0.25*part.width/life); 

  // var spd = randRange(0.5, 1);
  // var ang = randRange(0,2) * Math.PI;
  // part.spd = new Vector(spd*Math.cos(ang), spd*Math.sin(ang));

  var gravity = randRange(-0.018, -0.0075);
  part.acc = new Vector(0, gravity);
  part.depth = -10;

  return part;
}

function particleCalatroGains(x, y, color, spread = 50){
  var life = 50;


  var xOff = randRange(-spread, spread);
  var yOff = randRange(-spread, spread);
  var part = new ParticleRotateRect(x+xOff, y+yOff, life);
  part.width = randRange(10, 20);
  part.height = part.width;

  var hsl = color.toHSL();

  var off = randInt(-30, 0);
  hsl.s = clamp(hsl.s + off, 0, 100);
  hsl.l = clamp(hsl.l - off, 0, 100);
  
  part.alphaMode = 3;
  part.color = Color.fromHSL(hsl.h, hsl.s, hsl.l);
  //part.colorSpd = new Color(0,0,0, -1/life);

  part.extentSpd = new Vector(-0.25*part.width/life, -0.25*part.width/life); 

  part.angle = randRange(0,1) * Math.PI;
  part.angleSpd = randRange(-0.001, 0.001);

  var spd = randRange(0.5, 1);
  var ang = randRange(0,2) * Math.PI;
  part.spd = new Vector(spd*Math.cos(ang), spd*Math.sin(ang));

  part.acc = new Vector(0, 0);
  part.depth = -10;

  return part;
}


function particleCalatroLabelBox(x, y, wid, hei, scl, xOff, yOff, color, colorBot, text) {
  var life = 100;
  var part = new ParticleCalatroLabelBox(x, y,wid,hei, scl, xOff, yOff, color, colorBot, life, text, CCOLOR.WHITE);
  part.depth = -100;

  return part;
}

function calBox2Particle(calBox, color, colorBot, text){
  return particleCalatroLabelBox(calBox.x, calBox.y, calBox.wid, calBox.hei, calBox.scl, calBox.xOff, calBox.yOff, color, colorBot, text);
}

function particleCalatroText(x, y, text, colorId){
  var life = 60;
  var part = new ParticleCalatroText(x, y, life, text, colorId);

  part.angle = randRange(-1,1) * deg2rad(2)
  part.angleSpd = randRange(-0.001, 0.001);

  part.acc = new Vector(0, 0);
  part.depth = -100;

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

class RenderText {
    constructor(x, y, text) {
      this.x = x;
      this.y = y;
      this.angle = 0;
      this.xOff = 0;
      this.yOff = 0;
      this.xScl = 1;
      this.yScl = 1;
  
      this.text = text;
      this.lines = [];
      this.setText(text);
  
      this.font = "14px Arial";
      this.align = "left";
      this.baseline = "middle";
  
      this.lineSpace = 50;
  
      this.color = new Color(255, 255, 255);
  
      this.shadow = false;
      this.shadowXOff = 3;
      this.shadowYOff = 3;
      this.shadowColor = new Color(0, 0, 0);
  
      this.border = false;
      this.borderWidth = 1;
      this.borderColor = new Color(50, 50, 50);
    }
  
    setText(text) {
      this.text = text;
      this.lines = this.splitIntoLines(text);
    }
  
    splitIntoLines(text) {
      return text.split(/\r?\n/);
    }
  
    setScale(scale) {
      this.xScl = scale;
      this.yScl = scale;
    }
  
    getWid() {
      var font = ctx.font;
      ctx.font = this.font;
      var wid = 0;
      for (var line of this.lines) {
        wid = Math.max(ctx.measureText(line).width, wid);
      }
      ctx.font = font;
      return wid;
    }
  
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.xScl, this.yScl);
  
      ctx.font = this.font;
      ctx.textAlign = this.align;
      ctx.textBaseline = this.baseline;
  
      if (this.shadow) {
        ctx.fillStyle = this.shadowColor.toCSS();
  
        var lineY = 0;
        for (var line of this.lines) {
          ctx.fillText(line, -this.xOff + this.shadowXOff, -this.yOff + this.shadowYOff + lineY);
          lineY += this.lineSpace;
        }
  
      }
      ctx.fillStyle = this.color.toCSS();
      var lineY = 0;
      for (var line of this.lines) {
        ctx.fillText(line, -this.xOff, -this.yOff + lineY);
        lineY += this.lineSpace;
      }
  
  
      if (this.border) {
        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColor.toCSS();
        lineY = 0;
        for (var line of this.lines) {
          ctx.strokeText(line, -this.xOff, -this.yOff + lineY);
          lineY += this.lineSpace;
        }
  
      }
      ctx.restore();
    }
  }
  
  class RenderObject {
    constructor(x, y, sprite) {
      this.x = x;
      this.y = y;
      this.sprite = sprite;
      this.angle = 0;
      this.xOff = 0;
      this.yOff = 0;
      this.xScl = 1;
      this.yScl = 1;
      this.img = 0;
      this.imgSpd = 0;
    }
  
    getWid() {
      return this.sprite.width * this.xScl;
    }
  
    getHei() {
      return this.sprite.height * this.yScl;
    }

    getArea(){
      var box = new BoundingBox(this.x, this.y, this.getWid(), this.getHei());
      box.setOffset(this.xOff*this.xScl, this.yOff*this.yScl);
      return box;
    }
  
    setRelativeOffset(x, y) {
      this.xOff = this.sprite.width * x;
      this.yOff = this.sprite.height * y;
    }
  
    setScale(scale) {
      this.xScl = scale;
      this.yScl = scale;
    }
  
    scale2Contain(wid, hei) {
      var ratX = wid / this.sprite.width;
      var ratY = hei / this.sprite.height;
  
      var rat = Math.min(ratX, ratY);
      this.xScl = rat;
      this.yScl = rat;
    }
  
    scale2Overflow(wid, hei) {
      var ratX = wid / this.sprite.width;
      var ratY = hei / this.sprite.height;
  
      var rat = Math.max(ratX, ratY);
      this.xScl = rat;
      this.yScl = rat;
    }
  
    update(dt) {
      this.img += this.imgSpd * dt;
    }
  
    draw(ctx = ctx) {
      this.sprite.drawExt(this.x, this.y, Math.floor(this.img), this.xScl, this.yScl, this.angle, this.xOff, this.yOff, ctx);
    }
  }
  

  class NineSliceSprite {
    constructor(sprite, wid, hei, border) {
      this.x = 0;
      this.y = 0;
      this.width = wid;
      this.height = hei;
  
      this.border = border;
  
      this.sprite = sprite;
      this.scl = border / this.sprite.width;
  
    }
  
    draw(ctx) {
      var startX = this.x;
      var startY = this.y;
  
      var borWid = this.sprite.width * this.scl;
      var borHei = this.sprite.height * this.scl;
  
      var midWid = Math.max(this.width - borWid * 2, 0);
      var midHei = Math.max(this.height - borHei * 2, 0);
  
      var strechX = midWid / this.sprite.width;
      var strechY = midHei / this.sprite.height;
  
      this.sprite.drawExt(startX, startY, 0, this.scl, this.scl, 0, 0, 0);
      this.sprite.drawExt(startX + borWid, startY, 1, strechX, this.scl, 0, 0, 0);
      this.sprite.drawExt(startX + borWid + midWid, startY, 2, this.scl, this.scl, 0, 0, 0);
  
      this.sprite.drawExt(startX, startY + borHei, 3, this.scl, strechY, 0, 0, 0);
      this.sprite.drawExt(startX + borWid, startY + borHei, 4, strechX, strechY, 0, 0, 0);
      this.sprite.drawExt(startX + borWid + midWid, startY + borHei, 5, this.scl, strechY, 0, 0, 0);
  
      this.sprite.drawExt(startX, startY + borHei + midHei, 6, this.scl, this.scl, 0, 0, 0);
      this.sprite.drawExt(startX + borWid, startY + borHei + midHei, 7, strechX, this.scl, 0, 0, 0);
      this.sprite.drawExt(startX + borWid + midWid, startY + borHei + midHei, 8, this.scl, this.scl, 0, 0, 0);
    }
  }


 
  class ScreenBorder {
    constructor(sprite) {
      this.x = 0;
      this.y = 0;
      this.width = canvasWidth;
      this.height = canvasHeight;
  
      this.sprite = sprite;
  
      var scl = 4;
  
  
      var tryH = this.width / (this.sprite.width * scl);
      var tryV = this.height / (this.sprite.height * scl);
  
      this.hTileNum = clamp(Math.floor(tryH), 2, 16);
      this.vTileNum = clamp(Math.floor(tryV), 2, 16);
  
      this.tileWid = this.width / this.hTileNum;
      this.tileHei = this.height / this.vTileNum;
  
      this.xScl = this.tileWid / this.sprite.width;
      this.yScl = this.tileHei / this.sprite.height;
  
      this.emptyMiddle = true;
    }
  
    tileNumHelp = function (tile, tileMax, imgMin) {
      if (tile == 0) {
        return imgMin;
      } else if (tile == tileMax - 1) {
        return imgMin + 2;
      }
  
      return imgMin + 1;
    }
  
  
    tileNumHelpFull = function (tileX, tileY, tileXMax, tileYMax) {
      var img = 0;
      var rotation = 0;
      if (tileYMax == 1 && tileXMax == 1) {
        img = 12;
      } else if (tileXMax == 1) {
        rotation = Math.PI / 2;
        img = this.tileNumHelp(tileY, tileYMax, 9);
      } else if (tileYMax == 1) {
        img = this.tileNumHelp(tileX, tileXMax, 9);
      } else {
        if (tileY == 0) {
          img = this.tileNumHelp(tileX, tileXMax, 0);
        } else if (tileY == tileYMax - 1) {
          img = this.tileNumHelp(tileX, tileXMax, 6);
        } else {
          img = this.tileNumHelp(tileX, tileXMax, 3);
        }
      }
  
      return new Vector(img, rotation);
    }
    draw(ctx) {
  
      for (var i = 0; i < this.vTileNum; i++) {
  
        for (var j = 0; j < this.hTileNum; j++) {
          // if(this.emptyMiddle){
          //   if(j > 0 && j < this.hTileNum -1 && i != 0 && i != this.vTileNum-1) continue;
          // }
  
          var xx = this.x + j * this.tileWid;
          var yy = this.y + i * this.tileHei;
  
          var img = 0;
          var rotation = 0;
  
          var imgRot = this.tileNumHelpFull(j, i, this.hTileNum, this.vTileNum);
  
          rotation = imgRot.y;
          img = imgRot.x;
  
          if (img == 4 && this.emptyMiddle) continue;
  
  
          this.sprite.drawExt(xx + 32 * this.xScl, yy + 32 * this.yScl, img, this.xScl, this.yScl, rotation, 32, 32);
        }
      }
    }
  }

class SimpleButton{
  constructor(x, y, wid, hei){
    this.x = x;
    this.y = y;
    this.width = wid;
    this.height = hei;

    this.boundingBox = new BoundingBox(x, y, wid, hei);

    this.gui = false;

    this.hovered = false;
    this.pressed = false;
    this.clicked = false;

    this.modular = false;
  }
  

  setRelativeOffset(xOff, yOff){
    this.boundingBox.xOffset = this.boundingBox.width*xOff;
    this.boundingBox.yOffset = this.boundingBox.height*yOff;
  }

  hover(mouseX, mouseY){
    this.hovered = false;
    if(this.gui){
      if (this.boundingBox.contains(input.mouseViewX, input.mouseViewY)) {
        this.hovered = true;
      }
    } else {
      if (this.boundingBox.contains(mouseX, mouseY)) {
        this.hovered = true;
      }
    }
    return this.hovered;
  }

  click(){
    if(!this.hovered) return false;
    this.clicked = true;
    return true;
  }

  press(){
    if(!this.hovered) return false;
    this.pressed = true;
    return true;
  }

  update(dt) {
    this.boundingBox.x = this.x;
    this.boundingBox.y = this.y;

    if(!this.modular){
      this.hovered = false;
      this.pressed = false;
      this.clicked = false;


      this.hover(input.mouseX, input.mouseY);
      this.press();
      this.click();
    }

    if(this.modular){
      this.pressed = false;
      this.clicked = false;
    }
  }

  draw(ctx) {
    if(this.hovered){
      ctx.fillStyle = "rgb(80, 80, 80)";
    } else {
      ctx.fillStyle = "rgb(100, 100, 100)";
    }

    ctx.fillRect(this.boundingBox.getLeft(), this.boundingBox.getTop(), this.boundingBox.width, this.boundingBox.height);

  }
}

class TextButton extends SimpleButton {  
  constructor(x, y, wid, hei, text, font) {
    super(x, y, wid, hei);

    

    this.text = text;
    this.font = font;
  }
    draw(ctx){
      if(this.hovered){
        ctx.fillStyle = "rgb(80, 80, 80)";
      } else {
        ctx.fillStyle = "rgb(100, 100, 100)";
      }
  
      ctx.fillRect(this.boundingBox.getLeft(), this.boundingBox.getTop(), this.boundingBox.width, this.boundingBox.height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = this.font;
      ctx.fillStyle=  "rgb(0,0,0)";
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.lineWidth = 4;
      ctx.fillText(this.text, this.boundingBox.getLeft() + this.boundingBox.width/2,this.boundingBox.getTop() + this.boundingBox.height/2);
      ctx.strokeText(this.text, this.boundingBox.getLeft() + this.boundingBox.width/2,this.boundingBox.getTop() + this.boundingBox.height/2);
    }
}
  
class SpriteButton extends SimpleButton{
  constructor(x, y, wid, hei, sprite) {
    super(x, y, wid, hei);

    this.sprite = sprite;

    this.setRelativeOffset(0.5, 0.5);
    this.xSprOffset = this.sprite.width / 2;
    this.ySprOffset = this.sprite.height / 2;

    this.angle = 0;
    this.xScl = 1;
    this.yScl = 1;

    this.img = 0;

    this.scale2Overflow();
  }

  setSpriteBbox(sprX, sprY, sprWid, sprHei){
    this.boundingBox = new BoundingBox(this.x, this.y, sprWid*this.xScl, sprHei*this.yScl);
    this.boundingBox.setOffset((this.xSprOffset-sprX)*this.xScl, (this.ySprOffset-sprY)*this.yScl)
  }


  scale2Fit(extraSclX = 1, extraSclY = extraSclX) {
    this.xScl = extraSclX * this.width / this.sprite.width;
    this.yScl = extraSclY * this.height / this.sprite.height;
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
    var img = this.img;
    this.sprite.drawExt(this.x, this.y + 5*this.hovered, img, this.xScl, this.yScl, this.angle, this.xSprOffset, this.ySprOffset);
    //this.boundingBox.draw(ctx);
  }
}



class Spotlight {
  constructor() {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.width = 5000;
    this.height = 5000;

    this.screenWidth = canvasWidth + 2 * canvasOffsetX / canvasSclX;
    this.screenHeight = canvasHeight + 2 * canvasOffsetY / canvasSclY;

    this.sprite = sprites[SPR.SPOTHOLE];

    this.active = true;

    this.spd = 0;
  }

  update(dt) {

    this.screenWidth = canvasWidth + 2 * canvasOffsetX / canvasSclX;
    this.screenHeight = canvasHeight + 2 * canvasOffsetY / canvasSclY;

    if (!this.active) return;

    this.width -= this.spd * dt;
    this.height -= this.spd * dt;
  }

  draw(ctx) {

    if (!this.active) return;

    var border = 2;

    var scl = this.width / this.sprite.width;
    var offset = this.sprite.width / 2;

    var startX = -canvasOffsetX / canvasSclX;
    var startY = -canvasOffsetY / canvasSclY;

    var sprPos = new Vector(this.x - offset * scl, this.y - offset * scl);

    this.sprite.drawExt(this.x, this.y, 0, scl, scl, 0, offset, offset);
    ctx.fillStyle = "rgb(0,0,0)";

    //ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(startX - border, startY - border, this.screenWidth + border * 2, sprPos.y - startY + border * 2);
    //ctx.fillStyle = "rgb(0,255,0)";
    ctx.fillRect(sprPos.x + this.width - border, sprPos.y - border, this.screenWidth - (sprPos.x + this.width) + border * 2, this.height + border * 2);
    //ctx.fillStyle = "rgb(0,0,255)";
    ctx.fillRect(startX - border, sprPos.y - border, sprPos.x - startX + border * 2, this.height + border * 2);
    //ctx.fillStyle = "rgb(255,255,0)";
    ctx.fillRect(startX - border, sprPos.y + this.height - border, this.screenWidth + border * 2, this.screenHeight - (sprPos.y + this.height) + border * 2);

  }
}







class GUIElement {
  constructor(x, y, wid, hei){
    this.x = x;
    this.y = y;
    this.width = wid;
    this.height = hei;

    this.area = new BoundingBox(x, y, wid, hei);

    this.contextX = 0;
    this.contextY = 0;
    this.contextSclX = 1;
    this.contextSclY = 1;

    this.depth = 0;

    this.visible = true;

    this.children = [];
  }

  getX(){
    return this.x*this.contextSclX + this.contextX;
  }

  getY(){
    return this.y*this.contextSclY + this.contextY;
  }

  getWidth(){
    return this.width*this.contextSclX;
  }

  getHeight(){
    return this.height*this.contextSclY;
  }

  getArea(){
    this.area.x = this.getX();
    this.area.y = this.getY();
    this.area.width = this.getWidth();
    this.area.height = this.getHeight();

    return this.area;
  }

  addChild(child){
    this.children.push(child);
  }

  removeChild(child){
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        return true; // Value was removed successfully
      } else {
        return false; // Value not found in the array
      }
  }

  updateChildrenContext(){
    for(var child of this.children){
      child.contextX = this.getX();
      child.contextY = this.getY();
      child.contextSclX = this.contextSclX;
      child.contextSclY = this.contextSclY;
    }
  }

  update(dt){
    this.updateChildrenContext();
  }

  clickDetect(){
    if(!this.visible) return false;
    if(this.getArea().contains(input.mouseViewX, input.mouseViewY)){
      return true;
    }
    return false;
  }

  clickExecute(){

  }

  draw(ctx){

  }

}

class GUIButton extends GUIElement{
  constructor(x, y, wid, hei, button){
    super(x, y, wid, hei);
    this.button = button;
    this.button.gui = true;
  }


  update(dt){
    this.updateChildrenContext();
    this.button.x = this.getX();
    this.button.y = this.getY();

    if(!this.visible) return;
   
    this.button.update(dt);
  }

  clickExecute(){
    return true;
  }

  draw(ctx){
    if(!this.visible) return;
    this.button.draw(ctx);
  }
}

class GUIGrid extends GUIElement{
  constructor(x, y, slotSize, slotRows, slotCols){
    super(x, y, slotSize*slotCols, slotSize*slotRows);

    // SLOTS COULD BE SIMPLES INTS TO COMPLEX OBJECTS, THE GUIGRID JUST MANAGES TO DETECT IF IT IS HOVERED/ CLICKED
    // SO THAT WAY I THINK TO MYSELF IF THEY SHOULD NOT BE SIMPLY CHILDREN OF THE GUIGRID
    this.slots = [];
    this.slotSize = slotSize;
    this.rows = slotRows;
    this.cols = slotCols;

    this.hoveredSlot = new Vector(-1, -1);
  }

  addSlot(slot){
    this.slots.push(slot);
  }

  removeSlot(slot){
    const index = this.slots.indexOf(slot);
    if (index !== -1) {
      this.slots.splice(index, 1);
      return true; // Value was removed successfully
    } else {
      return false; // Value not found in the array
    }
  }

  ind2ji(ind){

    if(ind < 0) return new Vector(-1, -1);
    if(ind >= this.rows*this.cols) return new Vector(-1, -1);
    //if(ind >= this.slots.length) return new Vector(-1, -1);

    var j = ind%this.cols;
    var i = Math.floor(ind/this.cols);

    return new Vector(j, i);
  }

  ji2ind(j, i){
    if(j < 0) return -1;
    if(j >= this.cols) return -1;
    if(i < 0) return -1;
    if(i >= this.rows) return -1;
    return j+ i*this.cols;
  }


  pos2Slot(x, y){
    var dx = x -this.getX();
    var dy = y -this.getY();

    if(dx >= 0 && dx < this.cols*this.slotSize){
        var row = Math.floor(dx/this.slotSize);
        var col = Math.floor(dy/this.slotSize);

        // return this.ji2ind(col, row);


        if(col*this.cols+row >= this.cols*this.rows){
            return new Vector(-1, -1);
        }

        if(col*this.cols+row < 0){
            return new Vector(-1, -1);
        }

        return new Vector(row, col);
    }

    return new Vector(-1, -1);
  }

  slot2Pos(slotInd){
      var grid = this.ind2ji(slotInd);
      
      var xx = this.getX() + this.slotSize*grid.x;
      var yy = this.getY() + this.slotSize*grid.y;

      return new Vector(xx, yy);
  }
    

  update(dt){
    this.hoveredSlot = this.pos2Slot(input.mouseViewX, input.mouseViewY);
    this.updateChildrenContext();
  }
}


class GUIPanel{
  constructor(){
    this.elements = [];

    this.clickedElement = null;
  }

  addElement(element){
    this.elements.push(element);
  }

  removeElement(element){
    const index = this.elements.indexOf(element);
    if (index !== -1) {
      this.elements.splice(index, 1);
      return true; // Value was removed successfully
    } else {
      return false; // Value not found in the array
    }
  }

  update(dt){
    for(var element of this.elements){
      element.update(dt);
    }

    this.clickedElement = null;
  }

  draw(ctx){
    

    for(var element of this.elements){
      element.draw(ctx);
    }
  }
}


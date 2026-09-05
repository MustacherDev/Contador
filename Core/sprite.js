
// CONTAINS THE INFORMATION ABOUT WHERE IN THE IMAGE IS THE SPRITE
class SpriteMap{
  constructor(){
    // Puts Texture Areas(IntRects) into easily acessible vectors
    // All areas have to have the same width and height

    this.texture = null;
    this.corners = [];
    this.imgNumber = 0;
    this.width = 0;
    this.height = 0;
  }


    setTexture(texture){
        this.texture = texture;
    }

    setSize(wid, hei) {
        this.width = wid;
        this.height = hei;
    }

    getTexture() {
        return this.texture;
    }

    getImgNumber() {
        return this.imgNumber;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    smartIndex(index){
      if(this.imgNumber <= 0) return -1;

      var ind = index;

      if (ind < 0) {
        ind = (-ind) % (this.imgNumber + 1);
        ind = (this.imgNumber) - ind;
      } else if(ind >= this.imgNumber){
        ind = ind%this.imgNumber;
      }
      return ind;
      
    }

    getImage(index) {


        var ind = this.smartIndex(Math.floor(index));

        if(ind == -1) return null;
        return ({x:this.corners[ind].x, y:this.corners[ind].y, width: this.width, height: this.height});
    }

    clearImages() {
        this.corners = [];
    }

    setImage(imgX, imgY, imgWid, imgHei) {
        this.clearImages();
        this.setSize(imgWid, imgHei);
        this.addImage(imgX, imgY);
    }

    setImages(imgX, imgY, imgWid, imgHei, imgNumX, imgNumY, verticalCounting = false) {
        this.clearImages();
        this.setSize(imgWid, imgHei);
        this.addImages(imgX, imgY, imgNumX, imgNumY, verticalCounting);
    }

    addImage(imgX, imgY) {
        this.corners.push(new Vector(imgX, imgY));
        this.imgNumber++;
    }

    addImages(imgX, imgY, imgNumX, imgNumY, verticalCounting = false) {

        if (!verticalCounting) {
            for (var i = 0; i < imgNumY; i++) {
                for (var j = 0; j < imgNumX; j++) {
                    var xx = imgX + this.width * j;
                    var yy = imgY + this.height * i;
                    this.addImage(xx, yy);
                }
            }
        }
        else {
            for (var i = 0; i < imgNumX; i++) {
                for (var j = 0; j < imgNumY; j++) {
                    var xx = imgX + this.width * i;
                    var yy = imgY + this.height * j;
                    this.addImage(xx, yy);
                }
            }
        }
    }
}



// Sprite Source Definition
class Sprite {
  constructor(texture, wid, hei){
    this.texture = texture;

    this.width = wid;
    this.height = hei;

    this.spriteMap = new SpriteMap();
  }

  configure(){
    if(this.width == -1 || this.height == -1){
      console.log(this.texture, this.texture.image.naturalWidth);
      this.width = this.texture.image.naturalWidth;
      this.height = this.texture.image.naturalHeight;

      this.spriteMap.setImage(0, 0, this.width, this.height);
      return;
    }
  }

  getImgNum(){
    return this.spriteMap.corners.length;
  }


  drawExt(x, y, img, xscl, yscl, ang, sprOffsetX, sprOffsetY, context = ctx){

    var area = this.spriteMap.getImage(img);
    var imgX = area.x;
    var imgY = area.y;
    var imgWid = area.width;
    var imgHei = area.height;

    this.drawInternal(context, imgX, imgY, imgWid, imgHei, x, y, sprOffsetX, sprOffsetY, xscl, yscl, ang);
  }

  drawExtRelative(x, y, img, xscl, yscl, ang, sprOffsetXPercent, sprOffsetYPercent, context = ctx){

    var area = this.spriteMap.getImage(img);
    var imgX = area.x;
    var imgY = area.y;
    var imgWid = area.width;
    var imgHei = area.height;


    this.drawInternal(context, imgX, imgY, imgWid, imgHei, x, y, sprOffsetXPercent*this.width, sprOffsetYPercent*this.height, xscl, yscl, ang);
  }

  drawInternal(ctx, sourceImgX, sourceImgY, sourceImgWid, sourceImgHei, spriteX, spriteY, spriteOffsetX, spriteOffsetY, scaleX, scaleY, angle){
    // Source Img X and Y refers to the specific sprite in a spritesheet

    // The spriteOffset X and Y will be scaled with scale X and Y

    // Translations
    // Before scaling  : Base X and Y coords                (spriteX, spriteY)
    // Before rotating : I don't know why i would need this
    // Before drawing  : Sprite Rotation Center X, Y        (spriteOffsetX, spriteOffsetY)


    ctx.save();
    ctx.translate(spriteX, spriteY);
    ctx.scale(scaleX, scaleY);

    ctx.rotate(angle);

    ctx.drawImage(this.texture.image, sourceImgX, sourceImgY, sourceImgWid, sourceImgHei, -spriteOffsetX, -spriteOffsetY, this.width, this.height);

    ctx.restore();
  }
}

// A WRAPPER AROUND THE SPRITE CLASS
// SUPPORTS INDIVIDUAL AND PERSISTENT TRANSFORMATION VARIABLES
// LIGHT-WEIGHT AND CONVENIENT
class SpriteInstance {
  constructor(sprite, x = 0, y = 0, img = 0){
    this.sprite = sprite;

    // TRANSFORMATION
    this.transform = {
      x:x,
      y:y,
      img:img,
      alpha:1,
      xScl:1,
      yScl:1,
      ang:0,
      relXOff:0,
      relYOff:0
    }
  }

  // TRANSFORM METHODS
  setPosition(x, y){
    this.transform.x = x;
    this.transform.y = y;
  }

  setFrame(frame){
    this.transform.img = frame;
  }

  setRotation(ang){
    this.transform.ang = ang;
  }

  setScale(xScl, yScl = xScl){
    this.transform.xScl = xScl;
    this.transform.yScl = yScl;
  }

  setOrigin(originX, originY){
    this.transform.relXOff = originX;
    this.transform.relYOff = originY;
  }

  setAlpha(alpha){
    this.transform.alpha = alpha;
  }

  draw(ctx){
    var alpha = ctx.globalAlpha;

    ctx.globalAlpha = this.transform.alpha;

    this.sprite.drawExtRelative(
      this.transform.x,
      this.transform.y,
      this.transform.img,
      this.transform.xScl,
      this.transform.yScl,
      this.transform.ang,
      this.transform.relXOff,
      this.transform.relYOff,
      ctx
    );

    ctx.globalAlpha = alpha;
  }
}
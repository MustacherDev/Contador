
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

        var ind = this.smartIndex(index);

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



// Sprite OBJECT
class Sprite {
  constructor(texture, wid, hei, texWid, texHei){
    if (!(texture instanceof HTMLImageElement)) {
      throw new TypeError("img must be an instance of HTMLImageElement");
    }
    if (typeof wid !== 'number' || typeof hei !== 'number') {
      throw new TypeError("width and height must be numbers");
    }

    this.texture = texture;
    this.texWid = texWid;
    this.texHei = texHei;

    this.width = wid;
    this.height = hei;

    this.imgNumX = Math.floor(this.texWid / this.width);
    this.imgNumY = Math.floor(this.texHei / this.height);
    this.imgNum = this.imgNumX * this.imgNumY;

    this.spriteMap = new SpriteMap();
    this.spriteMap.setImage(0, 0, wid, hei);
  }

  setSubimg(imgWid, imgHei, numX, numY = 1, texX = 0, texY = 0){
    this.width = imgWid;
    this.height = imgHei;

    this.imgNumX = numX;
    this.imgNumY = numY;

    this.imgNum = numX*numY

    this.spriteMap = new SpriteMap();
    this.spriteMap.setImages(texX, texY, imgWid, imgHei, numX, numY, false);
  }

  setImage(imgX, imgY, imgWid, imgHei) {
    this.spriteMap.setImage(imgX, imgY, imgWid, imgHei);
  }

  setImages(imgX, imgY, imgWid, imgHei, imgNumX, imgNumY, verticalCounting = false) {
    this.spriteMap.setImages(imgX, imgY, imgWid, imgHei, imgNumX, imgNumY, verticalCounting);
  }

  addImage(imgX, imgY) {
    this.spriteMap.addImage(imgX, imgY);
  }

  addImages(imgX, imgY, imgNumX, imgNumY, verticalCounting = false) {
    this.spriteMap.addImages(imgX, imgY, imgNumX, imgNumY, verticalCounting);
  }


  drawExt(x, y, img, xscl, yscl, ang, sprOffsetX, sprOffsetY, context = ctx){
    // img = img%(this.imgNumX*this.imgNumY);
    // var imgx = img % this.imgNumX;
    // var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;

    var area = this.spriteMap.getImage(img);
    var imgX = area.x;
    var imgY = area.y;
    var imgWid = area.width;
    var imgHei = area.height;

    this.drawInternal(context, imgX, imgY, imgWid, imgHei, x, y, sprOffsetX, sprOffsetY, xscl, yscl, ang);
  }

  drawExtRelative(x, y, img, xscl, yscl, ang, sprOffsetXPercent, sprOffsetYPercent, context = ctx){
    // img = img%(this.imgNumX*this.imgNumY);
    // var imgx = img % this.imgNumX;
    // var imgy = Math.floor(img / this.imgNumX) % this.imgNumY;

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

    ctx.drawImage(this.texture, sourceImgX, sourceImgY, sourceImgWid, sourceImgHei, -spriteOffsetX, -spriteOffsetY, this.width, this.height);

    ctx.restore();
  }
}



function createSprite(img){
    return new Sprite(img, img.naturalWidth, img.naturalHeight, img.naturalWidth, img.naturalHeight);
}

function createSpriteExt(img, wid, hei){
  return new Sprite(img, wid, hei, img.naturalWidth, img.naturalHeight);
}

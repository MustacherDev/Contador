class ObjTile extends Box {
    constructor(x, y, xSize, ySize, sprite) {
      super(x, y, xSize, ySize, sprite);
      this.type = OBJECT.TILE;
      this.img = 0;
  
      this.tags.push(OBJTAG.TILE);
  
      this.sideConnect = true;
  
      // RIGHT, DOWN, LEFT, UP
      this.sides = [false, false, false, false];
  
      this.gravityOn = false;
      this.canBeHeld = false;
      this.roomLimitsActive = [false, false, false, false];
    }
  
    draw(ctx) {
      this.sprite.drawExt(this.x, this.y, this.img, this.xScl, this.yScl, 0, this.xSprOffset, this.ySprOffset);
  
      if (manager.editor.editing) {
        this.boundingBox.draw(ctx);
      }
    }
  
    tileImg(right, down, left, up) {
      var imgX = 3;
      if (left && right) {
        imgX = 1;
      } else if (left) {
        imgX = 2;
      } else if (right) {
        imgX = 0;
      }
  
      var imgY = 3;
      if (up && down) {
        imgY = 1;
      } else if (up) {
        imgY = 2;
      } else if (down) {
        imgY = 0;
      }
  
      return imgX + 4 * imgY;
    }
  
  
  
    onRoomEnter() {
      if (this.sideConnect) {
        this.updateSides();
        this.sendSideUpdates();
      }
    }
  
    onDestroy() {
      if (this.sideConnect) {
        this.sendSideUpdates();
      }
    }
  
  
  
    updateSides() {
  
        if(!this.room) {
            console.log("OBJTILE: METHOD CALLED WITH NULL ROOM");
            return;
        } 

        if(!this.room.tileMap){
            console.log("COULDN'T FIND A VALID TILEMAP");
            return;
        }
    
        var tileMan = this.room.tileMap;

  
  
      var grid = tileMan.xy2tile(this.x, this.y);
  
      var l = tileMan.tile2xyMid(grid.x - 1, grid.y);
      var r = tileMan.tile2xyMid(grid.x + 1, grid.y);
      var u = tileMan.tile2xyMid(grid.x, grid.y - 1);
      var d = tileMan.tile2xyMid(grid.x, grid.y + 1);
  
      var wid = tileMan.tileSize;
      var hei = tileMan.tileSize;
  
      var search = manager.search;
  
      if (search.getCollisionRectByType([this.type], r.x - wid / 2, r.y - hei / 2, wid, hei, this.room)) {
        this.sides[0] = true;
      } else {
        this.sides[0] = false;
      }
  
      if (search.getCollisionRectByType([this.type], u.x - wid / 2, u.y - hei / 2, wid, hei, this.room)) {
        this.sides[3] = true;
      } else {
        this.sides[3] = false;
      }
  
      if (search.getCollisionRectByType([this.type], d.x - wid / 2, d.y - hei / 2, wid, hei, this.room)) {
        this.sides[1] = true;
      } else {
        this.sides[1] = false;
      }
  
      if (search.getCollisionRectByType([this.type], l.x - wid / 2, l.y - hei / 2, wid, hei, this.room)) {
        this.sides[2] = true;
      } else {
        this.sides[2] = false;
      }
  
      this.img = this.tileImg(this.sides[0], this.sides[1], this.sides[2], this.sides[3]);
    }
  
    sendSideUpdates() {
  
      if(!this.room) {
        console.log("OBJTILE: METHOD CALLED WITH NULL ROOM");
        return;
      } 

      if(!this.room.tileMap){
        console.log("COULDN'T FIND A VALID TILEMAP");
        return;
      }
  
      var tileMan = this.room.tileMap;
  
      var grid = tileMan.xy2tile(this.x, this.y);
  
      var l = tileMan.tile2xyMid(grid.x - 1, grid.y);
      var r = tileMan.tile2xyMid(grid.x + 1, grid.y);
      var u = tileMan.tile2xyMid(grid.x, grid.y - 1);
      var d = tileMan.tile2xyMid(grid.x, grid.y + 1);
  
      var wid = tileMan.tileSize - 10;
      var hei = tileMan.tileSize - 10;
  
      var search = manager.search;
  
      var sideObj = search.getCollisionRectByType([this.type], r.x - wid / 2, r.y - hei / 2, wid, hei, this.room);
      if (sideObj) {
        sideObj.updateSides();
      }
  
      sideObj = search.getCollisionRectByType([this.type], u.x - wid / 2, u.y - hei / 2, wid, hei, this.room);
      if (sideObj) {
        sideObj.updateSides();
      }
  
      sideObj = search.getCollisionRectByType([this.type], d.x - wid / 2, d.y - hei / 2, wid, hei, this.room);
      if (sideObj) {
        sideObj.updateSides();
      }
  
      sideObj = search.getCollisionRectByType([this.type], l.x - wid / 2, l.y - hei / 2, wid, hei, this.room);
      if (sideObj) {
        sideObj.updateSides();
      }
    }
  
  
    interact() {
  
    }
  }
  

  class WoodSemiSolid extends ObjTile{
    constructor(x, y, size = 50){
      super(x, y, size, size, sprites[SPR.XAROP]);
      this.type = OBJECT.WOODSEMISOLID;
      this.scale2FitSprite(1, 1);
      this.setGeneralOffsetRelative(0.5, 0.5);
      this.setSpriteOffsetRelative(0.5, 0.5);
      
    }
  }  

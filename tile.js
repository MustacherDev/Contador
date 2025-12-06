
const SIDE = Object.freeze(new Enum(
    "LEFT",
    "LEFTUP",
    "UP",
    "RIGHTUP",
    "RIGHT",
    "RIGHTDOWN",
    "DOWN",
    "LEFTDOWN",
    "TOTAL"
));

class BlobTileInfo{
    constructor(){

        this.imgId = [];
        this.imgNeighbour = [];
        for(var i = 0; i < 48; i++){
            this.imgId.push(-1);
            this.imgNeighbour.push([false, false, false, false, false, false, false]); 
        }

   


        
        for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                var tileSide = [false, false, false, false, false, false, false, false];

                if(i < 2){
                    tileSide[SIDE.DOWN] = true;
                }
    
                if((i+1)%4 >= 2){
                    tileSide[SIDE.UP] = true;
                }


                if(j < 2){
                    tileSide[SIDE.RIGHT]= true;
                }
    
                if((j+1)%4 >= 2){
                    tileSide[SIDE.LEFT] = true;
                }

                if(j < 3 && i < 3){
                    if(i-1 >= 0){
                        if(j-1 >= 0){
                            tileSide[SIDE.LEFTUP] = true;
                        }
                        if(j+1 < 3){
                            tileSide[SIDE.RIGHTUP] = true;
                        }
                    }

                    if(i+1 < 3){
                        if(j-1 >= 0){
                            tileSide[SIDE.LEFTDOWN] = true;
                        }
                        if(j+1 < 3){
                            
                            tileSide[SIDE.RIGHTDOWN] = true;
                        }
                    }
                }

                var val = 0;
                for(var k = 0; k < 8; k++){
                    // if(tileSide[k]){
                    //     val += Math.pow(2, k);
                    // }
                    this.imgNeighbour[(i * 12) + j][k] = tileSide[k];
                }
                
                this.imgId[(i * 12) + j] = val;
            }
        }

        for(var i = 0; i < 4; i++){
          

            for(var j = 0; j < 4; j++){
                var side = [true, true, true, true, true, true, true, true];


                if(i-1 < 0){
                    side[SIDE.UP] = false;
                }

                if(i+1 >= 4){
                    side[SIDE.DOWN] = false;
                }

                if(j-1 < 0){
                    side[SIDE.LEFT] = false;
                }

                if(j+1 >= 4){
                    side[SIDE.RIGHT] = false;
                }


  
                if(i-1 >= 0){
                    if(j-1 >= 0){
                        side[SIDE.LEFTUP] = true;
                    }
                    if(j+1 < 4){
                        side[SIDE.RIGHTUP] = true;
                    }
                }

                if(i+1 < 4){
                    if(j-1 >= 0){
                        side[SIDE.LEFTDOWN] = true;
                    }
                    if(j+1 < 4){
                        side[SIDE.RIGHTDOWN] = true;
                    }
                }
                
                side[SIDE.LEFTUP] = true && (side[SIDE.LEFT] && side[SIDE.UP]);
                side[SIDE.LEFTDOWN] = true && (side[SIDE.LEFT] && side[SIDE.DOWN]);
                side[SIDE.RIGHTUP] = true && (side[SIDE.RIGHT] && side[SIDE.UP]);
                side[SIDE.RIGHTDOWN] = true && (side[SIDE.RIGHT] && side[SIDE.DOWN]);
                
                var jj = j%2;
                var ii = i%2;

                if(jj == 1 && ii == 1){
                    side[SIDE.LEFTUP]  =false;
                } else if(jj == 1 && ii == 0){
                    side[SIDE.LEFTDOWN] = false;
                } else if(jj == 0 && ii == 1){
                    side[SIDE.RIGHTUP] = false;
                } else if (jj == 0 && ii == 0){
                    side[SIDE.RIGHTDOWN] = false;
                }

                var val = 0;
                for(var k = 0; k < 8; k++){
                    // if(side[k]){
                    //     val += Math.pow(2, k);
                    // }
                    this.imgNeighbour[(i * 12) + j + 4][k] = side[k];
                }

                this.imgId[(i * 12) + j + 4] = val;
            }
        }

        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                var side = [false, false, false, false, false, false, false, false];
                var otherSide = this.imgNeighbour[i*12 + j];
                side[SIDE.UP] = otherSide[SIDE.UP];
                side[SIDE.DOWN] = otherSide[SIDE.DOWN];
                side[SIDE.LEFT] = otherSide[SIDE.LEFT];
                side[SIDE.RIGHT] = otherSide[SIDE.RIGHT];


                if(i == 0 && j == 0){
                    side[SIDE.LEFT] = true;
                    side[SIDE.UP] = true;
                    side[SIDE.LEFTUP] = true;
                }

                if(i == 2 && j == 0){
                    side[SIDE.LEFT] = true;
                    side[SIDE.DOWN] = true;
                    side[SIDE.LEFTDOWN] = true;
                }

                if(i == 0 && j == 2){
                    side[SIDE.RIGHT] = true;
                    side[SIDE.UP] = true;
                    side[SIDE.RIGHTUP] = true;
                }

                if(i == 2 && j == 2){
                    side[SIDE.RIGHT] = true;
                    side[SIDE.DOWN] = true;
                    side[SIDE.RIGHTDOWN] = true;
                }


                var val = 0;
                for(var k = 0; k < 8; k++){
                    // if(side[k]){
                    //     val += Math.pow(2, k);
                    // }
                    this.imgNeighbour[(i * 12) + j + 8][k] = side[k];
                }
                
                this.imgId[(i * 12) + j+ 8] = val;
            }
        }

        this.imgNeighbour[3*12 + 8] = [true, true, true, false, true, false, true, true];
        this.imgNeighbour[3*12 + 9] = [true, false, true, true, true, true, true, false];
        this.imgNeighbour[3*12 + 10] = [true, true, true, false, true, true, true, false];

        this.imgNeighbour[0*12 + 11] = [true, true, true, true, true, false, true, false];
        this.imgNeighbour[1*12 + 11] = [true, false, true, false, true, true, true, true];
        this.imgNeighbour[2*12 + 11] = [true, false, true, true, true, false, true, true];

        for(var i = 0; i < this.imgId.length-1 ;i++){
            var side = this.imgNeighbour[i];
            var val = 0;
            for(var k = 0; k < 8; k++){
                if(side[k]){
                    val += Math.pow(2, k);
                }
            }
            this.imgId[i] = val;
        }


        this.id2imgTable = [];

        for(var i= 0; i < 256;i++){
            this.id2imgTable.push(-1);
        } 
        for(var i = 0; i < this.imgId.length-1 ;i++){
            this.id2imgTable[this.imgId[i]] = i;
        }

        this.sideCoords = [
            [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]
        ];

    }
}


var blobInfo = new BlobTileInfo();

class Tile {
    constructor(type, sprite, x, y, scl) {
        this.sprite = sprite;
        this.type = type;

        this.img = 0;
        this.imgSpd = 0;
        this.solid = true;
        this.depth = 1000;

        this.xOffset = 0;
        this.yOffset = 0;

        this.layer = TILELAYER.MID;

        this.sides = [false, false, false, false];
        this.corners = [false, false, false, false];
        this.neighbours = [-1, -1, -1, -1, -1, -1, -1, -1];
        this.frame = 0;
        this.autoTileType = 1;

        this.animated = false;
        this.animatedImgs = 0;
        this.animatedImgSpd = 0;
        this.animatedOffset = 0;


        this.x = x;
        this.y = y;
        this.xScl = scl;
        this.yScl = scl;

        this.variation = 0;
        this.variationNum = 1;
    }

    updateVariation(variation) {

    }
    nextVariation() {
        this.updateVariation((this.variation + 1) % (this.variationNum));
    }

    autoTile1() {
        var left = (this.neighbours[SIDE.LEFT] == this.type);
        var up = (this.neighbours[SIDE.UP] == this.type);
        var right = (this.neighbours[SIDE.RIGHT] == this.type);
        var down = (this.neighbours[SIDE.DOWN] == this.type);
        
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

    autoTile2() {
        var val = 0;
        for(var k = 0; k < 8; k++){
          

            if(this.neighbours[k] == this.type){
                if(k % 2 == 1){
                    if(this.neighbours[(k+7)%8] == this.type && this.neighbours[(k+1)%8] == this.type){
                        val += Math.pow(2, k);
                    }
                } else {
                    val += Math.pow(2, k);
                }
            }
        }

        var img =  blobInfo.id2imgTable[val];
        

        if(img != -1){
            return img;
        }
        //console.log("IMG == -1");
        return 39;
    }

   
    update(dt) {

    }

    contactUpdate() {

        switch(this.autoTileType){
            case 1:
                this.img = this.autoTile1();
                break;
            case 2:
                this.img = this.autoTile2();
                break;
        }
    }

    draw(ctx) {
        var alpha = ctx.globalAlpha;
        ctx.globalAlpha = manager.tileViewTransparency[this.layer];
        var img = this.img;
        if(this.animated){
            img += this.animatedOffset*((Math.floor(this.frame*this.animatedImgSpd))%this.animatedImgs);
        }
        this.sprite.drawExt(this.x, this.y, img, this.xScl, this.yScl, 0, this.xOffset, this.yOffset);
        ctx.globalAlpha = alpha;
    }

    pushDraw() {
        manager.addDrawRequest(new DrawRequest(this, this.depth, 0));
    }

    drawRequest(ctx, parameter) {
        this.draw(ctx);
    }

}

class TileInfo {
    constructor(spriteInd, xScl, yScl) {
        this.spriteInd = spriteInd;
        this.xScl = xScl;
        this.yScl = yScl;
        this.solid = true;
        this.autoTileType = 1;
        this.animated = false;
        this.animatedImgSpd = 0;
        this.animatedImgs = 0;
        this.animatedOffset = 0;
    }
}


const TILE = Object.freeze(new Enum(
    "GROUND",
    "TOTAL"
));

const TILELAYER = Object.freeze(new Enum(
    "BACK",
    "MID",
    "FRONT",
    "TOTAL"
));

class TileManager {
    constructor(x, y, tileNumX, tileNumY, tileSize) {
        this.tileSize = tileSize;
        this.tilesX = tileNumX;
        this.tilesY = tileNumY;


        this.tileSprites = [
            SPR.GROUND,
        ];

        this.tileInfo = [];

        // SETTING UP THE TILE INFO
        for (var i = 0; i < TILE.TOTAL; i++) {
            this.tileInfo.push(new TileInfo(this.tileSprites[i], 1, 1));
        }

        // /// IN THE FUTURE I MAY GET CONFUSED TO WHY THE TILES ARE GETTING BIG
        // for(var i = TILE.REVENTURESTONE; i < TILE.TOTAL; i++){
        //     this.tileInfo.xScl = 2;
        //     this.tileInfo.yScl = 2;
        // }


        this.tiles = [];
        this.tileLayers = TILELAYER.TOTAL;

        for (var k = 0; k < TILELAYER.TOTAL; k++) {
            var layerArr = [];
            for (var i = 0; i < this.tilesY; i++) {
                var rowArr = [];
                for (var j = 0; j < this.tilesX; j++) {
                    rowArr.push(null);
                }
                layerArr.push(rowArr);
            }
            this.tiles.push(layerArr);
        }

        this.x = x;
        this.y = y;

        this.frame = 0;
    }



    shiftRows(amount = 1) {

        var modAmount = smartIndex(amount, this.tilesX);



        for (var k = 0; k < TILELAYER.TOTAL; k++) {
            for (var i = 0; i < this.tilesY; i++) {
                // SEEMS QUITE INEFFICIENT
                for (var w = 0; w < modAmount; w++) {
                    var tile = this.tiles[k][i].shift();
                    this.tiles[k][i].push(tile);
                }
            }
        }

        for (var k = 0; k < TILELAYER.TOTAL; k++) {
            for (var i = 0; i < this.tilesY; i++) {
                for (var j = 0; j < this.tilesX; j++) {
                    var tile = this.tiles[k][i][j];
                    if (!tile) continue;
                    var newPos = this.tile2xy(j, i);
                    tile.x = newPos.x;
                    tile.y = newPos.y;
                    this.updateNeighbours(k, j, i);
                }
            }
        }
    }

    shiftCols(amount = 1) {
        var modAmount = smartIndex(amount, this.tilesY);
        for (var k = 0; k < TILELAYER.TOTAL; k++) {
            // SEEMS QUITE INEFFICIENT
            for (var w = 0; w < modAmount; w++) {
                var tileRow = this.tiles[k].shift();
                this.tiles[k].push(tileRow);
            }
        }

        for (var k = 0; k < TILELAYER.TOTAL; k++) {
            for (var i = 0; i < this.tilesY; i++) {
                for (var j = 0; j < this.tilesX; j++) {
                    var tile = this.tiles[k][i][j];
                    if (!tile) continue;
                    var newPos = this.tile2xy(j, i);
                    tile.x = newPos.x;
                    tile.y = newPos.y;
                    this.updateNeighbours(k, j, i);
                }
            }
        }
    }


    update(dt) {
        this.frame+=dt;
    }

    pushDraw(area) {
        var gridStart = this.xy2tile(area.getLeft(), area.getTop());
        gridStart.x = clamp(gridStart.x, 0, this.tilesX - 1);
        gridStart.y = clamp(gridStart.y, 0, this.tilesY - 1);

        var gridEnd = this.xy2tile(area.getRight(), area.getBottom());
        gridEnd.x = clamp(gridEnd.x + 1, 0, this.tilesX);
        gridEnd.y = clamp(gridEnd.y + 1, 0, this.tilesY);

        for (var k = 0; k < TILELAYER.TOTAL; k++) {
            for (var i = gridStart.y; i < gridEnd.y; i++) {
                for (var j = gridStart.x; j < gridEnd.x; j++) {
                    const tile = this.tiles[k][i][j];
                    
                    if (tile) {
                        tile.frame = this.frame;
                        tile.pushDraw();
                    }
                }
            }
        }
    }

    tile2xy(tileX, tileY) {
        return new Vector(this.x + tileX * this.tileSize, this.y + tileY * this.tileSize);
    }

    tile2xyMid(tileX, tileY) {
        var vec = this.tile2xy(tileX, tileY);
        vec.x += this.tileSize / 2;
        vec.y += this.tileSize / 2;
        return vec;
    }

    xy2tile(x, y) {
        var dx = Math.floor((x - this.x) / this.tileSize);
        var dy = Math.floor((y - this.y) / this.tileSize);
        return new Vector(dx, dy);
    }

    isTileValid(tileX, tileY) {
        if (tileX < 0 || tileX >= this.tilesX) return false;
        if (tileY < 0 || tileY >= this.tilesY) return false;
        return true;
    }

    createTile(tileType) {
        var spr = sprites[this.tileInfo[tileType].spriteInd];
        var tile = new Tile(tileType, spr, 0, 0, this.tileSize / spr.width);
        tile.xScl *= this.tileInfo[tileType].xScl;
        tile.yScl *= this.tileInfo[tileType].yScl;
        tile.solid = this.tileInfo[tileType].solid;
        tile.autoTileType = this.tileInfo[tileType].autoTileType;
        tile.animated = this.tileInfo[tileType].animated;

        tile.animatedImgs = this.tileInfo[tileType].animatedImgs;
        tile.animatedImgSpd = this.tileInfo[tileType].animatedImgSpd;
        tile.animatedOffset = this.tileInfo[tileType].animatedOffset;


        return tile;
    }

    addTile(tileType, tileLayer, tileX, tileY) {
        if (!this.isTileValid(tileX, tileY)) return;

        var pos = this.tile2xy(tileX, tileY);
        var x = pos.x;
        var y = pos.y;
        var tile = this.createTile(tileType);
        tile.x = x;
        tile.y = y;

        this.setTile(tile, tileLayer, tileX, tileY)
    }

    getNeighbours(tileLayer, tileX, tileY){
        if (!this.isTileValid()) return;

        var grid = new Vector(tileX, tileY);

        var tile = this.getTile(tileLayer, tileX, tileY);

        var sides = [];
        for(var i = 0; i < SIDE.TOTAL; i++){
            var xx = blobInfo.sideCoords[i][0];
            var yy = blobInfo.sideCoords[i][1];
            var oSid = this.getTile(tileLayer, grid.x + xx, grid.y + yy);
            sides.push(oSid);
        }

        return sides;
    }

    updateNeighbours(tileLayer, tileX, tileY) {
        if (!this.isTileValid()) return;

        var grid = new Vector(tileX, tileY);

        var tile = this.getTile(tileLayer, tileX, tileY);

        // var left = this.getTile(tileLayer, grid.x - 1, grid.y);
        // var right = this.getTile(tileLayer, grid.x + 1, grid.y);
        // var up = this.getTile(tileLayer, grid.x, grid.y - 1);
        // var down = this.getTile(tileLayer, grid.x, grid.y + 1);
        // var leftup = this.getTile(tileLayer, grid.x - 1, grid.y-1);
        // var rightdown = this.getTile(tileLayer, grid.x + 1, grid.y+1);
        // var rightup = this.getTile(tileLayer, grid.x+1, grid.y - 1);
        // var leftdown = this.getTile(tileLayer, grid.x-1, grid.y + 1);

        // var sides = [right, down, left, up];

        var sides = [];
        for(var i = 0; i < SIDE.TOTAL; i++){
            var xx = blobInfo.sideCoords[i][0];
            var yy = blobInfo.sideCoords[i][1];
            var oSid = this.getTile(tileLayer, grid.x + xx, grid.y + yy);
            sides.push(oSid);
            //console.log(SIDE.getName(i) +": "+oSid);
        }

        for(var i = 0; i < SIDE.TOTAL; i++){
            var side = sides[i];
            if (tile) {
                if (side) {
                    //var connect = (side.type == tile.type) ? true : false;
                    side.neighbours[(i + 4) % 8] = tile.type;
                    tile.neighbours[i] = side.type;
                    side.contactUpdate();
                    tile.contactUpdate();
                } else {
                    tile.neighbours[i] = -1;
                    tile.contactUpdate();
                }
            } else {
                if (side) {
                    side.neighbours[(i + 4) % 8] = -1;
                    side.contactUpdate();
                }
            }
        }
    }

    getTile(tileLayer, tileX, tileY) {
        if (!this.isTileValid(tileX, tileY)) return null;
        return this.tiles[tileLayer][tileY][tileX];
    }

    setTile(tile, tileLayer, tileX, tileY) {
        if (!this.isTileValid(tileX, tileY)) return;
        tile.layer = tileLayer;
        tile.depth = 11000 - tileLayer * 10000;
        this.tiles[tileLayer][tileY][tileX] = tile;
    }

    removeTile(tileLayer, tileX, tileY) {
        if (!this.isTileValid(tileX, tileY)) return;
        this.tiles[tileLayer][tileY][tileX] = null;
    }

    collision(area, tileLayer = TILELAYER.MID) {
        var gridStart = this.xy2tile(area.getLeft(), area.getTop());
        gridStart.x = clamp(gridStart.x, 0, this.tilesX);
        gridStart.y = clamp(gridStart.y, 0, this.tilesY);

        var gridEnd = this.xy2tile(area.getRight() - 1, area.getBottom() - 1);
        gridEnd.x = clamp(gridEnd.x + 1, 0, this.tilesX);
        gridEnd.y = clamp(gridEnd.y + 1, 0, this.tilesY);


        for (var i = gridStart.y; i < gridEnd.y; i++) {
            for (var j = gridStart.x; j < gridEnd.x; j++) {
                const tile = this.getTile(tileLayer, j, i);
                if (tile) {
                    if (tile.solid) return true;
                }
            }
        }

        return false;
    }



}

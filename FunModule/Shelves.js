

class FunShelves extends BaseObject{
    constructor(x, y) {
        super(x, y);

        this.slotWid = 80;
        this.slotHei = 80;

        this.hSpace = 20;
        this.vSpace = 16;

        this.shelfColor = "rgb(120, 50, 20)";

        this.cols = 7;
        this.rows = 3;

        this.grid = [];
        for(var i = 0; i < this.rows; i++){
            var row = [];
            for(var j = 0; j < this.cols; j++){
                row.push(-1);
            }
            this.grid.push(row);
        }   


        this.iconSprite = new SpriteInstance(sprites[SPR.TROPHIES], 0,0,0);
        this.iconSprite.setScale(this.slotWid/this.iconSprite.sprite.width);

        this.hoveredCol = -1;
        this.hoveredRow = -1;
    }

    randomFill(seed){
        var rng = new Random(seed);
        
        var slotsInds = [];
        for(var i = 0; i < this.rows; i++){
            for(var j = 0; j < this.cols; j++){
                slotsInds.push({col:j, row:i});
            }
        }

        var propNum = rng.int(3, 10);
        for(var i = 0; i < propNum; i++){
            var ind = rng.int(0, slotsInds.length-1);
            var pos = slotsInds[ind];
            slotsInds.splice(ind, 1);

            var propType = 12 + rng.int(0, 8);
   
            this.grid[pos.row][pos.col] = propType;
        }
    }

    getGridX(col, row){
        var slotTotalWid = (this.slotWid+this.hSpace) ;
        return this.x + col*slotTotalWid  - (slotTotalWid*this.cols - this.hSpace)/2;
    }

    getGridY(col, row){
        var slotTotalHei = (this.slotHei+this.vSpace) ;
        return this.y + row*slotTotalHei  - (slotTotalHei*this.rows - this.vSpace)/2;
    }



    checkMouseOnSlot(col, row){
        var gridX = this.getGridX(col, row);
        var gridY = this.getGridY(col, row);
        return this.checkMouseOnArea(gridX, gridY, this.slotWid, this.slotHei);
    }

    checkMouseOnShelves(){
        var startX = this.getGridX(0,0);
        var startY = this.getGridY(0,0);

        var endX = this.getGridX(this.cols,this.rows);
        var endY = this.getGridY(this.cols,this.rows);

        return this.checkMouseOnArea(startX, startY, endX-startX, endY-startY);
    }

    checkMouseOnArea(x, y, wid, hei){
        var mouseX = input.mouseX;
        var mouseY = input.mouseY;
        if(mouseX < x || mouseX >= x + wid) return false;
        if(mouseY < y || mouseY >= y + hei) return false;
        return true;
    }



    update(dt){
        if(!this.active) return;
        this.hoveredCol = -1;
        this.hoveredRow = -1;

        if(this.checkMouseOnShelves()){
            for(var i = 0; i < this.rows; i++){
                for(var j = 0; j < this.cols; j++){
                    if(this.grid[i][j] == -1) continue;
                    if(!this.checkMouseOnSlot(j, i)) continue;

                    this.hoveredCol = j;
                    this.hoveredRow = i;
                    i = this.rows;
                    break;
                }
            }
        }
    }

    draw(ctx){
        if(!this.visible) return;
        for(var i = 0; i < this.rows; i++){
            for(var j = 0; j < this.cols; j++){
                if(this.grid[i][j] == -1) continue;

                var xx = this.getGridX(j, i);
                var yy = this.getGridY(j, i);
                this.iconSprite.setPosition(xx, yy);
                this.iconSprite.setFrame(this.grid[i][j]);
                if(this.hoveredCol == j && this.hoveredRow == i){
                    this.iconSprite.setAlpha(0.75);
                } else {
                    this.iconSprite.setAlpha(1);
                }
                this.iconSprite.draw(ctx);
            }

            var xx = this.getGridX(0, i);
            var yy = this.getGridY(0, i);

            ctx.fillStyle = this.shelfColor;
            ctx.fillRect(xx, yy + this.slotHei, (this.slotWid+this.hSpace)*this.cols, this.slotHei*0.15);
        }
    }
}

class ShelfItem extends GameObject {
    constructor(x, y, gridX, gridY, type){
        super(x, y);
        this.type = type;

        this.gridX = gridX;
        this.gridY = gridY;

        this.facing = 1;
    }
}
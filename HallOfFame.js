
class FlipActor {
    constructor(duration){
        this.duration = duration;
        this.speed = 1;
        this.timer = 0;

        this.phase = 0;
        this.flipState = 0;

        this.internalState = 0;

        this.progress = 0;
        this.flipping = false;
    }

    update(dt){
        if(!this.flipping) return;

        this.timer += dt*this.speed;

        this.progress = this.timer/this.duration;
        this.phase =  Math.PI*0.5*(this.internalState + this.progress);

        if(this.timer >= this.duration) {
            this.flipping = false;
            this.internalState++;
            this.internalState %= 4;
            this.setFlipState(this.flipState + 1);
        }
    }

    setFlipState(state){
        this.flipState = state%2;
        this.phase = Math.PI*0.5*this.internalState;
        this.progress = 0;
        this.timer = 0;
    }

    flip(){
        this.flipping = true;
    }
}



class HallSlot {
    constructor(fameHall, col, row, portraits) {
        this.fameHall = fameHall;
        this.col = col;
        this.row = row;

        this.portraits = portraits;
        this.portIndex = 0;
        this.depth = this.fameHall.getColRowDepth(col,row);
        this.size = this.fameHall.slotSize;

        this.x = 0;
        this.y = 0;

        this.hovered = false;

        this.flipAct = new FlipActor(20);

    }

    onClick(){
        if(!this.hovered) return;
        this.fameHall.onSlotClick(this);
        this.flipAct.flip();
    }

    update(dt){
        this.hovered = this.checkHover(input.mouseX, input.mouseY);
        if(this.hovered){
            if(input.mouseState[0][1]) this.onClick();
        }
        this.x = this.fameHall.getColX(this.col);
        this.y = this.fameHall.getRowY(this.row);
        this.flipAct.update(dt);

        if(this.flipAct.flipState == 1 && !this.flipAct.flipping){
            this.nextPortrait();
            this.flipAct.flip();
        }
    }

    nextPortrait(){
        this.portIndex ++;
        this.portIndex %= this.portraits.length;
    }


    draw(ctx) {

        var xx = this.x;
        var yy = this.y;
        var slotSize = this.fameHall.slotSize;

        var portrait = this.portraits[this.portIndex];
        portrait.extX = xx;
        portrait.extY = yy;

       
        var doClipH = portrait.clipH || this.fameHall.portraitClipH;
        var doClipV = portrait.clipV || this.fameHall.portraitClipV;

        var clipWid = doClipH ? slotSize : slotSize*2;
        var clipHei = doClipV ? slotSize : slotSize*2;



        ctx.save();

        ctx.translate(xx + this.size*0.5, yy + this.size*0.5);

        

        if(this.hovered){
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.lineWidth = 6;

            var border = 8;
            var highWid = slotSize + border*2;
            var highHei = slotSize + border*2;
            ctx.strokeRect(-highWid*0.5, -highHei*0.5,highWid, highHei);
        }


        var flipScl = Math.abs(Math.cos(this.flipAct.phase));
        ctx.scale(flipScl, 1);

        ctx.fillStyle = portrait.color;
        ctx.fillRect(-slotSize*0.5, -slotSize*0.5, slotSize, slotSize);
        


        ctx.beginPath();

        ctx.rect(slotSize*0.5 - clipWid, slotSize*0.5 - clipHei, clipWid, clipHei);
        ctx.clip();

 


        portrait.draw(ctx);
        ctx.restore();
    }

    checkHover(mouseX, mouseY){
        //if(this.col == 0 && this.row == 0) console.log(this.x, this.y, mouseX, mouseY, this.size);
        
        if(mouseX < this.x || mouseX >= this.x + this.size) return false;
        if(mouseY < this.y || mouseY >= this.y + this.size) return false;
        return true;
    }

    

    pushDraw(){
        manager.addDrawRequest(new DrawRequest(this, this.depth));
    }
}

class HallPortrait {
    constructor(config = {}) {
        this.spriteId = config.spriteId ?? -1;
        this.img = config.img ?? 0;

        this.color = config.color ?? "rgb(255,255,255)";

        this.clipH = config.clipH ?? false;
        this.clipV = config.clipV ?? false;
        this.offX = config.offX ?? 0.5;
        this.offY = config.offX ?? 0.5;

        // TRANSFORM CONFIGS
        this.x = config.x ?? 0;
        this.y = config.y ?? 0;
        this.sclX = config.sclX ?? 1;
        this.sclY = config.sclY ?? 1;
        this.ang = config.ang ?? 0;

        this.extX = 0;
        this.extY = 0;
        this.extSclX = 1;
        this.extSclY = 1;
        this.extAng = 0;
    }

    draw(ctx) {
        if (this.spriteId == -1) return;
        var x = this.x;
        var y = this.y;
        var sclX = this.sclX * this.extSclX;
        var sclY = this.sclY * this.extSclY;
        var ang = this.ang + this.extAng;

        sprites[this.spriteId].drawExtRelative(x, y, this.img, sclX, sclY, ang, this.offX, this.offY, ctx);
    }
}

class FameHall {
    constructor(x, y) {

        this.x = x;
        this.y = y;

        this.slotSize = 120;
        this.rowSpace = 30;
        this.colSpace = 30;

        this.rows = 3;
        this.cols = 6;

        this.width = ((this.slotSize + this.colSpace) * this.cols) + this.colSpace;
        this.height = ((this.slotSize + this.rowSpace) * this.rows) + this.rowSpace;

        this.slots = [];
        var hasSecondPortrait = [0, 1, 3, 4, 5, 7, 10, 12, 17];
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var ind = j + i*this.cols;

                var color =  "hsl(" + (ind * 71.57) % 360 + ", 70%, 50%)";
                var port0 = new HallPortrait({ color: "rgb(50,50,50)", spriteId: -1, img: 0});
                var port1 = new HallPortrait({ color:color, spriteId: SPR.PORTRAITS, img: ind % 18});
                var port2 = new HallPortrait({ color: "rgb(50,50,50)", spriteId: SPR.PORTRAITS, img: 18+ (ind % 18)});
                var slot = new HallSlot(this, j, i, [port0, port1]);
                if(hasSecondPortrait.includes(ind)) slot.portraits.push(port2);
                this.slots.push(slot);
            }
        }

        this.slots[0].portraits[1].color = "rgb(85, 37, 81)";
        //this.slots[0].portraits[1].color = "rgb(85, 37, 81)";

        this.slots[6].portraits[1].color = "rgb(67, 42, 93)";
        //this.slots[6].portraits[1].color = "rgb(67, 42, 93)";
        this.slots[6].portraits[1].clipH = true;

        this.slots[12].portraits[1].color = "rgb(43, 10, 40)";
       // this.slots[12].portraits[1].color = "rgb(43, 10, 40)";

        this.slots[7].portraits[1].color = "rgb(120, 56, 56)";
        //this.slots[7].portraits[1].color = "rgb(120, 56, 56)";

        this.slots[8].portraits[1].color = "rgb(188, 115, 115)";
        //this.slots[8].portraits[1].color = "rgb(188, 115, 115)";

        this.slots[9].portraits[1].color = "rgb(197, 32, 32)";
        //this.slots[9].portraits[1].color = "rgb(197, 32, 32)";

        this.slots[10].portraits[1].color = "rgb(236, 115, 198)";
        //this.slots[10].portraits[1].color = "rgb(236, 115, 198)";
        this.slots[10].portraits[1].clipH = true;

        this.slots[11].portraits[1].color = "rgb(213, 147, 192)";
        //this.slots[11].portraits[1].color = "rgb(213, 147, 192)";
        this.slots[11].portraits[1].clipH = true;


        for(var slot of this.slots){
            var ind = slot.col + slot.row*this.cols;

            if(!hasSecondPortrait.includes(ind)) continue;
            slot.portraits[2].color = slot.portraits[1].color;
        }

        this.portraitClipV = false;
        this.portraitClipH = false;

        this.firstSlotClick = false;

        this.actionQueue = new ActionQueue();

        
    }

    onSlotClick(slot){
        if(this.firstSlotClick) return;
        this.firstSlotClick = true;

        var row = slot.row;
        var col = slot.col;

        var slotDist = [];

        for(var slot of this.slots){
            var dist = Math.abs(slot.col - col) + Math.abs(slot.row - row);

            slotDist.push({slot:slot, dist:dist});
        }

        slotDist.sort((a,b) => a.dist - b.dist);

        var curDist = 0;
        var actions = [];
        var seqList = [];

        for(var sloter of slotDist){
            if(curDist != sloter.dist) {
                seqList.push(new ParallelAction(actions));
                seqList.push(new WaitAction(20));
                actions = [];
                curDist = sloter.dist;
            }

            actions.push(new FlipSlotAction(sloter.slot));

        }

        seqList.push(new ParallelAction(actions));

        var seqAct = new SequentialAction(seqList);

        this.actionQueue.add(seqAct);

    }

    update(dt) {
  
        for(var slot of this.slots){
            slot.update(dt);
            //slot.hovered = slot.checkHover(input.mouseX, input.mouseY);
            slot.pushDraw();
        }

        this.actionQueue.update(dt);
    }

    createDraw(depth, params) {
        return new DrawRequest(this, depth, params);
    }

    getColX(col) {
        var startX = this.x - this.width / 2;
        return startX + this.colSpace + col * (this.slotSize + this.colSpace);
    }

    getRowY(row) {
        var startY = this.y - this.height / 2;
        return startY + this.rowSpace + row * (this.slotSize + this.rowSpace);
    }

    getColRowDepth(col, row) {
        return - 500 * (col + row);
    }

    draw(ctx) {
        //this.drawAllBacks(ctx);
        // this.drawFrame(ctx);
    }

    drawAllBacks(ctx) {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var xx = this.getColX(j);
                var yy = this.getRowY(i);

                ctx.fillStyle = this.slots[j + i * this.cols].color;
                ctx.fillRect(xx, yy, this.slotSize, this.slotSize);
            }
        }
    }

    drawFrame(ctx) {

        var wid = this.width;
        var hei = this.height;

        var startX = this.getColX(0) - this.colSpace;
        var startY = this.getRowY(0) - this.rowSpace;

        ctx.fillStyle = "rgb(0,0,0)";
        for (var i = 0; i < this.cols; i++) {
            var xx = this.getColX(i) - this.colSpace;
            ctx.fillRect(xx, startY, this.colSpace, hei);
        }

        for (var i = 0; i < this.rows; i++) {
            var yy = this.getRowY(i) - this.rowSpace;
            ctx.fillRect(startX, yy, wid, this.rowSpace);
        }
    }

    drawCorner(ctx, col, row) {
        var startX = this.getColX(col);
        var startY = this.getRowY(row);

        // Draws an l in the right bottom corner
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(startX + this.slotSize, startY, this.colSpace, this.rowSpace + this.slotSize);
        ctx.fillRect(startX, startY + this.slotSize, this.slotSize, this.rowSpace);
    }


    drawCornerCol(ctx, col, row) {
        var startX = this.getColX(col);
        var startY = this.getRowY(row);

        // Draws an l in the right bottom corner
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(startX + this.slotSize, startY, this.colSpace, this.rowSpace + this.slotSize);
    }
    drawCornerRow(ctx, col, row) {
        var startX = this.getColX(col);
        var startY = this.getRowY(row);

        // Draws an l in the right bottom corner
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(startX, startY + this.slotSize, this.slotSize + this.colSpace, this.rowSpace);
    }

    drawBack(ctx, col, row) {
        var xx = this.getColX(col);
        var yy = this.getRowY(row);

        ctx.fillStyle = this.slots[col + row * this.cols].color;
        ctx.fillRect(xx, yy, this.slotSize, this.slotSize);
    }

    drawPortrait(ctx, col, row) {
        var xx = this.getColX(col);
        var yy = this.getRowY(row);


        var sprInd = this.slots[col + row * this.cols].sprite;
        if (sprInd == -1) return;

        var imgInd = this.slots[col + row * this.cols].img;
        if (imgInd == -1) return;


        ctx.save();
        var areaWid = this.slotSize * 2;
        var areaHei = areaWid;
        ctx.beginPath();
        ctx.rect(xx - areaWid + this.slotSize, yy - areaHei + this.slotSize, areaWid, areaHei);

        ctx.clip();
        sprites[sprInd].drawExtRelative(xx, yy, imgInd, 2, 2, 0, 0.25, 0.25);
        ctx.restore();
    }

    drawRequest(ctx, param) {
        switch (param.type) {
            case 0:
                this.drawCorner(ctx, param.col, param.row);
                break;
            case 1:
                this.drawBack(ctx, param.col, param.row);
                break;
            case 2:
                this.drawPortrait(ctx, param.col, param.row);
                break;
            case 3:
                this.drawCornerCol(ctx, param.col, param.row);
                break;
            case 4:
                this.drawCornerRow(ctx, param.col, param.row);
                break;
        }
    }


}
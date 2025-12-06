
const ROOM = Object.freeze(new Enum(
    "TEST",
    "NAT",
    "DAN",
    "TOTAL"
));

var roomMusic = [];
for(var i = 0 ; i < ROOM.TOTAL; i++){
    roomMusic.push(-1);
}

roomMusic[ROOM.NAT] = SND.MUSICELEVATOR;
roomMusic[ROOM.DAN] = SND.MUSICELEVATOR;

class BackgroundLayer{
    constructor(render, factor){
        this.render = render;
        this.factorX = factor;
        this.factorY = factor;
        this.x = 0;
        this.y = 0;
        this.repeatX = true;
        this.repeatY = false;

        this.depth = 20000;
    }

    draw(ctx){
        var area = manager.drawingCam.getWorldArea();

        var wid = this.render.getWid();
        var hei = this.render.getHei(); 

        var offX = (this.factorX*area.x + this.x); 
        var offY = (this.factorY*area.y + this.y);


        var startX = 0;
        var startY = 0;
        var xCopies = 1;
        var yCopies = 1;
        if(this.repeatX){
            offX = offX % wid;
            startX = Math.floor(area.x/ wid)*wid;
            xCopies = Math.ceil(area.width/wid);
        }

        if(this.repeatY){
            offY = offY % hei;
            startY = Math.floor(area.y / hei)*hei;
            yCopies = Math.ceil(area.height/hei);
        }



        for(var i = 0; i < yCopies; i++){
            for(var j = 0; j < xCopies; j++){
                this.render.x = startX + offX + wid*j;
                this.render.y = startY + offY + hei*i;
                this.render.draw(ctx);
            }
        }

    }

    pushDraw() {
        manager.addDrawRequest(new DrawRequest(this, this.depth, 0));
    }

    drawRequest(ctx, parameter) {
    this.draw(ctx);
    }
}

class Background{
    constructor(){
        this.layers = [];
    }

    update(dt){
    }

    pushDraw(){
        for(var layer of this.layers){
            layer.pushDraw();
        }
    }

}

class Room{
    constructor(width, height, id){
        this.objects = [];
        this.classes = [];
        this.backgroundColor = new Color(0,0,0);
        this.background = new Background();
        this.tileMap = null;
        this.onLoad = function(){};
        this.id = id;
        for (var i = 0; i < OBJECT.TOTAL; i++) {
            this.classes.push([]);
        }

        this.width = width;
        this.height = height;
    }

    addObject(obj){
        if(!obj) return;
        this.classes[obj.type].push(obj);
        this.objects.push(obj);
        obj.room = this;
        obj.onRoomEnter();
    }

    removeObject(obj){
        if(!obj)return;
        this.removeObjectFromList(this.classes[obj.type], obj);
        this.removeObjectFromList(this.objects, obj);
    }

    removeObjectFromList(list, obj){
        const index = list.indexOf(obj);
        if (index !== -1) {
          list.splice(index, 1);
          return true; // Value was removed successfully
        } else {
          return false; // Value not found in the array
        }
    }

    update(dt){
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];

            if (obj.active) {
                obj.update(dt);
            } else {
                obj.onDestroy();
                this.objects.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < this.classes.length; i++) {
            for (var j = 0; j < this.classes[i].length; j++) {
                var obj = this.classes[i][j];

                if (obj.active) {
                    //obj.update(dt);
                } else {
                    obj.onDestroy();
                    this.classes[i].splice(j, 1);
                    j--;
                }
            }
        }

        if(this.tileMap){
            this.tileMap.update(dt);
        }
    }

    pushDraw(){
        for (var i = 0; i < this.objects.length; i++) {
            var obj = this.objects[i];

            if (obj.active) {
                obj.pushDraw();
            }
        }

        if(this.tileMap){
            this.tileMap.pushDraw(manager.drawingCam.getWorldArea());
        }

        if(this.background){
            this.background.pushDraw();
        }
    }
}
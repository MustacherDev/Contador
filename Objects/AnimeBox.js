

class AnimeBox extends Box{
    constructor(x, y, width, height, sprite) {
        super(x, y, width, height, sprite);
    
        this.type = OBJECT.ANIMEBOX;
    
        this.scale2FitSprite(1, 1);
        this.setGeneralOffsetRelative(1, 1);
    
        this.flipAct = new FlipActor();
        this.sneezeAct = new SneezeActor();
        this.wiggleAct = new WiggleActor();
    }

    

    updateActors(gdt){
        this.flipAct.update(gdt);
        this.sneezeAct.update(gdt);
        this.wiggleAct.update(gdt);
    }

    getDrawScale(){
        var xScl = this.xScl * Math.cos(this.flipAct.phase) * this.sneezeAct.xScl * this.wiggleAct.xScl;
        var yScl = this.yScl * this.sneezeAct.yScl * this.wiggleAct.yScl;

        return new Vector(xScl, yScl);
    }


    draw(ctx) {

        var scl = this.getDrawScale();
    
        this.sprite.drawExt(this.x, this.y, this.img,scl.x, scl.y, this.ang, this.xSprOffset, this.ySprOffset);
    }
}
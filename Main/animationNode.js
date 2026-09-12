class AnimationNode extends BaseObject{
    constructor(spriteInd){
        super(0,0);
        this.parent = null;
        this.children = [];

        // Local transform
        this.x = 0;
        this.y = 0;
        this.ang = 0;
        this.xScl = 1;
        this.yScl = 1;
        this.depth = 0;

        // The point in texture where this sprite coordinates start
        // Also the rotation pivot
        this.texOriginX = 0;
        this.texOriginY = 0;

        // World transform
        this.worldX = 0;
        this.worldY = 0;
        this.worldAng = 0;
        this.worldXScl = 1;
        this.worldYScl = 1;
        this.worldDepth = 0;

        this.sprite = new SpriteInstance(sprites[spriteInd], this.x, this.y, 0);
    }

    addChild(child){
        if(child.parent){
            child.parent.removeChild(child);
        }

        child.parent = this;
        this.children.push(child);

        return child;
    }

    removeChild(child){
        const index = this.children.indexOf(child);

        if(index !== -1){
            this.children.splice(index, 1);
            child.parent = null;
        }
    }

    updateWorldTransform(){
        if(this.parent === null){
            this.worldX = this.x;
            this.worldY = this.y;
            this.worldAng = this.ang;
            this.worldXScl = this.xScl;
            this.worldYScl = this.yScl;
            this.worldDepth = this.depth;
        }
        else{
            const p = this.parent;

            this.worldXScl = p.worldXScl * this.xScl;
            this.worldYScl = p.worldYScl * this.yScl;
            this.worldAng = p.worldAng + this.ang;
            this.worldDepth = p.worldDepth + this.depth;

            const localX = (this.x - p.texOriginX) * p.worldXScl;
            const localY = (this.y - p.texOriginY) * p.worldYScl;

            const cos = Math.cos(p.worldAng);
            const sin = Math.sin(p.worldAng);

            this.worldX = p.worldX + localX * cos - localY * sin;
            this.worldY = p.worldY + localX * sin + localY * cos;
        }

        this.sprite.setPosition(this.worldX, this.worldY);
        this.sprite.setScale(this.worldXScl, this.worldYScl);
        this.sprite.setRotation(this.worldAng);

        for(const child of this.children){
            child.updateWorldTransform();
        }
    }

    setPivot(textureX, textureY){
        this.texOriginX = textureX;
        this.texOriginY = textureY;
        this.sprite.setOrigin(this.texOriginX/this.sprite.getSprWidth(), this.texOriginY/this.sprite.getSprHeight());
    }

    setRelativePivot(textureXPerc, textureYPerc){
        this.setPivot(this.sprite.getSprWidth()*textureXPerc, this.sprite.getSprHeight()*textureYPerc);
    }

    setScale(xScl, yScl){
        this.xScl = xScl;
        this.yScl = yScl;
    }

    setRotation(ang){
        this.ang = ang;
    }

    setDepth(depth){
        this.depth = depth;
    }

    setFrame(frame){
        this.sprite.setFrame(frame);
    }

    setPosition(x, y){
        this.x = x;
        this.y = y;
    }

    update(dt){
        this.updateWorldTransform();
    }

    pushDraw(){
        manager.addDrawObject(this, this.worldDepth);
        for(const child of this.children){
            child.pushDraw();
        }
    }

    draw(ctx){
        this.sprite.draw(ctx);
    }
}
class GarbageCan extends GameObject{
    constructor(x, y){
        super(x, y);
        this.backSprite  = new SpriteInstance(sprites[SPR.GARBAGECAN], x, y, 0);
        this.frontSprite = new SpriteInstance(sprites[SPR.GARBAGECAN], x, y, 0);

        this.open = false;
        this.hovered = false;

        this.depth = 100;

        this.xScl = 4;
        this.yScl = 4;

        this.backSprite.setScale(this.xScl);
        this.frontSprite.setScale(this.xScl);
        this.backSprite.setOrigin(0.5, 1);
        this.frontSprite.setOrigin(0.5, 1);

        this.clickCooldown = new Alarm(30, 30);

        this.content = 1;
    }

    interact(){
        if(!this.clickCooldown.finished) return;
        this.clickCooldown.restart();
        if(!this.open) {
            this.onOpen();
        } else {
            this.onClose();
        }
    }

    spawnContent(){
        var content = null;
        switch(this.content){
            case 1:
                content = new GarbageHacker(this.x - 4, this.y);
                break
        }

        if(content) {
            content.setOriginDepth(this.depth);
            manager.addObject(content);
        }
    }

    onOpen(){
        if(this.open) return;
        SoundPlayer.play(SND.OPENECO);
        this.animator.addActionEffect(new ShakeEffect({duration:30}));
        this.animator.addAction(new CodeAction(()=>{this.spawnContent()}));

        this.open = true;
        this.backSprite.setFrame(this.open ? 2 : 0);
        this.frontSprite.setFrame(this.open ? 1 : 0);

        
    }

    onClose(){
        if(!this.open) return;
        SoundPlayer.play(SND.OPEN);
        this.animator.addActionEffect(new ShakeEffect({duration:25}));

        this.open = false;
        this.backSprite.setFrame(this.open ? 2 : 0);
        this.frontSprite.setFrame(this.open ? 1 : 0);
    }

    update(dt){

        var hov = this.frontSprite.pointInside(input.mouseX, input.mouseY) && this.clickCooldown.finished;
        if(hov != this.hovered){
            this.hovered = hov;
            this.backSprite.sprite = (this.hovered ? sprites[SPR.GARBAGECANOUTLINE] : sprites[SPR.GARBAGECAN]);
        } 


        this.clickCooldown.update(dt);

        if(input.mouseState[0][1]){
            if(this.hovered) this.interact();
        }


        this.animator.update(dt);
        var xx = this.x + this.animator.offsetX;
        var yy = this.y + this.animator.offsetY;
        var xScl = this.xScl * this.animator.scaleX;
        var yScl = this.yScl * this.animator.scaleY;

        this.backSprite.setPosition(xx, yy);
        this.frontSprite.setPosition(xx, yy);
    }

    pushDraw(){
        manager.addDrawObject(this.frontSprite, this.depth - 10);
        manager.addDrawObject(this.backSprite, this.depth + 10);
    }

    draw(ctx){

    }
}



class GarbageContent extends GameObject{
    constructor(x, y){
        super(x, y);

        this.originX = x;
        this.originY = y;

        this.originDepth = this.depth;
    }

    setOriginDepth(depth){
        this.depth = depth;
        this.originDepth = this.depth;
    }

    onStateChange(state){
        if(state == 4){
            this.depth = this.originDepth - 100;
        }
    }


    update(dt){
        this.animator.update(dt);
    }
}

class GarbageHacker extends GarbageContent{
    constructor(x, y){
        super(x, y);

        this.xScl = 3;
        this.yScl = 3;

        this.sprite = new SpriteInstance(sprites[SPR.HACKER], x, y, 0);
        this.sprite.setOrigin(0.5, 1);
        this.sprite.setScale(this.xScl, this.yScl);

        
        this.riseAmount = 85;
        this.jumpHei = 90;
        this.fallHei = this.riseAmount + this.jumpHei + 24;
        this.jumpWid = 90;

        this.animator.addAction(new WaitAction(100));
        this.animator.addActionEffect(new MoveEffect(100, 0, -this.riseAmount, Easing.linear, Easing.linear));
        this.animator.addAction(new WaitAction(50));
        this.animator.addActionEffect(new MoveEffect(25, this.jumpWid, -this.jumpHei, Easing.linear, Easing.outQuad));
        this.animator.addAction(new CodeAction(() => {this.depth = this.originDepth - 100;}))
        this.animator.addActionEffect(new MoveEffect(25, this.jumpWid, this.fallHei, Easing.linear, Easing.inQuad));
        this.animator.addAction(new WaitAction(50));
        this.animator.addAction(new CodeAction(()=>{this.free = true}));
        //this.animator.addActionEffect(new MoveEffect(100, 400, 0, Easing.linear, Easing.linear));

        this.flipEffect = this.animator.addEffect(new FlipEffect());

        this.img = 0;
        this.imgSpd = 0.1;
        this.facingRight = true;
        this.free = false;

        this.walkCooldown = new Alarm(50, 50);
        this.walkAlarm = new Alarm(30);
        this.walkAlarm.stop();
        this.walkDir = 1;
    }

    update(dt){

        var moveX = 0;
        if(this.free){
            this.walkCooldown.update(dt);
            this.walkAlarm.update(dt);

            if(this.walkCooldown.finished){
                this.walkDir = choose([-1, 1]);
                this.walkAlarm.setDuration(randInt(50, 250));
                this.walkCooldown.stop();
                this.walkAlarm.start();
            }

            if(this.walkAlarm.finished){
                this.walkDir = 0;
                this.walkCooldown.start();
                this.walkAlarm.stop();
            }

            moveX = this.walkDir;
        }

        this.facingRight = moveX == 0 ? this.facingRight : (moveX > 0 ? true : false);

        if(!this.walkAlarm.paused){
            this.img += this.imgSpd*dt;
        } else {
            this.img = 0;
        }
        this.x += moveX*dt*2;

        if(!this.flipEffect.flipping){
            if(this.flipEffect.isFront != this.facingRight){
                this.flipEffect.flip(0.5);
            }
        }
        



        this.animator.update(dt);
        var xx = this.x + this.animator.offsetX;
        var yy = this.y + this.animator.offsetY;
        var ang = this.ang + this.animator.rotation;
        var xScl = this.xScl * this.animator.scaleX;
        var yScl = this.yScl * this.animator.scaleY;


        this.sprite.setFrame(this.img);
        this.sprite.setPosition(xx, yy);
        this.sprite.setScale(xScl, yScl);
        this.sprite.setRotation(ang);
    }

    draw(ctx){
        this.sprite.draw(ctx);
    }
}
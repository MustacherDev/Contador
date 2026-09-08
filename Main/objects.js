class BaseObject{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.depth = 0;
        this.active = true;
        this.visible = true;
    }

    setActive(active){
        this.active = active;
    }

    changeVisible(visible){
        this.visible = visible;
    }

    update(dt){

    }

    pushDraw(ctx){
        manager.addDrawObject(this, this.depth);
    }

    draw(ctx){

    }
}

class GameObject extends BaseObject{
    constructor(x, y){
        super(x, y);
    }

    update(dt){

    }

    pushDraw(ctx){
        manager.addDrawObject(this, this.depth);
    }

    draw(ctx){

    }
}


class BigClock extends GameObject{
    constructor(x, y){
        super(x, y);

        var scl = 10;
        this.wid = 16*scl;
        this.hei = 48*scl;

        this.sprite = new SpriteInstance(sprites[SPR.BIGCLOCK], x, y);
        this.sprite.setScale(this.wid/this.sprite.getWidth(), this.hei/this.sprite.getHeight());
        this.sprite.setOrigin(0.5, 0.5);

        this.pendulum = new SpriteInstance(sprites[SPR.BIGCLOCK], x, y, 1);
        this.pendulum.setScale(this.wid/this.sprite.getWidth(), this.hei/this.sprite.getHeight());
        this.pendulum.setOrigin(0.5, 0.5);

        this.hovered = false;

        this.visible = false;

        this.swingAlarm = new Alarm(65);
        this.swingSide = 0;
    }

    swingPendulum(){
        this.swingAlarm.restart();
        this.swingSide++;
        this.swingSide %= 2;
    }


    update(dt){
        this.swingAlarm.update(dt);
        this.sprite.setPosition(this.x, this.y);
        this.pendulum.setPosition(this.x, this.y);


        var swingDir = this.swingSide == 0 ? 1 : -1; 
        this.pendulum.setRotation((tweenInOut(this.swingAlarm.percentage())*swingDir + this.swingSide)*Math.PI/8     - Math.PI/16);

        if(!this.visible) return;
        this.hovered = Area.pointInside(input.mouseX,input.mouseY, this.x - this.wid*0.5, this.y - this.hei*0.5, this.wid, this.hei);


        if(this.hovered && input.mouseState[0][1]){
            SoundPlayer.play(SND.MEOW);
        }
    }

    draw(ctx){
        if(!this.visible) return;

        this.sprite.setFrame(2);
        this.sprite.draw(ctx);

        this.pendulum.draw(ctx);

        this.sprite.setFrame(0);
        this.sprite.draw(ctx);
    }
}

class FinishStar extends GameObject{
    constructor(x, y){
        super(x, y);

        this.wid = 64;
        this.hei = 64;

        this.sprite = new SpriteInstance(sprites[SPR.STAR], x, y);
        this.sprite.setScale(this.wid/this.sprite.getWidth(), this.hei/this.sprite.getHeight());
        this.sprite.setOrigin(0.5, 0.5);

        this.hovered = false;

        this.visible = false;
        this.appear = false;

        this.clickAlarm = new Alarm(10);
    }

    update(dt){
        this.clickAlarm.update(dt);
        this.sprite.setPosition(this.x, this.y);
        this.sprite.setFrame(this.hovered ? 1: 0);

        if(!this.visible) return;
        if(!this.appear) return;
        this.hovered = Area.pointInside(input.mouseX,input.mouseY, this.x - this.wid*0.5, this.y - this.hei*0.5, this.wid, this.hei);


        if(this.hovered && input.mouseState[0][1] && this.clickAlarm.finished){
            SoundPlayer.play(SND.MEOW);
            this.clickAlarm.restart();
        }
    }

    draw(ctx){
        if(!this.visible) return;
        if(!this.appear) return;
        this.sprite.draw(ctx);
    }
}



class PeachKart extends GameObject{
    constructor(x, y, facing, state){
        super(x, y);

        this.hspd = 0;
        this.vspd = 0;

        this.hspdDamp = 1;

        this.imgSpd = 0;
        this.img = (facing == -1) ? 16 : 7;

        this.depth = 0;

        this.state = state;

        switch(state){
            case 0:
                this.hspd = facing*6;
                
                break;  

            case 1:
                this.hspd = facing*6;
                this.imgSpd = 0.25;
                break;  

            case 2:
                this.hspd = facing*8;
                this.hspdDamp = 0.98;
                break;
        }

        this.sprite = new SpriteInstance(sprites[SPR.PEACHKART], x, y);
        this.sprite.setScale(4, 4);
        this.sprite.setOrigin(0.5, 1);

        this.bumpAlarm = new Alarm(30);
        this.bumpAlarm.loop = true;

        this.fadeAlarm = new Alarm(400);
        this.alphaFlow = new StateFlow(2, 40);

        this.active = true;
    }

    update(dt){

        this.x += this.hspd*dt;
        if(this.fadeAlarm.percentage() > 0.2){
            this.hspd *= Math.pow(this.hspdDamp, dt);
        }
        this.y += this.vspd*dt;
        this.img += this.imgSpd*dt;

        this.bumpAlarm.update(Math.abs(dt*this.hspd*0.4));

        var bump = Math.floor(this.bumpAlarm.percentage()*2)*4;
        if(this.state == 1) bump = 0; 

        this.sprite.setPosition(this.x, this.y -bump);
        this.sprite.setFrame(this.img);
        this.sprite.setAlpha(this.alphaFlow.progress);

        if(this.state == 2 && Math.abs(this.hspd) < 0.04){
            this.active = false;
            manager.addParticle(particleExplosion(this.x, this.y));
            SoundPlayer.play(SND.EXPLOSION);
        }

        this.fadeAlarm.update(dt);
        if(this.fadeAlarm.finished){
            this.alphaFlow.hide();
            this.fadeAlarm.stop();
        }

        this.alphaFlow.update(dt);
        if(this.alphaFlow.state == 0) {
            this.active = false;
        }
    }

    draw(ctx){
        this.sprite.draw(ctx);
    }
}



class PillDemo extends GameObject{
    constructor(x, y, state){
        super(x, y);

        var pillsCols = 14;
        var pillsRows = 21;
        var pillsWid = canvasWidth*0.4;
        var pillsHei = pillsWid*(pillsRows/pillsCols);

        this.pillGame = new DrMarioGame(this.x - pillsWid*0.5, this.y - (pillsWid/pillsCols)*2, pillsWid, pillsHei, pillsCols, pillsRows);
    
        this.depth = 0;
        this.state = state;

        this.color1 = randInt(0, 5);
        this.color2 = randInt(0, 5);
        this.xpos = randInt(3, 8);

        this.pillGame.grid[this.pillGame.rows-1][this.xpos-3] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color1);
        this.pillGame.grid[this.pillGame.rows-1][this.xpos-2] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color1);
        this.pillGame.grid[this.pillGame.rows-1][this.xpos-1] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color1);
        this.pillGame.grid[this.pillGame.rows-1][this.xpos+2] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color2);
        this.pillGame.grid[this.pillGame.rows-1][this.xpos+3] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color2);
        this.pillGame.grid[this.pillGame.rows-1][this.xpos+4] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color2);

        this.pillGame.playerPill = this.pillGame.createPlayerPill(this.color1, this.color2);

        this.actionQueue = new ActionQueue();
        var moveDiff = this.xpos - Math.floor((this.pillGame.cols-1)*0.5);
        var moveAmount = Math.abs(moveDiff);
        var moveDir = sign(moveDiff);

        this.actionQueue.add(new WaitAction(140));
        for(var i = 0; i < moveAmount; i++){
            this.actionQueue.add(new WaitAction(20));
            var moveAct = new CodeAction(() => {
                this.pillGame.inputMovePress(moveDir);
            });
            this.actionQueue.add(moveAct);
        }
        this.actionQueue.add(new WaitAction(100));
        this.actionQueue.add(new CodeAction(() => {
            this.holdDown = true;
        }));


        this.holdDown = false;

        this.fadeAlarm = new Alarm(400);
        this.alphaFlow = new StateFlow(2, 40);

        this.active = true;
    }

    update(dt){
        this.actionQueue.update(dt);
        this.pillGame.update(dt);
        if(this.holdDown){
            this.pillGame.inputDown();
        }

        this.alphaFlow.update(dt);

        if(this.pillGame.runState == 5){
            this.alphaFlow.hide();
        }

         if(this.pillGame.runState == 6){
            this.alphaFlow.hide();
        }

        if(this.alphaFlow.state == 0) this.active = false;
    }

    draw(ctx){
        this.pillGame.draw(ctx);
    }
}
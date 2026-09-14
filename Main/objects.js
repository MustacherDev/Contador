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

class ManagerObject extends BaseObject{
    constructor(x, y){
        super(x, y);

        this.objects = [];
    }

    addObject(obj){
        this.objects.push(obj);
    }

    updateObjects(dt){
        for(var obj of this.objects){
            obj.update(dt);
        }
    }

    pushDrawObjects(){
        for(var obj of this.objects){
            obj.pushDraw();
        }
    }

    pushDraw(){
        this.pushDrawObjects();
    }

    update(dt){
        this.updateObjects(dt);
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

class PurpleDude extends GameObject {
    constructor(x, y) {
        super(x, y); 
        this.ang = 0;
        this.xScl = 5;
        this.yScl = 5;

        this.body = new AnimationNode(SPR.PBODY);
        this.body.x = x;
        this.body.y = y;
        this.body.setRelativePivot(0,0);

        this.pHead = new AnimationNode(SPR.PHEAD);
        this.pHead.x = 9;
        this.pHead.y = -1;
        this.pHead.setPivot(11, 9);
        this.body.addChild(this.pHead);

        this.rLeg = new AnimationNode(SPR.PLEG);
        this.rLeg.x = 10;
        this.rLeg.y = 14;
        this.rLeg.setPivot(1,1);
        this.body.addChild(this.rLeg);


        this.lLeg = new AnimationNode(SPR.PLEG);
        this.lLeg.x = 6;
        this.lLeg.y = 14;
        this.lLeg.setPivot(1,1);
        this.body.addChild(this.lLeg);

        this.rArm = new AnimationNode(SPR.PARM);
        this.rArm.x = 12;
        this.rArm.y = 2;
        this.rArm.setPivot(1,1);
        this.body.addChild(this.rArm);

        this.lArm = new AnimationNode(SPR.PARM);
        this.lArm.x = 4;
        this.lArm.y = 2;
        this.lArm.setPivot(1,1);
        this.body.addChild(this.lArm);

        this.alarm = new Alarm(2400);
        this.alarm.loop = true;
        
    }


    update(dt){
        if(!this.active) return;
        this.alarm.update(dt);
        var t = this.alarm.percentage();


        this.body.x = this.x -20*tweenInOut(zloop(t, 30));
        this.body.y = this.y;
        this.body.ang = this.ang;
        this.body.xScl = this.xScl;
        this.body.yScl = this.yScl;


       

        this.rArm.ang = -0.2*tweenInOut(zloop(t, 30));
        this.lArm.ang = +0.2*tweenInOut(zloop(t, 30));

        this.rLeg.ang = -0.2 + 0.4*tweenInOut(zloop(t, 25));
        this.lLeg.ang =  0.2 - 0.4*tweenInOut(zloop(t, 25));

        this.pHead.ang = 0.2 - 0.4*tweenInOut(zloop(t, 10));

        this.body.update(dt);
    }

    draw(ctx){
        if(!this.visible) return;
        this.rArm.draw(ctx);
        this.lArm.draw(ctx);
        this.rLeg.draw(ctx);
        this.lLeg.draw(ctx);
        this.body.draw(ctx);
        this.pHead.draw(ctx);
    }
}

class SpotusGuy extends GameObject {
    constructor(x, y) {
        super(x, y); 
        this.ang = 0;
        this.xScl = 4;
        this.yScl = 4;

        this.body = new AnimationNode(SPR.SPOTUSBODY);
        this.body.x = x;
        this.body.y = y;
        this.body.setRelativePivot(0.5,0.5);

        this.spots = new AnimationNode(SPR.SPOTUSBODY);
        this.spots.x = 40;
        this.spots.y = 40;
        this.spots.sprite.setFrame(1);
        this.spots.setRelativePivot(0.5,0.5);
        this.body.addChild(this.spots);

        this.hat = new AnimationNode(SPR.SPOTUSHAT);
        this.hat.x = 40;
        this.hat.y = 40;
        this.hat.setPivot(24,88);
        this.body.addChild(this.hat);

        
        this.lLeg = new AnimationNode(SPR.SPOTUSLEG);
        this.lLeg.x = 52;
        this.lLeg.y = 72;
        this.lLeg.setPivot(18,2);
        this.lLeg.depth = 10;
        this.lLeg.yScl = 2;
        this.body.addChild(this.lLeg);

        this.lFoot = new AnimationNode(SPR.SPOTUSFOOT);
        this.lFoot.x = 17;
        this.lFoot.y = 79;
        this.lFoot.setPivot(4,4);
        this.lFoot.depth = -5;
        this.lLeg.addChild(this.lFoot);

        this.rLeg = new AnimationNode(SPR.SPOTUSLEG);
        this.rLeg.x = 32;
        this.rLeg.y = 74;
        this.rLeg.depth = 10;
        this.rLeg.setPivot(18,2);
        this.rLeg.xScl = -1;
        this.rLeg.yScl = 2;
        this.body.addChild(this.rLeg);

        this.rFoot = new AnimationNode(SPR.SPOTUSFOOT);
        this.rFoot.x = 17;
        this.rFoot.y = 79;
        this.rFoot.setPivot(4,4);
        this.rFoot.depth = -5;

        this.rLeg.addChild(this.rFoot);



        this.face = new AnimationNode(SPR.SPOTUSFACE);
        this.face.x = 40;
        this.face.y = 40;
        this.face.setRelativePivot(0.5,0.5);
        this.body.addChild(this.face);

        

        this.alarm = new Alarm(2400);
        this.alarm.loop = true;

        this.reactionAlarm = new Alarm(150);

        this.state = "idle";
        this.happyLevel = 0;

        this.legMult = 2;
        
    }

    setState(state){
        switch(state){
            case "idle":
                this.face.sprite.setFrame(this.happyLevel);
                break;
            case "impressed":
                this.face.sprite.setFrame(4);
                this.reactionAlarm.start();
                break;
            case "disgusted":
                this.face.sprite.setFrame(5);
                this.reactionAlarm.start();
                break;
        }
    }

    

    triggerImpress(){
        this.setState("impressed");
    }

    triggerDisgust(){
        this.setState("disgusted");
    }




    setDepth(depth){
        this.depth = depth;
        this.body.depth = depth;
    }

    update(dt){
        if(!this.active) return;
        this.alarm.update(dt);
        var t = this.alarm.percentage();



        this.body.ang = this.ang;
        this.body.xScl = this.xScl;
        this.body.yScl = this.yScl;


        var tiptoeFact = tweenInOut(zloop(t, 8));

 

        //this.legMult = tiptoeFact*2;


        this.body.x = this.x -20*tweenInOut(zloop(t, 18));
        this.body.y = this.y + 15*tiptoeFact - this.lLeg.sprite.getSprHeight()*this.lLeg.worldYScl; 
        this.rFoot.ang = 0.25 -0.5*tiptoeFact;
        this.lFoot.ang =  0.25 -0.5*tiptoeFact;

        this.lLeg.yScl = this.legMult;
        this.rLeg.yScl = this.legMult;
        this.rFoot.yScl = 1/this.legMult;
        this.lFoot.yScl = 1/this.legMult;

        this.reactionAlarm.update(dt);
        if(this.reactionAlarm.finished){
            this.setState("idle");
            this.reactionAlarm.stop();
        }

        this.hat.ang = -Math.PI/4 + 0.125 -0.25*tweenInOut(zloop(t, 13));



        this.body.update(dt);

    }

    pushDraw(){
        if(!this.visible) return;
        this.body.pushDraw();
    }

    draw(ctx){
        if(!this.visible) return;
    }
}

class Poster extends GameObject{
    constructor(x, y){
        super(x, y);

        this.scl = 5;

        this.sprite = new SpriteInstance(sprites[SPR.POSTERS], x, y);
        this.sprite.setScale(this.scl);
        this.sprite.setOrigin(0.5, 0.5);
    }

    update(dt){
        this.sprite.setPosition(this.x, this.y);
    }

    draw(ctx){
        if(!this.visible) return;
        this.sprite.draw(ctx);
    }

}

class HouseWindow extends GameObject {
    constructor(x, y){
        super(x, y);
        this.wid = 128;
        this.hei = 200;

        this.gridWid = this.wid*0.15;
        this.gridHei = this.hei*0.1;

        this.skyColors = [
            new Color(19, 0, 36),
            new Color(109, 49, 132),
            new Color(157, 119, 209),
            new Color(170, 233, 244),
            new Color(35, 110, 227),
            new Color(194, 116, 14),
            new Color(61, 47, 35)
        ];
        this.skyColorAlarm = new Alarm(36000);
        this.skyColorCSS = this.getSkyColor();

        this.depth = 1000;
    }

    getSkyColor(dayPerc = this.getDayPerc()){
        var index = this.skyColors.length * dayPerc;
        var gradPerc = index - Math.floor(index);

        console.log(index);
        var color1 = this.skyColors[Math.floor(index)];
        var color2 = this.skyColors[(Math.floor(index)+1)%this.skyColors.length];

        this.skyColor = Color.getInterpol(color1, color2, gradPerc).toCSS();
    }

    getDayPerc(){
        var now = new Date();
        var hours = now.getHours();
        return hours/24;
    }

    update(dt){
        this.skyColorAlarm.update(dt);
        if(this.skyColorAlarm.finished){
           
            this.getSkyColor();
            this.skyColorAlarm.restart();
        }

    }

    draw(ctx){
        if(!this.visible) return;

        ctx.fillStyle = this.skyColor;
        ctx.fillRect(this.x, this.y, this.wid, this.hei);

        // ctx.fillStyle = "rgb(52, 12, 63)"
        // ctx.fillRect(this.x, this.y, this.wid, this.hei);

        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(this.x + this.wid*0.5 - this.gridWid*0.5, this.y, this.gridWid, this.hei);
        ctx.fillRect(this.x, this.y + this.hei*0.5 - this.gridHei*0.5, this.wid, this.gridHei);
    }
}

class BigClock extends GameObject{
    constructor(x, y){
        super(x, y);

        var scl = 10;
        this.wid = 16*scl;
        this.hei = 48*scl;

        this.sprite = new SpriteInstance(sprites[SPR.BIGCLOCK], x, y);
        this.sprite.setScale(scl);
        this.sprite.setOrigin(0.5, 1);

        this.body = new AnimationNode(SPR.BIGCLOCK);
        this.body.x = x;
        this.body.y = y;
        this.body.setRelativePivot(0.5, 1);
        this.body.setScale(scl, scl);

        this.back = new AnimationNode(SPR.BIGCLOCK);

        this.back.sprite.setFrame(2);
        this.back.depth = 50;
        this.back.x = 8;
        this.back.y = 48;
        this.back.setRelativePivot(0.5, 1);
        this.body.addChild(this.back);

        this.pendulum = new AnimationNode(SPR.BIGCLOCK);
        this.pendulum.x = 8;
        this.pendulum.y = 24;
        this.pendulum.sprite.setFrame(1);
        this.pendulum.setPivot(8,24);
        this.pendulum.depth = 25;
        this.body.addChild(this.pendulum);

        this.hovered = false;

        this.visible = false;

        this.swingAlarm = new Alarm(65);
        this.swingSide = 0;

        this.hitCooldown = new Alarm(10);
    }

    swingPendulum(){
        if(!this.hitCooldown.finished) return;
        this.swingAlarm.restart();
        this.swingSide++;
        this.swingSide %= 2;
    }


    update(dt){
        this.swingAlarm.update(dt);
        this.sprite.setPosition(this.x, this.y);
        this.body.update(dt);
        this.hitCooldown.update(dt);

        this.body.setPosition(this.x, this.y);

        this.body.setScale(this.body.xScl, 10 + tweenOut(this.swingAlarm.percentage())*0.5);

        var swingDir = this.swingSide == 0 ? 1 : -1; 
        this.pendulum.setRotation((tweenInOut(this.swingAlarm.percentage())*swingDir + this.swingSide)*Math.PI/8     - Math.PI/16);

        if(!this.visible) return;
        this.hovered = this.sprite.pointInside(input.mouseX, input.mouseY);


        if(this.hovered && input.mouseState[0][1]){
            if(this.hitCooldown.finished){
                this.swingPendulum();
                SoundPlayer.play(SND.TICK);
                this.hitCooldown.restart();
            }
        }
    }

    pushDraw(ctx){
        this.body.pushDraw();
    }

    draw(ctx){
        if(!this.visible) return;

        // this.sprite.setFrame(2);
        // this.sprite.draw(ctx);

        // this.pendulum.draw(ctx);

        // this.sprite.setFrame(0);
        // this.sprite.draw(ctx);
    }
}

class FinishStar extends GameObject{
    constructor(x, y){
        super(x, y);

        this.wid = 64;
        this.hei = 64;

        this.sprite = new SpriteInstance(sprites[SPR.STAR], x, y);

        this.scl = this.wid/this.sprite.getSprWidth();
        this.sprite.setScale(this.scl);
        this.sprite.setOrigin(0.5, 0.5);



        this.hovered = false;

        this.visible = false;
        this.appear = false;

        this.clickAlarm = new Alarm(60);
        this.flipAct = new FlipActor(60);
    }

    update(dt){
        this.clickAlarm.update(dt);
        this.sprite.setPosition(this.x, this.y);
        this.sprite.setFrame(this.hovered ? 1: 0);

        this.flipAct.update(dt);
        this.sprite.setScale(this.scl*Math.cos(this.flipAct.phase*2), this.scl);

        if(!this.visible) return;
        if(!this.appear) return;
        this.hovered = this.sprite.pointInside(input.mouseX, input.mouseY);

        if(this.hovered && input.mouseState[0][1] && this.clickAlarm.finished){
            SoundPlayer.play(SND.MEOW);
            this.clickAlarm.restart();
            this.flipAct.flip();
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
class PeachKart{
    constructor(x, y, facing, state){
        this.x = x;
        this.y = y;

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





        manager.addDrawObject(this);
    }

    draw(ctx){
        this.sprite.draw(ctx);
    }
}



class PillDemo{
    constructor(x, y, state){
        this.x = x;
        this.y = y;

        this.pillGame = new DrMarioGame(14, 21);
    
        this.depth = 0;
        this.state = state;

        this.color1 = randInt(0, 5);
        this.color2 = randInt(0, 5);
        this.xpos = randInt(3, 8);

        this.pillGame.grid[this.pillGame.hei-1][this.xpos-3] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color1);
        this.pillGame.grid[this.pillGame.hei-1][this.xpos-2] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color1);
        this.pillGame.grid[this.pillGame.hei-1][this.xpos-1] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color1);
        this.pillGame.grid[this.pillGame.hei-1][this.xpos+2] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color2);
        this.pillGame.grid[this.pillGame.hei-1][this.xpos+3] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color2);
        this.pillGame.grid[this.pillGame.hei-1][this.xpos+4] = new DrMarioObj(DRMARIOTYPE.VIRUS, this.color2);

        this.pillGame.playerPill = this.pillGame.createPlayerPill(this.color1, this.color2);

        this.actionQueue = new ActionQueue();
        var moveDiff = this.xpos - Math.floor((this.pillGame.wid-1)*0.5);
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

       
    

        // switch(state){
        //     case 0:

                
        //         break;  

        //     case 1:

        //         break;  

        //     case 2:

        //         break;
        // }

      

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

        // if(this.state == 2 && Math.abs(this.hspd) < 0.04){
        //     this.active = false;
        //     manager.addParticle(particleExplosion(this.x, this.y));
        //     SoundPlayer.play(SND.EXPLOSION);
        // }

        // this.fadeAlarm.update(dt);
        // if(this.fadeAlarm.finished){
        //     this.alphaFlow.hide();
        //     this.fadeAlarm.stop();
        // }

        // this.alphaFlow.update(dt);
        // if(this.alphaFlow.state == 0) {
        //     this.active = false;
        // }

        manager.addDrawObject(this);
    }

    draw(ctx){
        var pillsWid = canvasWidth*0.4;
        var pillsHei = pillsWid*(this.pillGame.hei/this.pillGame.wid);
        this.pillGame.draw(this.x - pillsWid*0.5, this.y - (pillsWid/this.pillGame.wid)*2, pillsWid, pillsHei);
    }
}
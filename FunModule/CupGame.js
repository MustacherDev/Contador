class CupSwapAction extends Action {
    constructor(cupgame, ind1, ind2){
        super();
        this.cupGame = cupgame;
        this.cup1 = null;
        this.cup2 = null;
        this.started = false;
        this.aborted = false;
        this.ind1 = ind1;
        this.ind2 = ind2;
    }

    start(){
        this.started = true;
        if(this.cupGame.swapCups(this.ind1, this.ind2)){
            this.cup1 = this.cupGame.swapCup1;
            this.cup2 = this.cupGame.swapCup2;
        } else {
            this.aborted = true;
        } 
    }

    isFinished(){
        if(!this.started) return false;
        if(this.aborted) return true;
        return !this.cup1.moving && !this.cup2.moving;
    }
}

class CupSuspendAction extends Action {
    constructor(cup, enabled, duration, isPartial){
        super();
        this.cup = cup;
        this.suspend = enabled;
        this.duration = duration;

        this.isPartial = isPartial;

        this.aborted = false;
    }

    start(){
        // QUIT ACTION IF ALREADY AT DESIRED STATE
        this.aborted = true;

        if(this.isPartial){
            if(!this.cup.checkFlow(this.suspend, this.cup.partialFlow)) return;
        } else {
            if(!this.cup.checkFlow(this.suspend)) return;
        }

        if(this.cup.gone) return;
        this.aborted = false;


        if(this.isPartial){
            this.cup.setPartial(this.suspend);
        } else {
            this.cup.setSuspend(this.suspend);
        }
    }

    update(dt){
        this.duration -= dt;
    }

    isFinished(){
        if(this.aborted) return true;
        return (this.duration <= 0);
    }

}

class CupGameDemo extends BaseObject{
    constructor(x, y){
        super(x,y);
        this.cupGame = new CupGame(this.x, this.y);

        this.cupGame.objects = [];

        var state = randInt(0, 3);

        this.cupGame.knockout = true;

        this.cupGame.actionQueue.add(new WaitAction(50));
        this.cupGame.shuffleSteps = 10;
        this.cupGame.noStar = true;
     

        switch(state){
            case 0:
                this.cupGame.setCupItems([-1, 0, -1]);
                this.cupGame.setState(CUPGAMESTATE.SHUFFLE);
                this.cupGame.actionQueue.add(new WaitAction(80));
                this.cupGame.queueRandomGuess();
                
                break;
            case 1:
                this.cupGame.setCupItems([-1, -1, -1]);
                this.cupGame.shuffleSteps = 8;
                this.cupGame.setState(CUPGAMESTATE.SHUFFLE);
                this.cupGame.actionQueue.add(new WaitAction(80));
                this.cupGame.queueRandomGuess();
                break;
            case 2:
                {
                    var items = [];
                    for(var i = 0 ; i < 3; i++){
                        items.push(randInt(0, CupItem.typeNum));
                    }
                    this.cupGame.cupSwapDuration = 12;
                    this.cupGame.shuffleSteps = 8;
                    this.cupGame.setCupItems(items);
                    this.cupGame.setState(CUPGAMESTATE.SHUFFLE);
                    this.cupGame.actionQueue.add(new WaitAction(20));
                    this.cupGame.queueRandomGuess();
                }
                break;
            
        }
        
    }

    update(dt){
        this.cupGame.update(dt);

        if(this.cupGame.gone) this.active = false;
    }

    pushDraw(ctx){
        this.cupGame.pushDraw(ctx);
    }


}

const CUPGAMESTATE = Object.freeze(new Enum(
    "IDLE",
    "LOOP",
    "SHUFFLE",
    "GUESS",
    "REVEAL",
    "KNOCK",
    "RESTORE",
    "SHOWSHUFFLE",
    "TOTAL"
));

class CupGame extends ManagerObject {
    constructor(x, y) {
        super(x, y);

        this.cups = [];

        this.swapCup1 = null;
        this.swapCup2 = null;

        this.cupNum = 3;

        this.actionQueue = new ActionQueue();
        this.cupSwapDuration = 20;
        this.shuffleSteps = 10;

 

        this.state = CUPGAMESTATE.IDLE;

        this.guessCup = null;

        this.won = 0;

        this.spdLvl = 0;

        this.autoProgress = true;

        
        this.itemTypes = 5;

        this.starSprite = new SpriteInstance(sprites[SPR.STAR], 0, 0);
        this.starSprite.setScale(0.5);
        this.starSprite.setOrigin(0.5, 0.5);

        this.spotus = null;

        this.durFactor = 1;

        this.knockout = false;

        this.noStar = false;

        this.gone = false;

        

        this.initCups();
    }

    getItemSound(itemType){
        return this.itemSounds[itemType] ?? -1;
    }

    setCupItems(itemList){
        for(var i = 0; i < this.cups.length; i++){
            var itemId = itemList[i] ?? -1;
            if(itemId == -1) continue;

            var item = new CupItem(0,0);
            item.setType(itemId);
            this.cups[i].setContent(item);
        }
    }


    setState(state){
        this.state = state;
        switch(state){
            case CUPGAMESTATE.IDLE:
                break;
            case CUPGAMESTATE.LOOP:
                break;
            case CUPGAMESTATE.SHOWSHUFFLE:
                this.queueShowCupContent();
                this.queueHideCupContent();
                this.actionQueue.add(new CodeAction(()=>{this.setState(CUPGAMESTATE.SHUFFLE)}));
                break;
            case CUPGAMESTATE.SHUFFLE:
                this.generateSwaps();
                this.actionQueue.add(new CodeAction(()=>{this.setState(CUPGAMESTATE.GUESS)}));
                break;
            case CUPGAMESTATE.GUESS:
                break;
            case CUPGAMESTATE.REVEAL:
                break;
            case CUPGAMESTATE.RESTORE:
                this.actionQueue.add(new CodeAction(()=>{this.queueHideCupContent()}));
                if(this.knockout){
                    this.actionQueue.add(new CodeAction(()=>{this.queueKnockout()}));
                } else if(this.autoProgress){
                    this.actionQueue.add(new CodeAction(()=>{this.setState(CUPGAMESTATE.SHUFFLE)}));
                } else {
                    this.actionQueue.add(new CodeAction(()=>{this.setState(CUPGAMESTATE.IDLE)}));
                }
                break;
        }
    }

    receiveCupClick(cup){
        if(!this.actionQueue.isEmpty()) return;

        switch(this.state){
            case CUPGAMESTATE.IDLE:
                this.setState(CUPGAMESTATE.SHOWSHUFFLE);
                break;
            case CUPGAMESTATE.GUESS:
                this.tryGuessCup(cup);
                break;
            case CUPGAMESTATE.KNOCK:
                cup.knockDown();
                break;
        }
    }

    tryGuessCup(cup){
        this.guessCup = cup;
        if(!this.guessCup.content || (chance(0.4) && this.guessCup.content?.type != 0)){
             var item = new CupItem(0,0);
            cup.setContent(item);
            
            item.setType(randInt(1, CupItem.typeNum));
        }
        cup.revealCup();
        this.actionQueue.add(new WaitAction(20*this.durFactor));
        this.actionQueue.add(new CodeAction(()=>{this.checkGuessCup()}));
        this.actionQueue.add(new WaitAction(30*this.durFactor));
        this.actionQueue.add(new CodeAction(()=>{this.queueShowCupContent()}));
        this.actionQueue.add(new CodeAction(()=>{this.setState(CUPGAMESTATE.RESTORE)}));
    }

    queueRandomGuess(){
        this.actionQueue.add(new CodeAction(()=>{this.randomGuessCup()}));
    }

    randomGuessCup(){
        this.tryGuessCup(choose(this.cups));
    }

    checkGuessCup(){
        if(this.guessCup?.content?.type == 0){
            SoundPlayer.play(SND.CORRECT);
            this.won++;
            this.spdLvl++;
            this.durFactor -= 0.08;
            this.durFactor = clamp(this.durFactor, 0.7, 1);
            if(this.spotus){
                this.spotus.happyLevel = Math.floor(this.won*0.75);
                this.spotus.triggerImpress();
            }
            if(this.won >= 5){
                this.gameWon = true;
                manager.finishGame();
            }

            if(this.won >= 7){
                this.queueKnockout();
            }
        } else if(this.guessCup?.content == null){
            SoundPlayer.play(SND.WRONG);
            this.won--;
        } else {
            SoundPlayer.play(SND.POOF);
            if(this.spotus){
                this.spotus.triggerDisgust();
            }
        }
    }


    initCups(){
        for (let i = 0; i < this.cupNum; i++) {
            let cup = new CupCup(this.getCupX(i), this.y);
            cup.onClick = (cupClicked) => {this.receiveCupClick(cupClicked)};
            cup.cupManager = this;
            if(chance(0.01)) cup.type = 1;
            cup.setSlot(i);
            if(chance(0.1) || i == 1){
                var item = new CupItem(0,0);
                cup.setContent(item);
                item.setType(randInt(0, CupItem.typeNum));
                if(i == 1) item.setType(0);
            }

            
            this.cups.push(cup);

        }

        if(chance(0.5)){
            var spotus = new SpotusGuy(this.x-400, this.y+780);
            spotus.setHat(randInt(0, 3));
            spotus.setDepth(-10);

            spotus.owner = this;
            this.spotus = spotus;
            this.addObject(spotus);
        } else if(chance(0.5)) {
            var poster = new Poster(this.x+400, this.y-200);
            poster.depth = 10;
            poster.sprite.setRotation(randRange(-0.08, 0.08));
            this.addObject(poster);
        } else {
            var warnSign = new WarnSign(this.x+400, this.y+280);
            warnSign.depth = -100;
            warnSign.sprite.setRotation(randRange(-0.08, 0.08));
            this.addObject(warnSign);
        }
    }

    generateSwaps(){
        var swapNum = this.shuffleSteps;
        for(var i = 0 ; i < swapNum; i++){
            var cups = this.selectedRandomSlots();
            var action = new CupSwapAction(this, cups[0], cups[1]);
            this.actionQueue.add(action);
        }
    }

    queueShowCupContent(partial = false){
        for(var i = 0; i < this.cups.length; i++){
            let cup  = this.cups[i];
            this.actionQueue.add(new CupSuspendAction(cup, true, 25*this.durFactor, partial));
        }
        this.actionQueue.add(new WaitAction(40*this.durFactor));
    }

    queueHideCupContent(partial = false){
        for(var i = 0; i < this.cups.length; i++){
            let cup  = this.cups[i];
            this.actionQueue.add(new CupSuspendAction(cup, false, 25*this.durFactor, partial));
        }
        this.actionQueue.add(new WaitAction(40*this.durFactor));
    }

    queueKnockout(){
        for(var i = 0; i < this.cups.length; i++){
            let cup  = this.cups[i];
            this.actionQueue.add(new CodeAction(()=>{cup.knockDown(true)}));
            this.actionQueue.add(new WaitAction(5*this.durFactor));
        }
        this.actionQueue.add(new WaitAction(20*this.durFactor));
    }


    getCupSwapTime(){
        if(this.spdLvl >= 5) return 1;
        return this.cupSwapDuration*(1-tweenIn(this.spdLvl/6));
    }

    swapCups(ind1, ind2) {
        if (ind1 === ind2) return false;

        let cup1 = this.cups[ind1];
        let cup2 = this.cups[ind2];

        this.swapCup1 = cup1;
        this.swapCup2 = cup2;
        this.swapping = true;

        let x1 = this.getCupX(ind1);
        let x2 = this.getCupX(ind2);

        cup1.moveTo(x2, this.getCupSwapTime());
        cup2.moveTo(x1, this.getCupSwapTime());

        cup1.setSlot(ind2);
        cup2.setSlot(ind1);

        [this.cups[ind1], this.cups[ind2]] = [this.cups[ind2], this.cups[ind1]];
        return true;
    }

    selectedRandomSlots(){
        var ind1 = randInt(0, this.cupNum);
        var adv = randInt(1, this.cupNum);
        var ind2 = (ind1 + adv) % this.cupNum; 
        return [ind1, ind2];
    }



    getCupX(ind) {
        return this.x + ind * 200 - (this.cupNum-1)*200*0.5;
    }


    startGame(){
        this.waitingGuess = true;
        this.generateSwaps();
    }

    update(dt){
        
        this.actionQueue.update(dt);

        if(!this.gone) {
            if(this.state == CUPGAMESTATE.LOOP){
                if(this.actionQueue.isEmpty()){
                    this.queueShowCupContent();
                    this.queueHideCupContent();
                    this.generateSwaps();
                }
            }

            var cupAlive = false;
            for(var cup of this.cups){
                cup.update(dt);
                if(cupAlive) continue;
                if(!cup.gone || cup.content){
                    cupAlive = true;
                }
            }

            if(!cupAlive) {
                this.gone = true;
                this.cups = [];
                this.actionQueue.clear();
                
                if(this.spotus) this.spotus.happyLevel = 5;
            }
        }



        this.updateObjects(dt);
    }

    pushDraw(ctx){

        manager.addDrawObject(this, 50);

        this.pushDrawObjects();

        for(var cup of this.cups){
            cup.pushDraw(ctx);
        }


    }

    draw(ctx){
        if(this.noStar) return;
        for(var i = 0 ; i < this.won; i++){
            var perc = (i/4);
            var xx = this.x -400 + perc*800;
            var yy = this.y - 150 -tweenOut(zigzag(perc))*200;
            this.starSprite.setPosition(xx, yy);
            this.starSprite.draw(ctx);
        }
    }



    
}

class CupCup extends GameObject{
    constructor(x, y){
        super(x,y);
        this.cupManager = null;
        this.sprite = new SpriteInstance(sprites[SPR.CUP], this.x, this.y, 0);

        this.scl = 5;
        this.sprite.setScale(this.scl);
        this.sprite.setOrigin(0.5, 1);

        this.moving = false;
        this.movingToX = 0;
        this.movingFromX = 0;
        this.moveAlarm = new Alarm(50);
        this.moveYDisplace = 50;

        this.suspendYDisplace = 150;
        this.suspendFlow = new StateFlow(0, 50);

        this.partialYDisplace = 25;
        this.partialFlow = new StateFlow(0, 25);

        this.onClick = null;
        this.hovered = false;

        this.gone = false;
        this.goneHold = 0;

        this.content = null;

        

        this.type = 0;

        this.slot = -1;
    }

    setSlot(slotIndex){
        this.slot = slotIndex;
    }

    setContent(obj){
        this.content = obj;
        obj.owner = this;
    }

    setSuspend(enabled){
        if(enabled) {
            this.suspendFlow.trigger();
        } else {
            this.suspendFlow.hide();
        }
    }

    setPartial(enabled){
        if(enabled) {
            this.partialFlow.trigger();
        } else {
            this.partialFlow.hide();
        }
    }

    checkFlow(enabled, flow = this.suspendFlow){
        if(flow.state == enabled*2) return false;
        return true;
    }

    revealCup(){
        this.suspendFlow.trigger();
        if(this.content) this.content.startReact(this.suspendFlow.stateTime);
    }

    moveTo(x, duration = 50){
        this.moveAlarm.setDuration(Math.max(duration, 1));
        this.moveAlarm.restart();
        this.moving = true;

        this.movingFromX = this.x;
        this.movingToX = x;
    }

    knockDown(knockContent = false){
        if(this.gone) return;
        var part = particleCup(this.x, this.y - this.sprite.getHeight()*0.5);
        part.spd.x = 4;
        part.spd.y = -4;
        part.acc.y = 0.3;
        part.angleSpd = 0.05;
        part.sprite.setOrigin(0.5, 0.5);
        manager.addParticle(part);



        if(knockContent && this.content){
            part = particleCupItem(this.x, this.y - this.sprite.getHeight()*0.5);
            part.spd.x = -1 + + randRange(-1, 1);
            part.spd.y = -5 + randRange(-1, 1);
            part.acc.y = 0.15;
            part.angleSpd = 0.04 + randRange(-0.05, 0.05);
            part.sprite.setOrigin(0.5, 0.5);
            part.img = this.content.getFrame();
            manager.addParticle(part);

            this.content = null;
        }




        this.gone = true;
        this.goneHold = 2;
    }



    update(dt){

        this.suspendFlow.update(dt);
        this.partialFlow.update(dt);

        var jumpY = 0;
        var suspendY = tweenInOut(this.suspendFlow.progress)*this.suspendYDisplace;
        var partialY = tweenInOut(this.partialFlow.progress)*this.partialYDisplace;
        

        if(this.moving){
            this.moveAlarm.update(dt);
            var t = this.moveAlarm.percentage();

            this.x = this.movingFromX *(1-t) + this.movingToX*(t);
            jumpY = tweenInOut(zigzag(t))*this.moveYDisplace*sign(this.movingToX-this.movingFromX);
            this.depth = jumpY;

            if(this.moveAlarm.finished){
                this.moving = false;
            }
        }
        this.sprite.setPosition(this.x, this.y - jumpY - suspendY - partialY);

        this.hovered = this.sprite.pointInside(input.mouseX, input.mouseY);
        if(this.hovered){
            this.sprite.setFrame(this.type*2 + 1);
        } else {
            this.sprite.setFrame(this.type*2);
        }

        if(this.hovered){
            if(input.mouseState[0][1]) {
                this.onClick?.(this);
            }
        }

        if(this.content){
            this.content.x = this.x;
            this.content.y = this.y - jumpY - this.scl;
            this.content.update(dt);
        }

        if(this.gone) this.goneHold--;
    }

    draw(ctx){
        if(!this.visible) return;
        if(this.content) this.content.draw(ctx);
        
        if(!this.gone || this.goneHold > 0) this.sprite.draw(ctx);
    }
}



class CupItem extends GameObject{

    static typeNum = 9;
    static soundList = [-1, SND.UFO, SND.DOGBARK, SND.BOING, SND.CHICKEN];

    constructor(x, y){
        super(x,y);
        this.owner = null;
        this.sprite = new SpriteInstance(sprites[SPR.CUPITEM], this.x, this.y);
        this.sprite.setScale(5);
        this.sprite.setOrigin(0.5, 1);

        this.img = 0;
        this.imgSpd = 0.1;

        this.type = 0;

        this.reactAlarm = new Alarm(50);
        this.reactAlarm.stop();
        this.soundAlarm = new Alarm(10);
        this.soundAlarm.stop();
    }


    getSound(){
        if(this.type >= CupItem.soundList.length) return -1;
        return CupItem.soundList[this.type];
    }

    updateFrame(){
        this.sprite.setFrame(this.getFrame());
    }

    getFrame(){
        return Math.floor(this.img) + this.type*4;
    }

    setType(type){
        this.type = type;
        this.updateFrame();
    }
 
    update(dt){
        this.img += this.imgSpd*dt;
        this.img %= 4;
        
        this.updateFrame();
        this.sprite.setPosition(this.x, this.y);

        this.reactAlarm.update(dt);
        this.soundAlarm.update(dt);

        
        if(this.reactAlarm.finished){
            this.reactAlarm.stop();
            this.imgSpd = 0.1;
            this.soundAlarm.start();
        }

        if(this.soundAlarm.finished){
            this.soundAlarm.stop();
            var sound = this.getSound(this.type);
            if(sound != -1) SoundPlayer.play(sound);
        }
    }

    startReact(duration){
        this.reactAlarm.setDuration(Math.max(duration, 1));
        this.reactAlarm.start();
        this.imgSpd = 0;
    }

    draw(ctx){
        if(!this.visible) return;
        this.sprite.draw(ctx);
    }
}

class CupBomb extends GameObject{
    constructor(x, y){
        super(x,y);
        this.owner = null;
        this.sprite = new SpriteInstance(sprites[SPR.BOMB], this.x, this.y);
        this.sprite.setScale(5);
        this.sprite.setOrigin(0.5, 1);

        this.type = 0;
    }


    setType(type){
        this.type = type;
        this.sprite.setFrame(this.type);
    }
 
    update(dt){
        this.sprite.setFrame(this.type);
        this.sprite.setPosition(this.x, this.y);
    }

    draw(ctx){
        if(!this.visible) return;
        this.sprite.draw(ctx);
    }
}


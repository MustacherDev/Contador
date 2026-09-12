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

class CupGameDemo extends BaseObject{
    constructor(x, y){
        super(x,y);
        this.cupGame = new CupGame(this.x, this.y);

        
    }
}

class CupGame extends BaseObject {
    constructor(x, y) {
        super(x, y);

        this.cups = [];

        this.swapCup1 = null;
        this.swapCup2 = null;

        this.cupNum = 3;

        this.actionQueue = new ActionQueue();
        this.cupSwapDuration = 20;

        this.initCups();
        this.showCupContent();
        this.hideCupContent();

        this.loop = false;
    }

    initCups(){
        for (let i = 0; i < this.cupNum; i++) {
            let cup = new CupBall(this.getCupX(i), this.y);
            if(chance(0.1)) cup.sprite.setFrame(1);
            cup.setSlot(i);

            var item = new CupItem(0,0);
            item.sprite.setFrame(randInt(0, 2));
            cup.setContent(item);
            
            this.cups.push(cup);
        }
    }

    generateSwaps(){
        var swapNum = 10;
        for(var i = 0 ; i < swapNum; i++){
            var cups = this.selectedRandomSlots();
            var action = new CupSwapAction(this, cups[0], cups[1]);
            this.actionQueue.add(action);
        }
    }

    showCupContent(){
        for(var i = 0; i < this.cups.length; i++){
            let cup  = this.cups[i];
            var action = new CodeAction(() => {cup.setSuspend(true);});
            this.actionQueue.add(action);
            this.actionQueue.add(new WaitAction(25));
        }
        this.actionQueue.add(new WaitAction(40));
    }

    hideCupContent(){
        for(var i = 0; i < this.cups.length; i++){
            let cup  = this.cups[i];
            var action = new CodeAction(() => {cup.setSuspend(false)});
            this.actionQueue.add(action);
            this.actionQueue.add(new WaitAction(25));
        }
        this.actionQueue.add(new WaitAction(40));
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

        cup1.moveTo(x2, this.cupSwapDuration);
        cup2.moveTo(x1, this.cupSwapDuration);

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

    update(dt){

        this.actionQueue.update(dt);

        if(this.loop){
            if(this.actionQueue.isEmpty()){
                this.generateSwaps();
                this.showCupContent();
                this.hideCupContent();
            }
        }

        for(var cup of this.cups){
            cup.update(dt);
        }
    }

    pushDraw(){
        for(var cup of this.cups){
            cup.pushDraw(ctx);
        }
    }

    draw(ctx){

    }



    
}

class CupBall extends GameObject{
    constructor(x, y){
        super(x,y);
        this.owner = null;
        this.sprite = new SpriteInstance(sprites[SPR.CUP], this.x, this.y, 0);
        this.sprite.setScale(5);
        this.sprite.setOrigin(0.5, 1);

        this.moving = false;
        this.movingToX = 0;
        this.movingFromX = 0;
        this.moveAlarm = new Alarm(50);
        this.moveYDisplace = 50;

        this.suspendYDisplace = 150;
        this.suspendFlow = new StateFlow(0, 50);

        this.content = null;

        this.slot = -1;
    }

    setSlot(slotIndex){
        this.slot = slotIndex;
    }

    setContent(obj){
        this.content = obj;
    }

    setSuspend(enabled){
        if(enabled) return this.suspendFlow.trigger();
        this.suspendFlow.hide();
    }

    moveTo(x, duration = 50){
        this.moveAlarm.setDuration(duration);
        this.moveAlarm.restart();
        this.moving = true;

        this.movingFromX = this.x;
        this.movingToX = x;
    }

    update(dt){

        this.suspendFlow.update(dt);

        var jumpY = 0;
        var suspendY = tweenInOut(this.suspendFlow.progress)*this.suspendYDisplace;
        

        if(this.moving){
            this.moveAlarm.update(dt);
            var t = this.moveAlarm.percentage();

            this.x = this.movingFromX *(1-t) + this.movingToX*(t);
            jumpY = tweenOut(zigzag(t))*this.moveYDisplace*sign(this.movingToX-this.movingFromX);
            this.depth = jumpY;

            if(this.moveAlarm.finished){
                this.moving = false;
            }
        }
        this.sprite.setPosition(this.x, this.y - jumpY - suspendY);

        if(this.content){
            this.content.x = this.x;
            this.content.y = this.y - jumpY;
            this.content.update(dt);
        }
    }

    draw(ctx){
        this.content.draw(ctx);
        this.sprite.draw(ctx);
    }
}

class CupItem extends GameObject{
    constructor(x, y){
        super(x,y);
        this.owner = null;
        this.sprite = new SpriteInstance(sprites[SPR.CUPITEM], this.x, this.y);
        this.sprite.setScale(5);
        this.sprite.setOrigin(0.5, 1);
    }

 
    update(dt){
        this.sprite.setPosition(this.x, this.y);
    }

    draw(ctx){
        if(!this.visible) return;
        this.sprite.draw(ctx);
    }
}


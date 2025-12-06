// TYPE 0 = SPOTLIGHT
// TYPE 1 = FADEOUT FADEIN
// TYPE 2 = IMAGE DROP

class ManagerCommand{
    constructor(){
        this.triggerTime = 0;
        
        this.commandId = 0;
        this.parameter = null;
    }

    trigger(){
        return manager.command(this.commandId, this.parameter);
    }
}

class SceneCommmand{
    constructor(){

        this.triggerTime = 0;

        this.objType = null;
        this.obj = null;
        
        this.commandId = 0;
        this.parameter = null;
    }

    trigger(){
        if(this.objType){
            var obj = manager.search.getFirstObjByType(this.objType);
            if(obj){
                obj.command(this.commandId, this.parameter);
                return true;
            }
        } else if (this.obj){
            this.obj.command(this.commandId, this.parameter);
            return true;
        }
        return false;
    }
}


class Transition {
    constructor(duration, isBackwards = false){
        this.duration = duration;
        this.timer = 0;

        // MORE USED FOR THE SPOTLIGHT SPECIFICALLY
        this.focusX = 0;
        this.focusY = 0;

        this.finished = false;

        this.isBackwards = isBackwards;

        this.progress = this.isBackwards?1:0;

        
        this.playerControlCooldown = 0;

        this.commands = [];
    }

    updateTransition(dt){
        this.timer += dt;
        if(this.timer >= this.duration){
            this.finished = true;
        }

        var perc = this.timer/this.duration;

        this.progress = this.isBackwards ? 1-perc: perc;

        // EXECUTES COMMANDS AT THEIR TRIGGER TIMES
        for(var i = 0 ; i < this.commands.length; i++){
            var command = this.commands[i];
            if(this.timer >= command.triggerTime){
                if(command.trigger()){
                    this.commands.splice(i, 1);
                    i--;
                }
            }
        }

        // TAKES AWAY PLAYER CONTROL AND GIVES IT BACK ONCE THE COOLDOWN ENDS
        // ONLY DOES THIS IN ROOM ENTERING TRANSITIONS
        if(this.isBackwards){
            if(this.playerControlCooldown >= 0){
                this.playerControlCooldown -= dt;
                manager.setPlayerControl(false);
                if(this.playerControlCooldown < 0){
                    manager.setPlayerControl(true);
                }
            }
        }
    }

    update(dt){
        this.updateTransition(dt);
    }

    draw(ctx){

    }
}

class TransitionSpotlight extends Transition{
    constructor(spotSprite, duration, isBackwards = false){
        super(duration, isBackwards);
        this.spotlight = new Spotlight();
        this.spotlight.active = true;

        this.spotlight.sprite = spotSprite;

        this.spotExtent = 5000;

        this.spotlight.width = this.isBackwards ? 0 : this.spotExtent;
        this.spotlight.height = this.isBackwards ? 0 : this.spotExtent;

        this.spotlight.x = 0;
        this.spotlight.y = 0;
    }

    update(dt){
        this.updateTransition(dt);

        this.spotlight.x = this.focusX;
        this.spotlight.y = this.focusY;

        this.spotlight.width  = this.spotExtent*tweenIn(1-this.progress);
        this.spotlight.height = this.spotExtent*tweenIn(1-this.progress);

        this.spotlight.update(dt);
    }

    draw(ctx){
        this.spotlight.draw(ctx);
    }
}


class TransitionFade extends Transition{
    constructor(duration, isBackwards = false){
        super(duration, isBackwards);
    }

    draw(ctx){
        ctx.fillStyle = "rgba(0,0,0," + this.progress + " )";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
}

class TransitionCeleste extends Transition{
    constructor(duration, isBackwards = false){
        super(duration, isBackwards);


    }

    draw(ctx){

       
        var bars = 5;
        var barHei = canvasHeight/bars;
        var barXOff = canvasWidth/bars;

        var prog = this.progress;
        if(this.isBackwards){
            prog = 2-this.progress;
        }

        for(var i = 0; i < bars; i++){
            var xx = -barXOff*i + 2*prog*canvasWidth - canvasWidth*2;
            var yy = barHei*i;
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect(xx, yy, canvasWidth*2, barHei);
        }

    }
}

class TransitionImageMove extends Transition{
    constructor(sprite, duration, isBackwards = false){
        super(duration, isBackwards);
        this.sprite = sprite;
        this.xScl = 1;
        this.yScl = 1;
        this.scale2Overflow();
    }

    scale2Overflow() {
        var ratX = canvasWidth / this.sprite.width;
        var ratY = canvasHeight / this.sprite.height;
    
        var rat = Math.max(ratX, ratY);
        this.xScl = rat;
        this.yScl = rat;
      }
    

    draw(ctx){
        this.sprite.drawExtRelative(this.progress*this.sprite.width*this.xScl, 0, 0, this.xScl, this.yScl, 0, 1, 0);
    }
}

class TransitionSpotlightStart extends TransitionSpotlight {
    constructor(){
        super(sprites[SPR.SPOTHOLE], 500, true);

        var command = new SceneCommmand();
        command.objType = OBJECT.TURNIPBOY;
        command.commandId = 0;
        command.parameter = 75;
        command.triggerTime = 100;
        this.commands.push(command);

        var command2 = new ManagerCommand();
        command2.commandId = 0;
        command2.parameter = 0;
        command2.triggerTime = 350;
        this.commands.push(command2);

        this.spotlight.width = 0;
        this.spotlight.height = 0;

        this.playerControlCooldown = 175;
    }

    update(dt){
        this.updateTransition(dt);

        this.spotlight.x = this.focusX;
        this.spotlight.y = this.focusY;

        var prog = 1-this.progress;

        var ext = 0;
        if(prog < 0.025){
            ext = 0.025*(prog)/0.025;
        } else if(prog < 0.5){
            ext = 0.025;
        } else {
            ext = Math.max(((prog)-0.5)*2, 0.025);
        }

        this.spotlight.width  = this.spotExtent*ext;
        this.spotlight.height = this.spotExtent*ext;

        this.spotlight.update(dt);
    }
}

class TransitionReventure extends Transition{
    constructor(duration, isBackwards = false){
        super(duration, isBackwards);


    }

    draw(ctx){

        var remainSpace = 0;
        var holdTimePerc = 0.5; 

        var prog = Math.min(this.progress*(1+holdTimePerc), 1);
        var barsSpace =  tweenOut(1-prog)*((canvasHeight/2) - remainSpace);
        
        ctx.fillStyle = "rgb(20, 20, 40)";
        ctx.fillRect(0, -barsSpace - canvasHeight*0.1, canvasWidth, 2+ canvasHeight*0.6);
        ctx.fillRect(0, (canvasHeight/2) +barsSpace - 2, canvasWidth, canvasHeight*0.6);
    }
}


class TransitionCalatro extends Transition{
     constructor(duration, isBackwards = false){
        super(duration, isBackwards);

    }

    draw(ctx){

        var size = this.progress*720; 

        ctx.fillStyle = "rgb(0,0,0)";

        ctx.save();
        ctx.translate(canvasWidth/2, canvasHeight/2);
        ctx.rotate(deg2rad(30));
        ctx.fillRect(-size, -size, size*2, size*2);
        ctx.restore();

    }
}


class RoomTransition {
    constructor() {
        
        this.startTrans = null;
        this.endTrans   = null;

        // // TYPE 0
        // // SPOTLIGHT

        // // TYPE 1
        // // FADEOUT FADEIN

        // ROOM TRANSITION INFORMATION
        this.nextRoomId = -1;

        // PLAYER TRANSPORTATION
        this.bringPlayer = false;
        this.playerX = 0;
        this.playerY = 0;
        this.playerFacing = 1;

        // SCALING VIEW
        this.viewSclModX = 1;
        this.viewSclModY = 1;

        this.flipView = true;

        // MUSIC
        this.supressMusic = false;

        // TRANSITION STATE VARIABLES
        // "CANCHANGE" SIMBOLIZES TO THE MANAGER THAT THE ROOM CAN BE SWAPED
        this.canChange = false;
        this.changed   = false;
        this.finished  = true;

        // TRANSITION OBJECT FOCUS
        this.startFocusObj = null;
        this.endFocusObj   = null;

        this.startPlayerFocus = false;
        this.endPlayerFocus = false;
    }

    setPlayerSpotlight(time = 100, isStart = true){

        if(isStart){
            this.startPlayerFocus = true;
            this.startTrans = new TransitionSpotlight(sprites[SPR.SPOTHOLE], time);
        } else {
            this.endPlayerFocus = true;
            this.endTrans = new TransitionSpotlight(sprites[SPR.SPOTHOLE], time, true);
        }
    }

    startPlayerTransition(nextRoomId, tileX, tileY, facing = 1){
        if(this.finished){
            this.startTransition(50, nextRoomId, sprites[SPR.SPOTSTAR]);
            this.setPlayerTile(tileX, tileY, facing);
            this.setPlayerFollowers();
            manager.gameSpeedState = 3;
            
        }
    }

    startTransition(time, nextRoomId, spr) {
        if (!this.finished) return false; 

        this.followPlayer = false;

        this.finished = false;
        this.canChange = false;
        this.changed = false;

        this.flipView = false;

        this.startTrans = new TransitionFade(time*0.5, false);
        this.endTrans   = new TransitionFade(time*0.5, true);

        this.startPlayerFocus = true;
        this.endPlayerFocus   = true;

        this.bringPlayer = true;
        this.supressMusic = false;
        this.nextRoomId = nextRoomId;

        if(playingMusic != roomMusic[this.nextRoomId]){
            fadeMusic(playingMusic, 1000);
        }

        return true;
    }

    setPlayerState(playerX, playerY, playerFacing = 1) {
        this.playerX = playerX;
        this.playerY = playerY;
        this.playerFacing = playerFacing;
    }

    setPlayerTile(tileX, tileY, playerFacing = 1) {
        if (this.nextRoomId == -1) {
            console.log("SetPlayerTile: NEXT ROOM ID NULL");
            return;
        }

        var tileMap = manager.rooms[this.nextRoomId].tileMap;
        if (tileMap) {
            var pos = tileMap.tile2xy(tileX, tileY);
            this.playerX = pos.x;
            this.playerY = pos.y;
        }
        this.playerFacing = playerFacing;
    }

    setFollowers(startObj, endObj) {
        this.startFocusObj = startObj;
        this.endFocusObj = endObj;
    }

    setPlayerFollowers() {
        this.startPlayerFocus = true;
        this.endPlayerFocus   = true;
    }

    updateStartFocusPos(){
        if(this.startPlayerFocus){
            var player = manager.getRoomPlayer();
            if(!player)  return false;
            if(!manager.mainCam)  return false;

            var pos = manager.mainCam.viewPos(player.x, player.y);

            this.startTrans.focusX = pos.x;
            this.startTrans.focusY = pos.y;
        } else {
            if(!this.startFocusObj) return false;
            if (!manager.mainCam) return false;

            var pos = manager.mainCam.viewPos(this.startFocusObj.x, this.startFocusObj.y);
            this.startTrans.focusX = pos.x;
            this.startTrans.focusY = pos.y;
        }

        return true;
    }

    updateEndFocusPos(){
        if(this.endPlayerFocus){
            var player = manager.getRoomPlayer();
            if(!player)  return false;
            if(!manager.mainCam)  return false;

            var pos = manager.mainCam.viewPos(player.x, player.y);

            this.endTrans.focusX = pos.x;
            this.endTrans.focusY = pos.y;
        } else {
            if(!this.endFocusObj) return false;
            if (!manager.mainCam) return false;

            var pos = manager.mainCam.viewPos(this.endFocusObj.x, this.endFocusObj.y);
            this.endTrans.focusX = pos.x;
            this.endTrans.focusY = pos.y;
        }

        return true;
    }

    update(dt) {
        if (this.finished) return;

        if(this.canChange){
            this.changed = true;
            this.canChange = false;
        }

        if(this.flipView){
            if(!this.changed){
                this.viewSclModX = 1-tweenIn(this.startTrans.progress);
            } else {
                this.viewSclModX = 1-tweenIn(this.endTrans.progress);
            }

            manager.mainCam.setSclMod(this.viewSclModX, this.viewSclModY);
        } 

        if(!this.changed){
            this.updateStartFocusPos();
            this.startTrans.update(dt);
            if(this.startTrans.finished){
                this.canChange = true;
            }
        } else {
            if(!this.updateEndFocusPos()){
                //console.log("MAIS QUE ANIMAL");
            }
            this.endTrans.update(dt);
            if(this.endTrans.finished){
                this.finished = true;
            }
        }

    }

    draw(ctx) {
        if (this.finished) return;

        if(!this.changed){
            this.startTrans.draw(ctx);
        } else {
            this.endTrans.draw(ctx);
        }
    }
}



class ScreenTransition {
    constructor() {
        this.startTrans = null;
        this.endTrans   = null;

        // // TYPE 0
        // // SPOTLIGHT

        // // TYPE 1
        // // FADEOUT FADEIN

        // TRANSITION STATE VARIABLES
        // "CANCHANGE" SIMBOLIZES TO THE MANAGER THAT THE ROOM CAN BE SWAPED
        this.canChange = false;
        this.changed   = false;
        this.finished  = true;

        // TRANSITION OBJECT FOCUS
        this.startFocusObj = null;
        this.endFocusObj   = null;

        this.startPlayerFocus = false;
        this.endPlayerFocus = false;
    }

    startPlayerTransition(){
        if(this.finished){
            this.startTransition(50);
            this.setPlayerFollowers();
            manager.gameSpeedState = 3;
        }
    }

    startTransition(time) {
        if (!this.finished) return false; 

        this.followPlayer = false;

        this.finished = false;
        this.canChange = false;
        this.changed = false;

        this.startTrans = new TransitionCeleste(time*0.5, false);
        this.endTrans   = new TransitionCeleste(time*0.5, true);

        this.startPlayerFocus = true;
        this.endPlayerFocus   = true;

        return true;
    }


    setFollowers(startObj, endObj) {
        this.startFocusObj = startObj;
        this.endFocusObj = endObj;
    }

    setPlayerFollowers() {
        this.startPlayerFocus = true;
        this.endPlayerFocus   = true;
    }

    updateStartFocusPos(){
        if(this.startPlayerFocus){
            var player = manager.getRoomPlayer();
            if(!player)  return false;
            if(!manager.mainCam)  return false;

            var pos = manager.mainCam.viewPos(player.x, player.y);

            this.startTrans.focusX = pos.x;
            this.startTrans.focusY = pos.y;
        } else {
            if(!this.startFocusObj) return false;
            if (!manager.mainCam) return false;

            var pos = manager.mainCam.viewPos(this.startFocusObj.x, this.startFocusObj.y);
            this.startTrans.focusX = pos.x;
            this.startTrans.focusY = pos.y;
        }

        return true;
    }

    updateEndFocusPos(){
        if(this.endPlayerFocus){
            var player = manager.getRoomPlayer();
            if(!player)  return false;
            if(!manager.mainCam)  return false;

            var pos = manager.mainCam.viewPos(player.x, player.y);

            this.endTrans.focusX = pos.x;
            this.endTrans.focusY = pos.y;
        } else {
            if(!this.endFocusObj) return false;
            if (!manager.mainCam) return false;

            var pos = manager.mainCam.viewPos(this.endFocusObj.x, this.endFocusObj.y);
            this.endTrans.focusX = pos.x;
            this.endTrans.focusY = pos.y;
        }

        return true;
    }

    update(dt) {
        if (this.finished) return;


        if(!this.changed){
            this.updateStartFocusPos();
            this.startTrans.update(dt);
            if(this.startTrans.finished){
                this.canChange = true;
                this.changed = true;
            }
        } else {
            this.updateEndFocusPos();
            this.endTrans.update(dt);
            if(this.endTrans.finished){
                this.finished = true;
            }
        }

    }

    draw(ctx) {
        if (this.finished) return;

        if(!this.changed){
            this.startTrans.draw(ctx);
        } else {
            this.endTrans.draw(ctx);
        }
    }
}
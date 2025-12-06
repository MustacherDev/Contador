


class Flags {
    constructor() {
        this.thing = false;
    }
}

class PersistentObjects {
    constructor() {
        this.player = null;

        this.calatro = null;
    }
}

class GameManager {
    constructor() {

        this.cams = [mainCam];
        this.mainCam = mainCam;
        this.drawingCam = mainCam;
        this.mainCam.doesClipping = true;

        this.camFollowX = 0;
        this.camFollowY = 0;
        this.camFollowPerc = 0.05;
        this.camFollowing = false;

        this.drawList = [];
        this.drawGUIList = [];

        this.mouseX = 0;
        this.mouseY = 0;

        this.holdingObject = null;

        this.prevMousePos = [];
        this.prevMousePosNumber = 5;

        this.gameSpeed = 1;

        this.startAlarm = new Alarm(0, 100);


        //this.screenBorder = new ScreenBorder();

        this.titleUpdateAlarm = new Alarm(0, 50);
        this.titles = ["CONTADOR", "cONTADOR", "CoNTADOR", "COnTADOR", "CONtADOR", "CONTaDOR", "CONTAdOR", "CONTADoR", "CONTADOr"];
        this.titleInd = 0;

        this.flags = new Flags();

        this.persistent = new PersistentObjects();


        this.state = 0;

        this.particles = [];

        this.search = null;

        this.rooms = [];
        this.mainRoom = null;

        this.roomTransition = new RoomTransition();
        this.screenTransition = new ScreenTransition();
        this.isChangingRoom = false;
        this.nextRoom = null;

        this.loopingMusic = -1;
        this.loopingMusicId = -1;
      

        this.screenShaker ;

    }

    init() {
        console.log("INITED");

        this.screenShaker = new ScreenShaker(this.mainCam);
        this.search = new ObjectSearchManager();
        // ROOMS
        //TEST ROOM
        var room = new Room(canvasWidth, canvasHeight);
        room.backgroundColor = Color.fromCSS("rgba(0, 0, 0, 1)");
        this.rooms.push(room);

        this.persistent.tower = new TowerHolder();
        room.addObject(this.persistent.tower);
        this.mainRoom = room;

        //NAT ROOM
        var roomNat = new Room(canvasWidth, canvasHeight);
        roomNat.id = ROOM.NAT;
        roomNat.backgroundColor = Color.fromCSS("rgba(0, 0, 0, 1)");
        this.rooms.push(roomNat);

        var cat = new CatThing(canvasWidth*0.5, canvasHeight*0.5);
        roomNat.addObject(cat);
        var food = new CatFood(canvasWidth*0.15, canvasHeight*0.85);
        roomNat.addObject(food);

        var calendar = new Calendar(canvasWidth*0.85, canvasHeight*0.85);
        roomNat.addObject(calendar);
        calendar.day = 1;

        var balloonZombie = new BalloonZombie(canvasWidth*0.5, canvasHeight*1.85);
        roomNat.addObject(balloonZombie);

 

        //DAN ROOM
        var roomDan = new Room(canvasWidth, canvasHeight);
        roomDan.id = ROOM.DAN;
        roomDan.backgroundColor = Color.fromCSS("rgba(0, 0, 0, 1)");
        this.rooms.push(roomDan);

        var objMSpin = new RenderObject(canvasWidth*0.5, canvasHeight*0.5, sprites[SPR.MONKEYSPIN]);
        objMSpin.imgSpd = 0.07;
        roomDan.addObject(new GameObjectWrapper(objMSpin));

        var calendar2 = new Calendar(canvasWidth*0.85, canvasHeight*0.85);
        roomDan.addObject(calendar2);
        calendar2.day = 0;

        var monkey = new MonkeyThing(canvasWidth*0.5, canvasHeight*0.5);
        roomDan.addObject(monkey);
        var banana = new Banana(canvasWidth*0.15, canvasHeight*0.85);
        roomDan.addObject(banana);

      

    }


    resolveRoomChange(){
      
        this.mainRoom = this.nextRoom;
        this.nextRoom = null;
        this.isChangingRoom = false;

        
        // MUSIC TRANSITION
        if(true){
            if(roomMusic[this.mainRoom.id] != -1 && roomMusic[this.mainRoom.id] != playingMusic && !this.roomTransition.supressMusic){
                playMusic(roomMusic[this.mainRoom.id]); 
            }
        }


        this.gameSpeed = 1;
    }

    getRoomPlayer(){
        return null;
    }

    setPlayerControl(bool){
        return;
    }

    update(dt) {


        // ROOM CHANGE
        if (this.isChangingRoom) {
            this.resolveRoomChange();
        }

        if (this.roomTransition.canChange) {
            this.changeRoom(this.roomTransition.nextRoomId);
        }

        this.roomTransition.update(dt);
        this.screenTransition.update(dt);

        // GAME STATES
        if (this.mainRoom) {
            this.state = this.mainRoom.id;
        }


        // ROOMS UPDATE CODE
        //roomUpdateCode(dt);


        // MAIN CAMERA MOVEMENT
        if (this.mainCam) {

            this.screenShaker.update(dt);

            var worldPos = this.mainCam.worldPos(input.mouseViewX, input.mouseViewY);
            this.mouseX = worldPos.x;
            this.mouseY = worldPos.y;

            // if (!this.editor.editing) {
            //     if (this.camFollowing) {
            //         var perc = this.camFollowPerc;
            //         this.mainCam.x += (((1 - perc) * this.mainCam.x + this.camFollowX * perc) - this.mainCam.x) * dt;
            //         var camWid = this.mainCam.width / this.mainCam.scale;
            //         this.mainCam.x = clamp(this.mainCam.x, camWid / 2, this.mainRoom.width - camWid / 2);

            //         perc *= 0.5;
            //         this.mainCam.y += (((1 - perc) * this.mainCam.y + this.camFollowY * perc) - this.mainCam.y) * dt;
            //         var camHei = this.mainCam.height / this.mainCam.scale;
            //         this.mainCam.y = clamp(this.mainCam.y, camHei / 2, this.mainRoom.height - camHei / 2);
            //     }
            // } else {
                // CAMERA MOVING
                var camMoveX = 0;
                var camMoveY = 0;
                var camZoom = 0;

                if (input.keyState[KeyCodes.KeyZ][0]) camZoom += 1;
                if (input.keyState[KeyCodes.KeyX][0]) camZoom -= 1;
                if (input.keyState[KeyCodes.KeyA][0]) camMoveX -= 1;
                if (input.keyState[KeyCodes.KeyD][0]) camMoveX += 1;
                if (input.keyState[KeyCodes.KeyW][0]) camMoveY -= 1;
                if (input.keyState[KeyCodes.KeyS][0]) camMoveY += 1;

                this.mainCam.scale += 0.01 * this.mainCam.scale * camZoom * dt;
                this.mainCam.x += 20 * camMoveX * dt;
                this.mainCam.y += 20 * camMoveY * dt;
            //}

        }

        // TITLE ANIMATION
        this.titleUpdateAlarm.update(dt);
        if (this.titleUpdateAlarm.finished) {
            this.titleUpdateAlarm.restart();
            this.titleInd = (this.titleInd + 1) % this.titles.length;

            document.title = this.titles[this.titleInd];
        }



        // HOLDING OBJECT 
        if (this.holdingObject) {
            if (!this.holdingObject.holder.holded) {
                this.holdingObject = null;
            } else if (!this.holdingObject.active) {
                this.holdingObject = null;
            }
        }

        // MOUSE PREVIOUS POSITIONS
        this.prevMousePos.push(new Vector(input.mouseX, input.mouseY));
        if (this.prevMousePos.length > this.prevMousePosNumber) {
            this.prevMousePos.shift();
        }

        // PARTICLES
        for (var i = 0; i < this.particles.length; i++) {
            var part = this.particles[i];
            if (!part.active) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }
            part.update(dt);
            part.pushDraw();
        }


        // UPDATING THINGS
        this.mainRoom.update(dt);
        this.startAlarm.update(dt);

    }

    addParticle(part) {
        if (this.particles.length <= 2000) {
            this.particles.push(part);
            return true;
        }
        return false;
    }

    addObject(obj) {
        if (this.mainRoom) {
            this.mainRoom.addObject(obj);
            return true;
        }
        return false;
    }

    // ITS IMPORTANT FOR THIS TO BE SCHEDULLED TO HAPPEN IN THE END OF THE UPDATE
    // BECAUSE OBJECTS FROM THE OLD ROOM CAN STILL BE UPDATING, AND THEY MAY ACCESS THE MAINROOM
    // THIS WILL CAUSE UNEXPECTED BEHAVIOUR
    changeRoomInternal(newRoomId) {
        this.mainRoom = this.rooms[newRoomId];
        this.nextRoom = null;
        this.isChangingRoom = false;
    }

    changeRoom(newRoomId) {
        if (this.isChangingRoom) return false;

        this.nextRoom = this.rooms[newRoomId];
        this.isChangingRoom = true;
        return true;
    }

    changeObjectRoom(obj, newRoom) {
        obj.room.removeObject(obj);
        newRoom.addObject(obj);
    }

    pushDraw() {
        this.mainRoom.pushDraw();
    }

    draw(ctx) {

    }

    drawGUI(ctx) {
        this.screenTransition.draw(ctx);
        this.roomTransition.draw(ctx);
    }

    drawFade(ctx) {
        if (!this.startAlarm.finished) {
            ctx.fillStyle = "rgb(150,180,250," + (1 - this.startAlarm.percentage()) + ")";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        }
    }

    drawRequests(ctx) {

        this.drawList.sort(function (a, b) {
            return b.depth - a.depth;
        });

        // Draw all objects from the list
        for (var i = 0; i < this.drawList.length; i++) {
            this.drawList[i].draw(ctx);
        }

        this.drawList = [];
    }

    addDrawRequest(request) {
        this.drawList.push(request);
    }

    drawGUIRequests(ctx) {

        this.drawGUIList.sort(function (a, b) {
            return b.depth - a.depth;
        });

        // Draw all objects from the list
        for (var i = 0; i < this.drawGUIList.length; i++) {
            this.drawGUIList[i].draw(ctx);
        }

        this.drawGUIList = [];
    }

    addDrawGUIRequest(request) {
        this.drawGUIList.push(request);
    }

}





var manager;
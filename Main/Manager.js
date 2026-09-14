class BeatMachine{
    constructor(beats){
        this.bps = beats;
        this.lastBeat = 0;
        this.startTime = new Date();
        this.beatTrigger = null;
    }

    update(dt){
        const now = new Date();
        var msDiff = now - this.startTime;
        var beat = Math.floor(msDiff*this.bps/1000);

        if(beat != this.lastBeat){
            this.lastBeat = beat;
            if(this.beatTrigger){
                this.beatTrigger(beat);
            }
        }
    }
}

class BeatPattern {
    constructor(bps, patternSize, beatList){
        this.bps = bps;

        this.beatList = beatList;
        this.patternSize = patternSize;
    }

    checkBeat(beat){
        var beatWrap = beat%this.patternSize;
        if(this.beatList.includes(beatWrap)) return true;
        return false;
    }
}



class FunRoom {
    constructor(xSlot, ySlot){
        this.xSlot = xSlot;
        this.ySlot = ySlot;

        this.visible = false;
        this.active = false;

        this.ambientMusic = -1;
        this.ambientMusicTimestamp = 0;
        this.stopMusic = true;
        // this.ambientMusicBeatSync = true;
        // this.ambientMusicBeatOffset = 0;
        this.restartMusic = true;

        this.objects = [];
    }

    setActive(active){
        if(active == this.active) return;
        for(var obj of this.objects){
            obj.setActive(active);
        }
        this.active = active;
    }

    setVisible(visible){
        if(visible == this.visible) return;
        for(var obj of this.objects){
            obj.changeVisible(visible);
        }
        this.visible = visible;
    }

    addObject(obj){
        this.objects.push(obj);
    }

    update(dt){
        //if(!this.active) return;

        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].update(dt);
        }
    }

    getX(){
        return this.xSlot*canvasWidth;
    }

    getY(){
        return this.ySlot*canvasHeight;
    }

    draw(ctx){
        //if(!this.visible) return;

        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].pushDraw(ctx);
        }
    }
}

class FunRoomViewer{
    constructor(x, y, camera){
        this.x = x;
        this.y = y;

        this.xSlot = 0;
        this.ySlot = 0;

        this.xSlotPrev = 0;
        this.ySlotPrev = 0;

        this.moving = false;
        this.alarm = new Alarm(100);
        this.alarm.stop();

        this.locked = false;

        this.camRoomXOff = 0;
        this.camRoomYOff = 0;

        this.camera = camera;
    }

    isRoomVisible(room){    
        if(room.xSlot == this.xSlot && room.ySlot == this.ySlot) return true;
        if(this.moving && (room.xSlot == this.xSlotPrev && room.ySlot == this.ySlotPrev)) return true;
    }

    isRoomActive(room){
        if(this.moving) return false;
        if(room.xSlot == this.xSlot && room.ySlot == this.ySlot) return true;
    }

    getSlotKey(xSlot, ySlot){
        return `${xSlot},${ySlot}`;
    }

    getRoom(xSlot, ySlot){
        return manager.roomsMap.get(this.getSlotKey(xSlot, ySlot));
    }

    changeRoom(slotX, slotY){
        this.xSlot = slotX;
        this.ySlot = slotY;

        this.moving = true;
        this.alarm.start();

  
        var oldRoom = this.getRoom(this.xSlotPrev, this.ySlotPrev);  
        var currentMusic = SoundPlayer.getMusic();
        var currentMusicTimestamp = 0;

        if(currentMusic != -1){
            var currentMusicTimestamp = SoundPlayer.getTimestamp(currentMusic);
            if(oldRoom?.stopMusic){
                SoundPlayer.fadeMusicStop(SoundPlayer.getMusic(), 20*this.alarm.duration/2);
            } else {
                SoundPlayer.fadeMusic(SoundPlayer.getMusic(), 20*this.alarm.duration/2);
            }
        }

        
        if(oldRoom){
            if(oldRoom.ambientMusic != -1){
                oldRoom.ambientMusicTimestamp = currentMusicTimestamp;
            }
        }

        var newRoom = this.getRoom(this.xSlot, this.ySlot);
        if(!newRoom) return;
        if(newRoom.ambientMusic == -1) return;

        SoundPlayer.playMusic(newRoom.ambientMusic);
        SoundPlayer.fadeIn(newRoom.ambientMusic, 20*this.alarm.duration/2);

        if(!newRoom.restartMusic){
            SoundPlayer.setTimestamp(newRoom.ambientMusic, newRoom.ambientMusicTimestamp);
        }
    }


    update(dt){
        this.alarm.update(dt);
        if(this.alarm.finished){
            this.alarm.stop();
            this.xSlotPrev = this.xSlot;
            this.ySlotPrev = this.ySlot;
            this.moving = false;
        }   

        if(!this.moving && !this.locked){
            var movX = -input.keyState[KeyCodes.ArrowLeft][1] + input.keyState[KeyCodes.ArrowRight][1];
            var movY = -input.keyState[KeyCodes.ArrowUp][1] + input.keyState[KeyCodes.ArrowDown][1];
            if(movX != 0){
                this.xSlot += movX;
                this.moving = true;
            }
            if(movY != 0){
                this.ySlot += movY;
                this.moving = true;
            }

            if(this.moving) this.changeRoom(this.xSlot, this.ySlot);
        }


        var t = tweenInOut(this.alarm.percentage());
        var tInv = 1-t;
        this.x = (this.xSlot*t + this.xSlotPrev*tInv)*canvasWidth;
        this.y = (this.ySlot*t + this.ySlotPrev*tInv)*canvasHeight;
        this.camera.x = canvasWidth*0.5 + this.x + this.camRoomXOff;
        this.camera.y = canvasHeight*0.5 + this.y + this.camRoomYOff;
    }
}


class GameManager{
    constructor(){
        this.particles = [];
        this.objects = [];
        this.rooms = [];
        this.roomsMap = new Map();
        this.drawList = [];

        this.actionQueue = new ActionQueue();

        // CAMERA AND ROOM VIEW
        this.mainCam = mainCam;
        this.roomViewer = new FunRoomViewer(0, 0, this.mainCam);

        // STATING FADE
        this.backgroundColor = new Color(0,0,0);
        this.fadeAlarm = new Alarm(50);


        // BEAT MACHINE
        this.beatMachine = new BeatMachine(8);
        this.beatMachine.beatTrigger = (beat) => {
            this.beatTrigger(beat);
        }
        this.beatStyles = [];
        this.beatStyleIndex = 0;


        // FAVICON ANIMATION
        this.faviconAnimation = new FaviconAnimation();
        if (location.protocol === "file:") this.faviconAnimation.active = false;

        // FLAGS
        this.gameBeaten = false;
        this.finishStar = null;

    }

    init(){
        // BEATS
        var clockBeat = [
            new BeatPattern(8, 16, [0]),
            new BeatPattern(8, 16, [8]),
        ];
        var complexBeat = [
            new BeatPattern(8, 16, [0]),
            new BeatPattern(8, 16, [8]),
            new BeatPattern(8, 64, [2, 4, 36]),
            new BeatPattern(8, 64, [16, 40, 44, 48]),
            new BeatPattern(8, 64, [23]),
        ]
        var noBeat = [];

        this.beatStyles = [noBeat, clockBeat, complexBeat];
        this.beatStyleIndex = 1;

        
        // INTRO
        var peachFacing = chance(0.5) ? 1 : -1;
        var peachKart = new PeachKart(canvasWidth*0.5 - canvasWidth*peachFacing*1.1, canvasHeight - 100, peachFacing, randInt(0, 3));

        var pillDemo = new PillDemo(canvasWidth*0.5 + randRange(-canvasWidth*0.2, canvasWidth*0.2), 0, 0);

        var goatQuote = new GoatQuote(canvasWidth*0.25, canvasHeight*0.7);

        
        var now = new Date();
        var dateText = now.toLocaleDateString();
        var rng = new Random(dateText);

        var intros = [0, 1, 2, 3];
        var introDuration = [400, 400, 500, 700];

        var mdx = canvasWidth*0.5;
        var mdy = canvasHeight*0.5;




        var intro = intros[now.getDate()%intros.length];

        this.calendarDashboard = new CalendarDashboard(introDuration[intro]);

        var cupDemo = new CupGameDemo(mdx, mdy*1.75);

        
        
        switch(intro){
            case 0:
                this.addObject(pillDemo);
                break;
            case 1:
                this.addObject(peachKart);
                break;
            case 2:
                this.addObject(goatQuote);
                break;
            case 3:
                this.addObject(cupDemo);
                break;
        }


        this.roomSetupIndex = rng.int(0, 4);

        this.setupRooms(this.roomSetupIndex, false);
    }

    createRoom(xSlot, ySlot = 0){
        if(this.roomsMap.has(this.roomViewer.getSlotKey(xSlot, ySlot))) {
            throw new Error("TRYING TO OVERRIDE ROOM");
        }
        var room = new FunRoom(xSlot, ySlot);
        this.rooms.push(room);
        this.roomsMap.set(this.roomViewer.getSlotKey(xSlot, ySlot), room);
        return room;
    }

    setupRooms(roomSetupIndex, developer = true){
        var dateText = (new Date()).toLocaleDateString();


        console.log("SETTING ROOMS");
        if(developer){
            SoundPlayer.play(SND.CORRECT);
        }

        this.rooms = [];
        this.roomsMap = new Map();

        
        var mdx = canvasWidth*0.5;
        var mdy = canvasHeight*0.5;

        var room = this.createRoom(0,0);
        room.addObject(this.calendarDashboard);
        this.finishStar = new FinishStar(room.getX() + mdx*2 - 120, room.getY() + 120);
        room.addObject(this.finishStar);

        room = this.createRoom(0, -1);
        var funShelves = new FunShelves(room.getX() + mdx, room.getY() + mdy);
        funShelves.randomFill(dateText);
        room.addObject(funShelves);
        this.bigClock = new BigClock(room.getX() + mdx + 500, room.getY() + mdy*2);
        room.addObject(this.bigClock);
        var houseWindow = new HouseWindow(room.getX() + mdx + 350, room.getY() + mdy -300);
        room.addObject(houseWindow);
        room.ambientMusic = SND.BOSSAUSADA;
        room.stopMusic = false;

        
        

        


        // ROOMS
        switch(roomSetupIndex){
            case 0:
                {
                    room = this.createRoom(1, 0);
                    var fameHall = new FameHall(room.getX() + mdx, room.getY() + mdy, 0);
                    room.addObject(fameHall);

                    room = this.createRoom(-1, 0);
                    var fameHall2 = new FameHall(room.getX() + mdx, room.getY() + mdy, 1);
                    room.addObject(fameHall2)
                }
            break;
            case 1:
                {
                    room = this.createRoom(-1, 0);
                    var pillsCols = 8;
                    var pillsRows = 16;
                    var pillsWid = canvasWidth*0.2;
                    var pillsHei = pillsWid*(pillsRows/pillsCols);

                    this.pillGame = new DrMarioGame(room.getX() + mdx, room.getY() + mdy, pillsWid, pillsHei, 8, 16);
                    this.pillGame.originX = 0.5;
                    this.pillGame.originY = 0.5;
                    this.pillGame.fillVirus();
                    this.pillGame.hasAutoInput = true;
                    room.addObject(this.pillGame);
                }
            break;
            case 2:
                {
                    room = this.createRoom(1, 0);
                    this.goatInterface = new MagicGoatInterface(room.getX() + mdx, room.getY() + mdy);
                    this.goatInterface.setText("");
                    var pGuy = new PurpleDude(room.getX() + mdx + 400, room.getY() + mdy);
                    room.addObject(this.goatInterface);
                    room.addObject(pGuy);
                }
            break;
            case 3:
                room = this.createRoom(1, 0);
                this.plantForest = new PlantInstance(room.getX() + mdx, room.getY() + mdy*2, Math.PI);
                room.addObject(this.plantForest);
                break;
            case 4:
                room = this.createRoom(-1, 0);
                this.cupGame = new CupGame(room.getX() + mdx, room.getY() + mdy*1.25);
                room.ambientMusic = SND.MUSICSPOTUS;
                room.stopMusic = false;
                room.addObject(this.cupGame);
                break;
        }

        this.roomViewer.xSlot = 0;
        this.roomViewer.xSlotPrev = 0;
    }



    finishIntro(){
        //this.beatStyleIndex = 0;
    }

    finishGame(){
        this.finishStar.appear = true;
        this.gameBeaten = true;
    }



    beatTrigger(beat){
        var soundList = [SND.TICK, SND.TOCK, SND.WATERDROP, SND.POP, SND.WRENCH];
        for(var i = 0; i < this.beatStyles[this.beatStyleIndex].length; i++){
            var isBeat = this.beatStyles[this.beatStyleIndex][i].checkBeat(beat);
            if(!isBeat) continue;

            SoundPlayer.play(soundList[i]);
            if(i == 0 || i == 1) this.bigClock.swingPendulum(); 
        }

        
    }

    setRoomViewerLock(locked){
        this.roomViewer.locked = locked;
    }
    

    update(dt){
        this.actionQueue.update(dt);

        if(input.keyState[KeyCodes.Space][0]){
            if(input.keyState[KeyCodes.Digit1][1]) this.setupRooms(0);
            if(input.keyState[KeyCodes.Digit2][1]) this.setupRooms(1);
            if(input.keyState[KeyCodes.Digit3][1]) this.setupRooms(2);
            if(input.keyState[KeyCodes.Digit4][1]) this.setupRooms(3);
            if(input.keyState[KeyCodes.Digit5][1]) this.setupRooms(4);
            if(input.keyState[KeyCodes.Digit6][1]) this.setupRooms(5);
            if(input.keyState[KeyCodes.Digit7][1]) this.setupRooms(6);
            if(input.keyState[KeyCodes.Digit8][1]) this.setupRooms(7);
            if(input.keyState[KeyCodes.Digit9][1]) this.setupRooms(8);
            if(input.keyState[KeyCodes.Digit0][1]) this.setupRooms(9);
            if(input.keyState[KeyCodes.KeyF][1]) this.finishGame();
        }

  
        

        this.faviconAnimation.update(dt);
        this.beatMachine.update(dt);
        this.roomViewer.update(dt);
        this.fadeAlarm.update(dt);

        //this.animeText.update(dt);




  

        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].update(dt);
        }

         for(var i = 0; i < this.objects.length; i++){
            this.objects[i].pushDraw(ctx);
        }

        for(var i = 0; i < this.particles.length; i++){
            this.particles[i].update(dt);
        }   

        for(var room of this.rooms){
            room.setActive(this.roomViewer.isRoomActive(room));
            room.setVisible(this.roomViewer.isRoomVisible(room));
            room.update(dt);
            room.draw(ctx);
        }

        // REMOVING INACTIVE OBJECTS
        for(var i = 0; i < this.objects.length; i++){
            if(this.objects[i].active) continue;

            this.objects.splice(i, 1);
            i--;
        }

        // REMOVING INACTIVE PARTICLES 
        for(var i = 0; i < this.particles.length; i++){
            if(this.particles[i].active) continue;

            this.particles.splice(i, 1);
            i--;
        }   

        if(input.mouseState[0][1]) {
            console.log("MOUSE COORDS (" + input.mouseX + ", " + input.mouseY + ")");
        }
    }

    addObject(object){
        this.objects.push(object);
    }

    addParticle(particle){
        this.particles.push(particle);
    }

    draw(ctx){
        if(!this.fadeAlarm.finished){
            ctx.fillStyle = "rgba(0,0,0,"+ (1-this.fadeAlarm.percentage()) +")";
            ctx.fillRect(0,0, canvas.width, canvas.height);
        }

        //this.animeText.draw(ctx);
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

    addDrawObject(obj, depth = 0, parameter = null) {
        this.addDrawRequest(new DrawRequest(obj, depth, parameter));
    }

    pushDraw(){

    }
}

var manager = new GameManager();

class DrawRequest {
    constructor(obj, depth, parameter = null) {
      this.obj = obj;
      this.depth = depth;
      this.parameter = parameter;
    }
  
    draw(ctx) {
        if(this.obj.drawRequest){
            this.obj.drawRequest(ctx, this.parameter);
        } else {
            this.obj.draw(ctx);
        }
    }
}
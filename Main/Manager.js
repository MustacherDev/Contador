


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
        var mdx = canvasWidth*0.5;
        var mdy = canvasHeight*0.5;

        // INTRO DEMOS
        var peachFacing = chance(0.5) ? 1 : -1;

        var peachKart = new PeachKart(canvasWidth*0.5 - canvasWidth*peachFacing*1.1, canvasHeight - 100, peachFacing, randInt(0, 3));
        var pillDemo = new PillDemo(canvasWidth*0.5 + randRange(-canvasWidth*0.2, canvasWidth*0.2), 0, 0);
        var goatQuote = new GoatQuote(canvasWidth*0.25, canvasHeight*0.7);
        var cupDemo = new CupGameDemo(mdx, mdy*1.75);

        // INTRO AND ROOM SETUP DATE POOLS
        var now = new Date();

        var setupsNum = 5;
        var totalDays = CalendarUtils.getYearDays();
        var wookRNG = new Random(Math.floor(totalDays/setupsNum));
        var wookDay = totalDays%setupsNum;

        // SETUPS
        var setupPool = [];
        for(var i = 0; i < setupsNum; i++){
            setupPool.push(i);
        }
        wookRNG.shuffle(setupPool);

        this.roomSetupIndex = setupPool[wookDay];

        // INTROS
        var introsNum = 4;
        var introPool = [];
        for(var i = 0; i < introsNum; i++){
            introPool.push(i);
        }
        wookRNG.shuffle(introPool);


        // INTRO CONFIG
        var introDuration = [400, 400, 500, 700];

        var intro = introPool[totalDays%introsNum];
        this.calendarDashboard = new CalendarDashboard(introDuration[intro]);


        
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

        // MAIN ROOM
        var room = this.createRoom(0,0);
        room.addObject(this.calendarDashboard);
        this.finishStar = new FinishStar(room.getX() + mdx*2 - 120, room.getY() + 120);
        room.addObject(this.finishStar);

        // SHELVES ROOM
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

        // SETUPS
        switch(roomSetupIndex){
            case 0:
                {
                    // FAME HALL SETUP
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
                    // PILL SETUP
                    room = this.createRoom(-1, 0);
                    this.pillGame = new PillGame(room.getX() + mdx, room.getY() + mdy);
                    room.addObject(this.pillGame);

                    room = this.createRoom(-1, -1);
                    var pipe = new PillPipe(room.getX() + mdx, room.getY() + mdy*2, false);
                    room.addObject(pipe);
                }
            break;
            case 2:
                {
                    // GOAT SETUP
                    room = this.createRoom(1, 0);
                    this.goatInterface = new MagicGoatInterface(room.getX() + mdx, room.getY() + mdy);
                    this.goatInterface.setText("");
                    room.addObject(this.goatInterface);
                    //var pGuy = new PurpleDude(room.getX() + mdx + 400, room.getY() + mdy);
                    //room.addObject(pGuy);
                }
            break;
            case 3:
                // FOREST SETUP
                room = this.createRoom(1, 0);
                this.plantForest = new PlantInstance(room.getX() + mdx, room.getY() + mdy*2, Math.PI);
                room.addObject(this.plantForest);
                break;
            case 4:
                // CIRCUS SETUP
                room = this.createRoom(-1, 0);
                this.cupGame = new CupGame(room.getX() + mdx, room.getY() + mdy*1.25);
                room.ambientMusic = SND.MUSICSPOTUS;
                room.stopMusic = false;
                room.addObject(this.cupGame);
                break;
            case 5:
                // OMEGARUNE SETUP
                room = this.createRoom(1, 0);
                this.omegaRune = new OmegaRune(room.getX() + mdx, room.getY() + mdy);
                room.addObject(this.omegaRune);
                break;
        }
    }



    finishIntro(){
        //this.beatStyleIndex = 0;
    }

    finishGame(){
        this.finishStar.appear = true;
        this.gameBeaten = true;
    }



    // EXECUTES ACTIONS BASED ON THE BEATS
    // MAINLY PLAYS SOUNDS
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
        this.faviconAnimation.update(dt);
        this.beatMachine.update(dt);
        this.roomViewer.update(dt);
        this.fadeAlarm.update(dt);

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
        if(this.fadeAlarm.finished) return;
        ctx.fillStyle = "rgba(0,0,0,"+ (1-this.fadeAlarm.percentage()) +")";
        ctx.fillRect(0,0, canvas.width, canvas.height);
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
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

class GameManager{
    constructor(){
        this.particles = [];
        this.objects = [];
        this.calendarDashboard = new CalendarDashboard();
        this.fameHall = new FameHall(canvasWidth*1.5, canvasHeight*0.5);


        this.mainCam = mainCam;

        this.drawList = [];
        this.backgroundColor = new Color(0,0,0);

        this.camSlotX = 0;
        this.camSlotXPrev = 0;
        this.camMoveAlarm = new Alarm(100);
        this.camMoving = false;

        this.fadeAlarm = new Alarm(50);

        this.beatMachine = new BeatMachine(8);
        this.beatMachine.beatTrigger = (beat) => {
            this.beatTrigger(beat);
        }
        this.beatPatterns = [
            new BeatPattern(8, 16, [0]),
            new BeatPattern(8, 16, [8]),
            // new BeatPattern(8, 64, [2, 4, 36]),
            // new BeatPattern(8, 64, [16, 40, 44, 48]),
            // new BeatPattern(8, 64, [23]),
        ]
    }

    beatTrigger(beat){
        var soundList = [SND.TICK, SND.TOCK, SND.WATERDROP, SND.POP, SND.WRENCH];
        for(var i = 0; i < this.beatPatterns.length; i++){
            if(this.beatPatterns[i].checkBeat(beat)) SoundPlayer.play(soundList[i]);
        }
    }
    

    update(dt){
        for(var i = 0; i < this.particles.length; i++){
            this.particles[i].update(dt);
        }   

        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].update(dt);
        }


        this.beatMachine.update(dt);
        this.camMoveAlarm.update(dt);
        this.fameHall.update(dt);

        if(this.camMoveAlarm.finished){
            this.camMoveAlarm.stop();
            this.camSlotXPrev = this.camSlotX;
            this.camMoving = false;
        }   

        if(!this.camMoving){
            var mov = -input.keyState[KeyCodes.ArrowLeft][1] + input.keyState[KeyCodes.ArrowRight][1];
           
            if(mov != 0){
                this.camSlotX += mov;
                this.camMoving = true;
                this.camMoveAlarm.start();
            }
        }


        var t = tweenInOut(this.camMoveAlarm.percentage());
        var tInv = 1-t;
        this.camX = (this.camSlotX*t + this.camSlotXPrev*tInv)*canvasWidth;
        this.mainCam.x = canvasWidth*0.5 + this.camX;

        this.calendarDashboard.update(dt);

        this.fadeAlarm.update(dt);
    }

    draw(ctx){
        if(!this.fadeAlarm.finished){

            ctx.fillStyle = "rgba(0,0,0,"+ (1-this.fadeAlarm.percentage()) +")";
            ctx.fillRect(0,0, canvas.width, canvas.height);
        }

        this.fameHall.draw(ctx);
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
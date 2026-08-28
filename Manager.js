class GameManager{
    constructor(){
        this.particles = [];
        this.objects = [];
        this.calendarDashboard = new CalendarDashboard();
        this.bdayCounter = new BdayCounter();

        this.mainCam = mainCam;

        this.drawList = [];
        this.backgroundColor = new Color(0,0,0);

        this.fadeAlarm = new Alarm(50);
    }

    update(dt){
        for(var i = 0; i < this.particles.length; i++){
            this.particles[i].update(dt);
        }   

        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].update(dt);
        }

        this.calendarDashboard.update(dt);
        this.bdayCounter.update(dt);

        this.fadeAlarm.update(dt);
    }

    draw(ctx){
        if(!this.fadeAlarm.finished){

            ctx.fillStyle = "rgba(0,0,0,"+ (1-this.fadeAlarm.percentage()) +")";
            ctx.fillRect(0,0, canvas.width, canvas.height);
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
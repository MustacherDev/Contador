class TowerTower{
    constructor(){
        this.x = 0;
        this.y = 0;

    }

}
class TowerHolder extends GameObject{
    constructor(){
        super(canvasWidth*0.5, canvasHeight*0.5, sprites[SPR.WHITEFRAME]);

        //this.buttons = [];

        // var butNat = new SpriteButton(-300, 0, 300, 200, sprites[SPR.PLAYBUTTONS]);
        // butNat.setSpriteBbox(60, 160, 400, 230);
        // butNat.modular = true;
        // butNat.img = 0;

        // var butDan = new SpriteButton(300, 0, 300, 200, sprites[SPR.PLAYBUTTONS]);
        // butDan.setSpriteBbox(60, 160, 400, 230);
        // butDan.modular = true;
        // butDan.img = 1;

        // this.buttons = [butNat, butDan];

        // this.selected = false;

        this.counter = new BdayCounter();
    }

    click(){
        for(var but of this.buttons){
            if(but.click()) return true;
        }
        return false;
    }

    hover(mouseX, mouseY){
        var success = false;
        for(var but of this.buttons){
            if(!but.hover(mouseX, mouseY)) continue;
            success = true;
        }
        return success;
    }

    update(dt){

        this.counter.update(dt);

        // this.hover(input.mouseX - this.x, input.mouseY - this.y);
        // if(input.mouseState[0][1]) this.click();

        // for(var i = 0; i < this.buttons.length; i++){
        //     var but = this.buttons[i];
        //     if(but.clicked){
        //         if(!manager.roomTransition.finished) continue;
        //         if(i == 0){
        //             manager.roomTransition.startTransition(200, ROOM.NAT, null);
        //         } else {
        //             manager.roomTransition.startTransition(200, ROOM.DAN, null);
        //         }
        //     }
        //     but.update(dt);
        // }
    }   

    draw(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);

        this.counter.draw(ctx);

        // for(var but of this.buttons){
        //     but.draw(ctx);
        // }
        ctx.restore();
    }
}

class BdayCounter{
    constructor(){
        this.targetDate = new Date("2025-12-06T18:00:00");
        this.done = false;

        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;

        this.x = 0;
        this.y = 0;

        
        this.letterIndex = 0;
        this.letterOrder = [0, 4, 6, 2, 7, 3, 1, 5];
        //this.letterTime  = [240, 120, 60, 30, 15, 7.5, 3.75, 1.625];
        this.letterTime  = [10, 8, 6, 4, 3, 2, 1, 0.5];
        this.message = "BEETROOT";
        // for(var i = 0 ; i < this.message.length; i++){
        //     var letterInfo = [];
        //     letterInfo.push(false);
        //     letterInfo.push(0);
        //     this.letters.push(letterInfo);
        // }
        
    }

    update(dt){
        const now = new Date();
        const diff = this.targetDate - now; // difference in milliseconds

        if (diff <= 0) {
            this.done = true;
            return;
        }

        this.days = Math.floor(diff / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        this.minutes = Math.floor((diff / (1000 * 60)) % 60);
        this.seconds = Math.floor((diff / 1000) % 60);

        var remainingHours = diff / (1000 * 60 * 60);

        for(var i = this.letterIndex ; i < this.letterTime.length; i++){
            if(this.letterTime[i] > remainingHours){
                this.letterIndex++;
                continue;
            }
            break;
        }

        if(this.days == 0 && this.hours < 1){
            this.x = randRange(-3, 3);
            this.y = randRange(-3, 3);
        }

    }


    draw(ctx){
        ctx.font = "120px Fixedsys";
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        

        if(this.done){
            ctx.fillText("FELIZ ANIVERSÁRIO!", 0, 0);
        } else {
            const dd = String(this.days).padStart(2, "0");
            const hh = String(this.hours).padStart(2, "0");
            const mm = String(this.minutes).padStart(2, "0");
            const ss = String(this.seconds).padStart(2, "0");
            ctx.fillText(`${dd}:${hh}:${mm}:${ss}`, this.x, this.y);
        }

        ctx.fillStyle = "rgb(255, 255, 0)";
        for(var i = 0 ;i < this.letterOrder.length; i++){
            if(this.letterOrder[i] > this.letterIndex) continue;
            var spacing = 70;
            var xx = spacing*i -spacing*this.letterOrder.length/2 + spacing/2;
            var yy = -140;
            
            ctx.fillText(this.message[i], xx, yy);
        }
        
    }   
}
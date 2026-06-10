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

        manager.addDrawObject(this);
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



class CalendarDashboard {
    constructor() {

        // Birthday
        this.birthMonth = 12;
        this.birthDay = 6;

        // Display
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;

        this.done = false;

        this.x = 0;
        this.y = 0;

        // Messages
        this.messages = [
            {text: "BEETROOT", tags: ["neutral"]},
            {text: "TENHA UM BOM DIA", tags: ["positive", "friendly"]},
            {text: "OLÁAA", tags: ["friendly", "positive", "funny"]},
            {text: "EAE, TUDO BEM?", tags: ["friendly", "neutral", "positive"]},
            {text: "É UM DIA LINDO LÁ FORA", tags: ["positive"]},
            {text: "TUDO NOS CONFORMES!", tags: ["hopeful"]},
            {text: "BEM VINDO DE VOLTA", tags: ["neutral"]},
            {text: "FALTA BEM POUQUINHO", subtext: "PRA DAQUI A POUCO", tags: ["funny", "long"]},
            {text: "APROVEITE O DIA", tags: ["kind"]},
        ];

        this.message = this.getMessageOfTheDay().text;
        this.messageSubtext = this.getMessageOfTheDay().subtext;

        // Reveal system
        this.revealOrder = this.createRevealOrder(this.message);
        this.letterIndex = 0;

        this.weekdays = [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado"
        ];
    }



    getNextBirthday() {

        const now = new Date();

        let birthday = new Date(
            now.getFullYear(),
            this.birthMonth - 1,
            this.birthDay,
            0,
            0,
            0
        );

        if (birthday < now) {
            birthday.setFullYear(birthday.getFullYear() + 1);
        }

        return birthday;
    }

    getRemainingTime() {

        const now = new Date();
        const target = this.getNextBirthday();

        const diff = target - now;

        return {
            diff,
            days: Math.floor(diff / 86400000),
            hours: Math.floor(diff / 3600000) % 24,
            minutes: Math.floor(diff / 60000) % 60,
            seconds: Math.floor(diff / 1000) % 60
        };
    }

    isCountdownMode() {
        return this.days <= 15;
    }

    getMessageOfTheDay() {
        const now = new Date();
        const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

        return this.messages[seed % this.messages.length];
    }

    createRevealOrder(message) {
        const order = [];

        for (let i = 0; i < message.length; i++) {
            order.push(i);
        }

        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }

        return order;
    }

    getTimeString() {
        const now = new Date();

        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        return `${hh}:${mm}:${ss}`;
    }

    


    getDateString() {

        const now = new Date();

        const weekday =
            this.weekdays[now.getDay()];

        return `${weekday} ${now.toLocaleDateString()}`;
    }

    update(dt) {
        const remaining = this.getRemainingTime();

        this.days = remaining.days;
        this.hours = remaining.hours;
        this.minutes = remaining.minutes;
        this.seconds = remaining.seconds;

        const totalHours = remaining.diff / 3600000;

        if (this.isCountdownMode()) {
            const revealThresholds = [];

            for (let i = 0; i < this.message.length; i++) {
                revealThresholds.push(15 * (1 - i / this.message.length));
            }

            while (this.letterIndex < revealThresholds.length && totalHours <= revealThresholds[this.letterIndex] * 24) {
                this.letterIndex++;
            }
        }

        if (remaining.diff <= 0) {
            this.done = true;
        }

        this.x = 0;
        this.y = 0;

        if (this.days === 0 && this.hours < 4) {
            let amp = 6 - this.hours;
            this.x = Math.random() * amp - amp / 2;
            this.y = Math.random() * amp - amp / 2;
        }

        manager.addDrawObject(this);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(canvasWidth / 2, canvasHeight / 2);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if(!this.isCountdownMode()){
            ctx.font = "32px Fixedsys";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgb(180,180,180)";
            ctx.fillText(this.getDateString(), -canvasWidth/2 + 20, -canvasHeight/2 + 40);
            
            ctx.textAlign = "left";
            ctx.font = "48px Fixedsys";
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillText(this.getTimeString(), -canvasWidth/2 + 20, -canvasHeight/2 + 100);
        }

        ctx.font = "100px Fixedsys";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (this.done) {
            ctx.fillStyle = "rgb(255,255,0)";
            ctx.fillText("FELIZ ANIVERSÁRIO!", this.x, this.y);
        } else if (this.isCountdownMode()) {
            const dd = String(this.days).padStart(2, "0");
            const hh = String(this.hours).padStart(2, "0");
            const mm = String(this.minutes).padStart(2, "0");
            const ss = String(this.seconds).padStart(2, "0");

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillText(`${dd}:${hh}:${mm}:${ss}`, this.x, this.y);
        } else {

            var messageY = -60;
            ctx.fillStyle = "rgb(255,255,0)";
            ctx.fillText(this.message, 0, messageY);

            ctx.font = "60px Fixedsys";
            ctx.fillStyle = "rgb(255,255,0)";
            ctx.fillText(this.messageSubtext, 0, messageY + 80);

            var daysLeftY = 180;
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillText(`${this.days} DIAS`, 0, daysLeftY);

            ctx.font = "40px Fixedsys";
            ctx.fillText("ATÉ O ANIVERSÁRIO!", 0, daysLeftY + 60);
        }

        if (this.isCountdownMode() && !this.done) {
            ctx.font = "60px Fixedsys";
            ctx.fillStyle = "rgb(255,255,0)";

            const spacing = 60;

            for (let i = 0; i < this.message.length; i++) {
                let visible = false;

                for (let j = 0; j < this.letterIndex; j++) {
                    if (this.revealOrder[j] === i) {
                        visible = true;
                        break;
                    }
                }

                if (!visible) {
                    continue;
                }

                const xx = spacing * i - spacing * this.message.length / 2 + spacing / 2;
                ctx.fillText(this.message[i], xx, -120);
            }
        }

        ctx.restore();
    }
}

class CalendarUtils{
    static weekdays = [
            "Domingo",
            "Segunda-feira",
            "Terça-feira",
            "Quarta-feira",
            "Quinta-feira",
            "Sexta-feira",
            "Sábado"
        ];


    static getTimeString() {
        const now = new Date();

        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        return `${hh}:${mm}:${ss}`;
    }

    static getDateString() {

        const now = new Date();

        const weekday =
            this.weekdays[now.getDay()];

        return `${weekday} ${now.toLocaleDateString()}`;
    }

    static getWeekdayString(){
        const now = new Date();

        const weekday =
            this.weekdays[now.getDay()];
        return weekday;
    }

    static getYearDays() {
        var now = new Date();
        const oneJan = new Date(now.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((now - oneJan) / (24 * 60 * 60 * 1000));
        return numberOfDays;
    }
}


class CalendarDashboard extends BaseObject {
    constructor(introDuration = 400) {
        super(canvasWidth / 2, canvasHeight / 2);
        
        this.birthdays = [
            {name: "H   ", day: 25, month:1, remaining: 0, remainText: ""}, 
            {name: "E   ", day: 6, month:5, remaining: 0, remainText: ""}, 
            {name: "R(o)", day: 7, month:8, remaining: 0, remainText: ""}, 
            {name: "R(a)", day: 6, month:12, remaining: 0, remainText: ""}
        ];

        this.specialPeriods = [
            {name: "Easter", start:{day:22, month:3}, duration:34},
            {name: "April Fools", start:{day:1, month:4}, duration:2},
            {name: "Halloween", start:{day:20, month:10}, duration:12},
            {name: "Christmas", start:{day:22, month:12}, duration:5},
            {name: "New Year", start:{day:31, month:12}, duration:2}
        ];

        // Messages
        this.messages = [
            {text: "BEETROOT", subtext: "...", tags: ["neutral"]},
            {text: "TENHA UM BOM DIA", tags: ["positive", "friendly"]},
            {text: "OLÁAA", tags: ["friendly", "positive", "funny"]},
            {text: "EAE, TUDO BEM?", tags: ["friendly", "neutral", "positive"]},
            {text: "É UM DIA LINDO LÁ FORA", tags: ["positive"]},
            {text: "TUDO NOS CONFORMES!", tags: ["hopeful"]},
            {text: "BEM VINDO DE VOLTA", tags: ["neutral"]},
            {text: "FALTA BEM POUQUINHO", subtext: "PRA DAQUI A POUCO", tags: ["funny", "long"]},
            {text: "APROVEITE O DIA", tags: ["kind"]},
        ];

        

        for(var birthday of this.birthdays){
            birthday.remaining = this.getRemainingTime(birthday).days;
            birthday.remainText = String(birthday.remaining).padStart(3, " ");
        }

        this.birthdays.sort((a,b) => a.remaining - b.remaining);

        this.closestBirthday = this.getClosestBirthday(this.birthdays);
        // Birthday
        this.birthMonth = this.closestBirthday.month;
        this.birthDay = this.closestBirthday.day;

        // Actual Time
        this.actSec = 0;
        this.prevSec = 0;

        // Display
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;

        this.done = false;

   



        this.shakeX = 0;
        this.shakeY = 0;



        this.message = this.getMessageOfTheDay().text;
        this.messageSubtext = this.getMessageOfTheDay().subtext;

        // Reveal system
        this.revealOrder = this.createRevealOrder(this.message);
        this.letterIndex = 0;



        this.finishedIntro = false;

        this.stateMachine = new StateMachine([introDuration, 50, 200]);
        this.stateMachine.autoProgress = true;
        this.stateMachine.onStateChange = (state) => {
            this.onStateChange(state);
        }
    }

    getClosestBirthday(birthdays) {
        const today = new Date();

        let closest = null;
        let closestDiff = Infinity;

        for (const birthday of birthdays) {
            let date = new Date(
                today.getFullYear(),
                birthday.month - 1, // JS months are 0-11
                birthday.day
            );

            // Birthday already happened this year → use next year
            if (date < today) {
                date.setFullYear(today.getFullYear() + 1);
            }

            const diff = date - today;

            if (diff < closestDiff) {
                closestDiff = diff;
                closest = birthday;
            }
        }

        return closest;
    }


    getNextBirthdayDate(birthday){
        const now = new Date();

        let birthdayDate = new Date(
            now.getFullYear(),
            birthday.month - 1,
            birthday.day,
            0,
            0,
            0
        );

        if (birthdayDate < now) {
            birthdayDate.setFullYear(birthdayDate.getFullYear() + 1);
        }

        return birthdayDate;
    }

    getRemainingTime(birthday = this.closestBirthday) {

        const now = new Date();
        const target = this.getNextBirthdayDate(birthday);

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

 

    


    



    onStateChange(state){
        if(state == 1){
            this.finishedIntro = true;
            manager.finishIntro();
        }
    }

    update(dt) {


        this.stateMachine.update(dt);

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

        if (this.days === 0 && this.hours < 4) {
            let amp = 6 - this.hours;
            this.shakeX = Math.random() * amp - amp / 2;
            this.shakeY = Math.random() * amp - amp / 2;
        }

        //this.animeText.update(dt);

        manager.addDrawObject(this);
    }

    drawHud(ctx){
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if(!this.isCountdownMode()){

            var xDisplace = -tweenInOut(1-this.stateMachine.getProgress(2))*600;

            ctx.font = "32px Fixedsys";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgb(180,180,180)";
            ctx.fillText(CalendarUtils.getDateString(), -canvasWidth/2 + 20 + xDisplace, -canvasHeight/2 + 40);
            
            ctx.textAlign = "left";
            ctx.font = "48px Fixedsys";
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillText(CalendarUtils.getTimeString(), -canvasWidth/2 + 20 + xDisplace, -canvasHeight/2 + 100);

            
            ctx.textAlign = "left";
            ctx.font = "24px Fixedsys";
            
            // for(var i = 0; i < this.birthdays.length; i++){
            //     var birth = this.birthdays[this.birthdays.length-1 - i];
            //     var light = 55 - (this.birthdays.length-1 - i)*15;
            //     ctx.fillStyle = "rgb("+light+","+light+","+light+")";
            //     ctx.fillText(birth.name + " " + birth.remainText, -canvasWidth/2 + 20 + xDisplace, +canvasHeight/2 - 20 -20*i);
            // }
            // ctx.font = "30px Fixedsys";
            // ctx.fillStyle = "rgb(70, 70, 70)";
            // ctx.fillText("Dias", -canvasWidth/2 + 20 + xDisplace, +canvasHeight/2 - 20 -20*4.5);
            
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
            var prog = this.stateMachine.getProgress(2);
            ctx.font = Math.floor(100 - (1-tweenOut(prog))*100) + "px Fixedsys";
            ctx.fillStyle = "rgb(255,255,0)";
            ctx.fillText(this.message, 0, messageY);

            
            if(this.messageSubtext){
                ctx.font = Math.floor(60 - (1-tweenOut(prog))*60) + "px Fixedsys";
                ctx.fillStyle = "rgb(255,255,0)";
                ctx.fillText(this.messageSubtext, 0, messageY + 80);
            }


            var yDisplace = tweenInOut(1-prog)*400;
            ctx.font = "60px Fixedsys";
            var daysLeftY = 180 + yDisplace;
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
    }

    drawIntro(ctx){
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        var introProg = this.stateMachine.getProgress(0);

        var alpha = Math.min(zigzag(introProg)*3, 1);
        alpha = tweenOut(alpha);

        ctx.font = "64px Fixedsys";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(180,180,180, " + alpha + ")";
        ctx.fillText(CalendarUtils.getWeekdayString(),0, -50);
        
        ctx.textAlign = "center";
        ctx.font = "52px Fixedsys";
        ctx.fillStyle = "rgba(255,255,255, " + alpha + ")";
        ctx.fillText(CalendarUtils.getTimeString(), 0, 20);
        
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x +this.shakeX, this.y +this.shakeY);

        this.drawHud(ctx);
        this.drawIntro(ctx);


        ctx.restore();
    }
}
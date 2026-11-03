
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

    static getWeekDayString(){
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

    
    static getClosestBirthday(birthdays) {
        const today = new Date();

        let closest = null;
        let closestDiff = Infinity;

        for (const birthday of birthdays) {
            let date = new Date(today.getFullYear(), birthday.month - 1, birthday.day);

            date.setHours(0, 0, 0, 0);

            if (date < today) date.setFullYear(today.getFullYear() + 1);

            const diff = date - today;

            if (diff < closestDiff) {
                closestDiff = diff;
                closest = birthday;
            }
        }

        return closest;
    }

   static getSpecialPeriod(specialPeriods, date = new Date()){
        const day = date.getDate();
        const month = date.getMonth() + 1;

        for(const period of specialPeriods){
            const start = period.start.day;
            const startMonth = period.start.month;

            const startDate = new Date(date.getFullYear(), startMonth - 1, start);
            const currentDate = new Date(date.getFullYear(), month - 1, day);

            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + period.duration);

            if(currentDate >= startDate && currentDate < endDate){
                return period.name;
            }

            // Handle periods that cross the end of the year
            if(startMonth === 12 && month === 1){
                const nextYearStart = new Date(date.getFullYear() - 1, startMonth - 1, start);
                const nextYearEnd = new Date(nextYearStart);
                nextYearEnd.setDate(nextYearEnd.getDate() + period.duration);

                if(currentDate >= nextYearStart && currentDate < nextYearEnd){
                    return period.name;
                }
            }
        }

        return null;
    }


    static getNextBirthdayDate(birthday){
        const now = new Date();

        let birthdayDate = new Date(now.getFullYear(), birthday.month - 1, birthday.day,0,0,0);

        if (birthdayDate < now) {
            birthdayDate.setFullYear(birthdayDate.getFullYear() + 1);
        }

        return birthdayDate;
    }

    static getRemainingTime(birthday) {

        const now = new Date();
        const target = CalendarUtils.getNextBirthdayDate(birthday);

        const diff = target - now;

        return {
            diff,
            days: Math.floor(diff / 86400000),
            hours: Math.floor(diff / 3600000) % 24,
            minutes: Math.floor(diff / 60000) % 60,
            seconds: Math.floor(diff / 1000) % 60
        };
    }

}










class CalendarClock extends BaseObject{
    constructor(x, y){
        super(x, y);

        this.progress = 0;
        this.displaceAmount = 600;

        this.textDate = new TextInstance("", this.x, this.y, "rgb(180,180,180)");
        this.textDate.setAlign("left");
        this.textDate.setFont("Fixedsys", 32);

        this.textTime = new TextInstance("",this.x, this.y, "rgb(255,255,255)");
        this.textTime.setAlign("left");
        this.textTime.setFont("Fixedsys", 48);
    }

    update(dt){
        if(!this.visible) return;
        var xDisplace = -tweenInOut(1-this.progress)*this.displaceAmount;

        this.textDate.setText(CalendarUtils.getDateString());
        this.textTime.setText(CalendarUtils.getTimeString());

        this.textDate.setPosition(this.x + xDisplace, this.y + 40);
        this.textTime.setPosition(this.x + xDisplace, this.y + 100);
    }

    draw(ctx){
        if(!this.visible) return;
        this.textDate.draw(ctx);
        this.textTime.draw(ctx);
    }
}

class CalendarIntroClock extends BaseObject{
      constructor(x, y){
        super(x, y);
        this.progress = 0;

        this.textWeekDay = new TextInstance("", this.x, this.y, "rgb(180,180,180)");
        this.textWeekDay.setAlignBaseline("center", "middle");
        this.textWeekDay.setFont("Fixedsys", 64);
    
        this.textTime = new TextInstance("",this.x, this.y, "rgb(255,255,255)");
        this.textTime.setAlignBaseline("center", "middle");
        this.textTime.setFont("Fixedsys", 52);
    }

    update(dt){
        if(!this.visible) return;
        var introProg = this.progress;

        var alpha = Math.min(zigzag(introProg)*3, 1);
        alpha = tweenOut(alpha);

        this.textWeekDay.setAlpha(alpha);
        this.textTime.setAlpha(alpha);

        this.textWeekDay.setText(CalendarUtils.getWeekDayString());
        this.textTime.setText(CalendarUtils.getTimeString());

        this.textWeekDay.setPosition(this.x, this.y - 50);
        this.textTime.setPosition(this.x, this.y + 20);
    }

    draw(ctx){
        if(!this.visible) return;
        this.textWeekDay.draw(ctx);
        this.textTime.draw(ctx);
    }
}

class CalendarCountdownClock extends BaseObject{
    constructor(x, y){
        super(x, y);

        this.progress = 0;
        this.counting = true;
        this.remainingTime = {days:0, hours:0, minutes:0, seconds:0};

        this.revealMessage = "";
        this.revealOrder = [];
        this.revealThresholds = [];
        this.revealIndex = 0;

        this.setRevealMessage("ALOHA MY CAMARADA");

        this.textCounter = new TextInstance("", this.x, this.y, "rgb(255,255,255)");
        this.textCounter.setAlignBaseline("center", "middle");
        this.textCounter.setFont("Fixedsys", 100);
    }

    startBirthday(){
        this.counting = false;
        this.textCounter.setText("FELIZ ANIVERSÁRIO!");
        this.textCounter.setColor("rgb(255,255,0)");
    }

    setRevealMessage(message){
        this.revealMessage = message;
        this.revealOrder = [];
        this.revealThresholds = [];
        this.revealIndex = 0;
        
        // CREATE REVEAL THRESHOLDS
        for (let i = 0; i < this.revealMessage.length; i++) {
            this.revealThresholds.push(15 * (1 - i / this.revealMessage.length));
            this.revealOrder.push(i);
        }

        // CREATE REVEAL ORDER
        for (let i = this.revealOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.revealOrder[i], this.revealOrder[j]] = [this.revealOrder[j], this.revealOrder[i]];
        }

        this.updateReveal();
    }

    updateReveal(){
        if (!this.counting) return;
        var totalHours = this.remainingTime.hours + this.remainingTime.days * 24;
        var len = this.revealThresholds.length;

        while (this.revealIndex < len && totalHours <= this.revealThresholds[this.revealIndex] * 24) {
            this.revealIndex++;
        }
    }

    update(dt){
        if(!this.visible) return;

        var alpha = tweenOut(this.progress);
        this.textCounter.setAlpha(alpha);

        var shakeX = 0;
        var shakeY = 0;
        if(this.counting){
            // SHAKES THE COUNTER IF REACHING END
            if (this.remainingTime.days === 0 && this.remainingTime.hours < 4) {
                let amp = 6 - this.remainingTime.hours;
                shakeX = Math.random() * amp - amp / 2;
                shakeY = Math.random() * amp - amp / 2;
            }

            const dd = String(this.remainingTime.days).padStart(2, "0");    
            const hh = String(this.remainingTime.hours).padStart(2, "0");
            const mm = String(this.remainingTime.minutes).padStart(2, "0");
            const ss = String(this.remainingTime.seconds).padStart(2, "0");

            this.textCounter.setText(`${dd}:${hh}:${mm}:${ss}`);
        }

        this.textCounter.setPosition(this.x + shakeX, this.y + shakeY);        
    }

    draw(ctx){
        if(!this.visible) return;

        this.textCounter.draw(ctx);

        
        var alpha = tweenOut(this.progress);
        // CHAR BY CHAR MESSAGE REVEALING
        ctx.font = "60px Fixedsys";
        ctx.fillStyle = "rgba(255,255,0,"+alpha+")";

        const spacing = 60;
        for (let j = 0; j < this.revealIndex; j++) {
            var ind = this.revealOrder[j];
            var char = this.revealMessage[ind];

            const xx = this.x + spacing * ind - spacing * this.revealMessage.length / 2 + spacing / 2;
            ctx.fillText(char, xx, this.y -120);
        }
    }
}

class CalendarDayMessage extends BaseObject{
    constructor(x, y){
        super(x, y);
        this.progress = 0;

        this.textMessage = new TextInstance("", this.x, this.y, "rgb(255,255,0)");
        this.textMessage.setAlignBaseline("center", "middle");
        this.textMessage.setFont("Fixedsys", 100);
        
        this.textSubMessage = new TextInstance("",this.x, this.y, "rgb(255,255,0)");
        this.textSubMessage.setAlignBaseline("center", "middle");
        this.textSubMessage.setFont("Fixedsys", 60);
    }

    setMessage(text){
        this.textMessage.setText(text);
    }

    setSubMessage(text){
        this.textSubMessage.setText(text);
    }

    update(dt){
        if(!this.visible) return;
        var scl = tweenOut(this.progress);
        this.textMessage.setScale(scl);
        this.textSubMessage.setScale(scl);
        this.textMessage.setPosition(this.x, this.y);
        this.textSubMessage.setPosition(this.x, this.y + 80);
    }

    draw(ctx){
        if(!this.visible) return;
        this.textMessage.draw(ctx);
        this.textSubMessage.draw(ctx);
    }
}

class CalendarDaysLeft extends BaseObject{
    constructor(x, y){
        super(x, y);
        this.progress = 0;

        this.displaceAmount = 400;
        this.remainingTime = {days:0, hours:0, minutes:0, seconds:0};

        this.textDaysLeft = new TextInstance("", this.x, this.y, "rgb(255,255,255)");
        this.textDaysLeft.setAlignBaseline("center", "middle");
        this.textDaysLeft.setFont("Fixedsys", 60);
    
        this.textUntilBday = new TextInstance("ATÉ O ANIVERSÁRIO", this.x, this.y, "rgb(255,255,255)");
        this.textUntilBday.setAlignBaseline("center", "middle");
        this.textUntilBday.setFont("Fixedsys", 40);
    }

    update(dt){
        if(!this.visible) return;

        var yDisplace = tweenInOut(1-this.progress)*400;
        var daysLeftY = yDisplace;

        this.textDaysLeft.setPosition(this.x, this.y + daysLeftY);
        this.textUntilBday.setPosition(this.x, this.y + daysLeftY + 60);

        this.textDaysLeft.setText(`${this.remainingTime.days} DIAS`);
    }

    draw(ctx){
        if(!this.visible) return;
        this.textDaysLeft.draw(ctx);
        this.textUntilBday.draw(ctx);
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
            {name: "Halloween", start:{day:20, month:10}, duration:15},
            {name: "Christmas", start:{day:22, month:12}, duration:5},
            {name: "New Year", start:{day:31, month:12}, duration:2},
            {name: "Children Day", start:{day:11, month:10}, duration:3}
        ];

        this.specialPeriod = CalendarUtils.getSpecialPeriod(this.specialPeriods);
        if(this.specialPeriod) {
            console.log(this.specialPeriod);
        } else {
            console.log("Normal day");
        }

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

    
        // CALCULATING BIRTHDATE DAYS LEFT
        for(var birthday of this.birthdays){
            birthday.remaining = CalendarUtils.getRemainingTime(birthday).days;
            birthday.remainText = String(birthday.remaining).padStart(3, " ");
        }
        this.birthdays.sort((a,b) => a.remaining - b.remaining);
        this.closestBirthday = CalendarUtils.getClosestBirthday(this.birthdays);

        // Birthday
        this.birthMonth = this.closestBirthday.month;
        this.birthDay = this.closestBirthday.day;

        // Display
        const remaining = CalendarUtils.getRemainingTime(this.closestBirthday);

        this.days = remaining.days;
        this.hours = remaining.hours;
        this.minutes = remaining.minutes;
        this.seconds = remaining.seconds;

        // STATES
        this.done = false;
        this.finishedIntro = false;


        
        // CALENDAR OBJECTS
        this.objects = [];
        this.hud = {
            counter: new CalendarCountdownClock(this.x, this.y),
            daysLeft: new CalendarDaysLeft(this.x, this.y + 180),
            dayMessage: new CalendarDayMessage(this.x, this.y),
            clock: new CalendarClock(this.x -canvasWidth/2, this.y -canvasHeight/2),
            introClock: new CalendarIntroClock(this.x, this.y)
        };

        this.objects.push(...Object.values(this.hud));

        this.hud.dayMessage.setMessage(this.getMessageOfTheDay().text);
        this.hud.dayMessage.setSubMessage(this.getMessageOfTheDay().subtext ?? "");
        
        // HIDES 
        if(this.isCountdownMode()){
            this.hud.dayMessage.visible = false;
            this.hud.clock.visible = false;
            this.hud.daysLeft.visible = false;
            this.hud.counter.setRevealMessage("POLINÉSIA ALEMÃ");
        } else {
            this.hud.counter.visible = false;
        }


        this.stateMachine = new StateMachine([introDuration, 50, 200]);
        this.stateMachine.autoProgress = true;
        this.stateMachine.onStateChange = (state) => {
            this.onStateChange(state);
        }
    }

    isCountdownMode() {
        return this.days <= 15;
    }

    getMessageOfTheDay() {
        const now = new Date();
        const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

        return this.messages[seed % this.messages.length];
    }

 
    onStateChange(state){
        if(state == 1){
            this.finishedIntro = true;
            manager.finishIntro();
        }
    }


    startBirthday(){
        this.hud.counter.startBirthday();
    }

    update(dt) {
        this.stateMachine.update(dt);

        // CALCULATING TIME REMAINING TILL BIRTHDAY
        const remaining = CalendarUtils.getRemainingTime(this.closestBirthday);

        this.days = remaining.days;
        this.hours = remaining.hours;
        this.minutes = remaining.minutes;
        this.seconds = remaining.seconds;

        // STARTS BIRTHDAY IF THE REMAINING TIME REACHES 0
        if(!this.done){
            if (remaining.diff <= 0) {
                this.startBirthday();
                this.done = true;
            }
        }

        // UPDATING CALENDAR SUBOBJECTS
        this.hud.daysLeft.remainingTime = remaining;
        this.hud.counter.remainingTime = remaining;

        for(var obj of this.objects){
            obj.progress = this.stateMachine.getProgress(2);
            if(obj == this.hud.introClock){
                this.hud.introClock.progress = this.stateMachine.getProgress(0);
            }
            obj.update(dt);
        }

        manager.addDrawObject(this);
    }


    draw(ctx) {
        for(var obj of this.objects){
            obj.draw(ctx);
        }
    }
}
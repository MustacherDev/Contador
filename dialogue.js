
class CharRenderer{
    constructor(text, font, ctx){
        this.text = text;
        this.font = font;

        this.color = new Color(255,255,255);
        this.shadowColor = new Color(0,0,0);

        this.colorId = 0;
        this.shadowColorId = 0;

        this.waving = false;
        this.shaking = false;

        this.shadow =  false;


        this.worming = false;

        this.scaleIn = false;

        this.bend = false;



        this.advancePage = false;
        this.waitConfirm = false;
        this.lineBreak = false;
        
        this.duration = 1;

        this.delay = 0;
        this.emotion = 0;

        this.width = this.getWidth();
    }

    getWidth(text = this.text){
        var extraSpace = 0;
        if(text == " "){
           extraSpace = this.getWidth("a");
        }
        var lastFont = ctx.font;
        ctx.font = this.font;
        var m = ctx.measureText(text);
        ctx.font = lastFont;
        return m.actualBoundingBoxRight + m.actualBoundingBoxLeft + extraSpace;
    }

    getHeight(){
        var lastFont = ctx.font;
        ctx.font = this.font;
        var m = ctx.measureText(this.text);
        ctx.font = lastFont;
        return m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    }

    draw(ctx, x, y, options, progress = 1, relPos = 0.5){
		ctx.font = this.font;
		ctx.textAlign = options.charAlign;
		ctx.textBaseline = options.charBaseline;


        var addX = 0;
        var addY = 0;
        if (this.shaking) {
            addX = randRange(-options.shakeAmp, options.shakeAmp);
            addY = randRange(-options.shakeAmp, options.shakeAmp);
        }

        if (this.waving) {
            addY += options.waveAmp * Math.cos(options.waveSpread*x*0.01 + options.wavePhase);
        }

        if(this.worming){
            var wormAng = (x*options.wormSpread + options.wormPhase*5)%(options.wormGap);
            wormAng = clamp(wormAng, 0, deg2rad(180));
            addY +=options.wormAmp*Math.sin(wormAng);
        }


        var scl = 1;
        if(this.scaleIn){
            scl *= progress;
        }

        if(options.shrinkIn){
            scl *= 1+options.shrinkScl*(1- clamp(options.shrinkAlarm.percentage()*2 -relPos, 0, 1));
        }


        var ang = 0;
        if(this.bend){
            ang = (relPos-0.5)*options.bendAng;
        }

        ctx.save();
        ctx.translate( x + addX, y + addY);
        ctx.rotate(ang);
        ctx.scale(scl, scl);

        if(this.shadow){
            ctx.fillStyle = options.getShadowColor(this.shadowColorId).toCSS();
            ctx.fillText(this.text, + options.shadowX,  + options.shadowY);
        }

		ctx.fillStyle = options.getColor(this.colorId).toCSS();

        ctx.fillText(this.text,0, 0);
        ctx.restore();
    }
}

class TextLine {
	constructor() {
		this.chars = [];
		this.width = 0;
        

        this.letterSpacing = 0;

		this.empty = true;
	}

    getLength(){
        return this.chars.length;
    }

    smartIndex(index){
        if(this.empty) return -1;

        var ind = index;

        if (ind < 0) {
			ind = (-ind) % (this.chars.length + 1);
			ind = (this.chars.length) - ind;
		} else if(ind >= this.chars.length){
            ind = ind%this.chars.length;
        }
        return ind;
    }

    getCharRender(ind){
		if (this.empty) return null;
		ind = this.smartIndex(ind);
        return this.chars[ind];
    }

    addCharRender(charRender){
        this.chars.push(charRender);
        this.width += charRender.width + this.letterSpacing;
        this.empty = false;
    }

    insertCharRender(charRender, insertIndex){
        var insertInd = this.smartIndex(insertIndex); 
        this.chars.splice(insertInd, 0, charRender);
        this.width += charRender.width + this.letterSpacing;
        this.empty = false;
    }

    removeCharRender(index){
        if(this.empty) return null;
        var ind = this.smartIndex(index);
        var charRender = this.chars.splice(ind, 1)[0];
        this.width -= charRender.width + this.letterSpacing;
        if(this.chars.length == 0) this.empty = true;
        return charRender;
    }

    getLastCharIndex(char) {
		for (let i = this.chars.length-1; i >= 0; i--) {
			if (this.chars[i].text === char) {
				return i;
			}
		}
		return -1; // Character not found
	}



    // THE SPLITIND ELEMENT WILL BE INCLUDED IN THE ORIGINAL LINE
	split(splitInd) {
		if (this.empty) return null;

        var ind = this.smartIndex(splitInd);
        var newLine = new TextLine();
        newLine.letterSpacing = this.letterSpacing;
		for(var i = ind+1; i < this.chars.length; i++){
            var charRender = this.removeCharRender(i);
            if(charRender){
                newLine.addCharRender(charRender);
            } else {
                console.log("ERROR: TextLine: split(): null charRender from removeCharRender()");
            }
            i--;
        }

        return newLine;
	}

    print(){
        var text = "";
        for(var char of this.chars){
            text += char.text;
        }

        console.log(text);
    }
}


class TextRenderOptions{
    constructor(){

        // this.color = new Color(255, 255, 255);
        // this.shadowColor = new Color(0,0,0);

        this.colors = [new Color(255, 255, 255), new Color(255, 0, 0), new Color(0, 255, 0), new Color(0, 0, 255), new Color(255, 0, 255), new Color(255, 255, 0), new Color(0, 255, 255)];
        this.shadowColors = [new Color(0, 0, 0), new Color(70, 0, 0), new Color(0, 70, 0), new Color(0, 0, 70), new Color(70, 0, 70), new Color(70, 70, 0), new Color(0, 70, 70)];
        
        this.colorId = 0;
        this.shadowColorId = 0;

		this.shaking = false;

		this.shakeAmp = 0.5;

		this.waving = false;

        this.shadow = false;


        this.worming = false;
        this.wormPhase = 0;
        this.wormAmp = 10;
        this.wormSpd = 0.05;
        this.wormSpread = 1;
        this.wormGap = 10;

        this.scaleIn = false;

        this.bend = false;

		this.wavePhase = 0;
		this.waveAmp = 2.5;
		this.waveSpd = 0.05;
        this.waveSpread = 1;

        this.font = "14px Fixedsys";

        this.advancePage = false;
        this.waitConfirm = false;
        this.lineBreak = false;

        this.duration = 1;
        this.delay = 0;

        this.emotion = 0;

        this.shadowX = 4;
        this.shadowY = 4;

        this.shrinkIn = false;
        this.shrinkScl = 0.5;
        this.shrinkAlarm = new Alarm(0, 20);

        this.align = 0;
        this.alignV = 0;

        this.charAlign = "left";
        this.charBaseline = "middle";

		this.letterSpacing = 30;
        this.lineSpacing = 50;

        this.limitWidth = 300;



        this.newHeightHotfix = false;
    }

    getColor(id){
        return this.colors[id];
    }

    getShadowColor(id){
        return this.shadowColors[id];
    }
}

class TextPage {
	constructor() {

        this.options = new TextRenderOptions();

        this.fontList = [];
        this.fontsLoaded = false;

        this.chars = [];
		this.lines = [];

		this.empty = true;
    }

    createCharRenderer(char, ctx){
        var charRender = new CharRenderer(char, this.options.font, ctx);
        charRender.colorId = this.options.colorId;
        charRender.shaking = this.options.shaking;
        charRender.waving = this.options.waving;
        charRender.duration = this.options.duration;
        charRender.waitConfirm = this.options.waitConfirm;
        charRender.advancePage = this.options.advancePage;
        charRender.delay = this.options.delay;
        charRender.emotion = this.options.emotion;
        charRender.shadow = this.options.shadow;
        charRender.shadowColorId = this.options.shadowColorId;
        charRender.bend = this.options.bend;
        charRender.worming = this.options.worming;
        charRender.scaleIn = this.options.scaleIn;
        charRender.lineBreak = this.options.lineBreak;

        //charRender.shrinkIn = this.options.shrinkIn;
        return charRender;
    }

    addChar(char, ctx){
        if(char == "") return;

        if(this.empty){
            var line = new TextLine();
            line.letterSpacing = this.options.letterSpacing;
            this.addLine(line);
        }
        this.addCharRender(this.createCharRenderer(char, ctx));
    }

    doLineBreaks(){
        this.lines = [];
        var firstLine = new TextLine();
        firstLine.letterSpacing = this.options.letterSpacing;

        this.addLine(firstLine);
        var line = firstLine;
        for(var i = 0; i < this.chars.length; i++){
            this.chars[i].width = this.chars[i].getWidth();
            
            line.addCharRender(this.chars[i]);
            if(line.width > this.options.limitWidth){
                var lastSpace = line.getLastCharIndex(" ");
                if(lastSpace != -1){
                    this.breakLine(-1, lastSpace);
                } else {
                    this.breakLine(-1, -2);
                }
                line = this.getLine(-1);
            } else if (this.chars[i].lineBreak){
                this.breakLine(-1, -2);
                line = this.getLine(-1);
            }
        }
    }

    addCharRender(charRender){
        if(this.empty){
            var line = new TextLine();
            line.letterSpacing = this.options.letterSpacing;
            this.addLine(line);
        }
        var line = this.getLine(-1);
        line.addCharRender(charRender);
        this.chars.push(charRender);

        if(!this.fontList.includes(charRender.font)){
            this.fontList.push(charRender.font);
        }

        if(line.width > this.options.limitWidth){
            var lastSpace = line.getLastCharIndex(" ");
            if(lastSpace != -1){
                this.breakLine(-1, lastSpace);
            } else {
                this.breakLine(-1, -2);
            }
            line = this.getLine(-1);
        } else if(this.options.lineBreak){
             this.breakLine(-1, -1);  
        }

        this.options.waitConfirm = false;
        this.options.advancePage = false;
        this.options.delay = 0;
        this.options.lineBreak = false;
    }
	
    smartIndex(index, extra = 0){
        if(this.empty) return -1;

        var limit = this.lines.length;
        var ind = index;

        if (ind < 0) {
			ind = (-ind) % (limit + 1);
			ind = (limit) - ind;
		} else if(ind >= limit){
            ind = ind%(limit + extra);
        }
        return ind;
    }

	getCharRender(lineIndex, charIndex) {
        
        var lineInd = this.smartIndex(lineIndex);
        var line = this.lines[lineInd];
        var charInd = charIndex;
        return line.getCharRender(charInd);

    }

    getCharRenderOnPage(charPageIndex){
        return this.chars[charPageIndex];
    }

    getLine(index){
        if (this.empty) return null;
		var ind = this.smartIndex(index);
        return this.lines[ind];
    }

    getLength(){
        var sum = 0;
        for(var line of this.lines){
            sum+=line.getLength();
        }

        return sum;
    }

	addLine(line) {
		this.lines.push(line);
		this.empty = false;
	}

    insertLine(line, lineInsertIndex){
        var lineInsertInd = this.smartIndex(lineInsertIndex, 1); 
        this.lines.splice(lineInsertInd, 0, line); 
        this.empty = false;
    }

    removeLine(index){
        if(this.empty) return null;
        var ind = this.smartIndex(index);
        var line = this.lines.splice(ind, 1)[0];
        if(this.lines.length == 0) this.empty = true;
        return line;
    }

	breakLine(lineIndex, breakIndex) {
		if(this.empty) return false;

        var lineInd = this.smartIndex(lineIndex);
        var breakInd = breakIndex;

		var line = this.getLine(lineInd);
        if(line){
            var newLine = line.split(breakInd);
            if(newLine){
                this.insertLine(newLine, lineInd+1);
                return true;
            }
        }
        return false;
	}

    clear(){
        this.fontList = [];
        this.fontsLoaded = false;

        this.chars = [];
		this.lines = [];

		this.empty = true;
    }

    update(dt){
        this.options.wavePhase += this.options.waveSpd*dt;
        this.options.wormPhase += this.options.wormSpd*dt;

        if(!this.fontsLoaded){
            if(this.checkFonts()){
                this.doLineBreaks();
                this.fontsLoaded = true;
            }
        }
    }

    checkFonts(){
        for(var i = 0; i < this.fontList.length; i++){
            if(!document.fonts.check(this.fontList[i])) return false;
        }
        return true;
    }

    measureText(line){
        
        var wid = 0;
        var charDrawn = 0;
        for(var c of line.chars){
            wid +=c.width + this.options.letterSpacing;
            charDrawn++;
        }
    
        wid -= this.options.letterSpacing;

        if(line.chars.length > 0){
            var c = line.chars[line.chars.length-1];
            if(c.text == " "){
                 wid -= c.width;
            }
        }


        return wid;
    }

    measureLineHeight(line){
        if(!line) return 0;
        if(line.chars.length <= 0) return 0;
        
        return line.chars[0].getHeight();
    }

    getPageHeight(){
        if(this.lines.length <= 0) return 0;
        if(this.lines[0].chars.length <= 0) return 0;
        var hei = (this.lines.length-this.options.newHeightHotfix)*this.options.lineSpacing;
        hei += this.lines[0].chars[0].getHeight();
        //console.log(charHei);
        return hei;
    }

  

    getLineWidth(lineInd = 0){
        if(this.lines.length <= 0) return 0;
        if(!this.lines[lineInd]) return 0;
        
        return this.measureText(this.lines[lineInd]);
    }

    draw(ctx, charNum, x, y){
        var xx = x;
        var yy = y;
        var lineind = 0;
        var charDrawn = 0;


        var prog = charNum - Math.floor(charNum);
        if(charNum == Math.floor(charNum)) prog = 1;

        var mainProg = 1;

        if(this.options.alignV != 0){
            var pageHei = this.getPageHeight();

            yy -= pageHei*this.options.alignV;
        }

        // var lineWid = 100;
        // var lineHei = this.getPageHeight();
        // ctx.strokeRect(x - lineWid*this.options.align, y - lineHei*this.options.alignV, lineWid, lineHei);

        for(var line of this.lines){
            lineind++;

            xx = x;
            if(this.options.align != 0){
                var lineWid = this.measureText(line);

                xx -= lineWid*this.options.align;
            }
            // var lineWid = this.measureText(line);
            // var lineHei = this.measureLineHeight(line);
            // ctx.strokeRect(xx, yy, lineWid, lineHei);


            
            for(var c of line.chars){

                c.draw(ctx, xx, yy, this.options, mainProg, charDrawn/this.chars.length);
                
                xx += c.width + this.options.letterSpacing;
                charDrawn++;

                if(charDrawn+1 >= charNum) mainProg = prog;
                if(charDrawn >= charNum) return;
            }
            yy += this.options.lineSpacing;
        }
    }
}


function processDialogueString(textString, textPage) {
    var endOfString = false;
    var textStringInd = 0;
    while(!endOfString){
        var isText = false;
        var commandNum = 0;
        var tokenStrings = [];
        var readingCommand = false;
        var readingParameter = false;
        var parameterInd = 0;

        var text = "";
        

        while ((!isText || readingCommand) && !endOfString) {
            if (textStringInd >= textString.length) {
                endOfString = true;
                break;
            }
            var char = textString[textStringInd];
            textStringInd++;
            if (!readingCommand) {
                if (char == "<") {
                    readingCommand = true;
                    tokenStrings.push({ token: "", parameter: [] });
                    commandNum++;
                } else {
                    textStringInd--;
                    isText = true;
                    text = char;
                }
            } else {
                if (!readingParameter) {
                    if (char == ">") {
                        readingCommand = false;
                    } else if (char == "(") {
                        readingParameter = true;
                        tokenStrings[commandNum - 1].parameter.push("");
                        parameterInd = 0;
                    } else {
                        tokenStrings[commandNum - 1].token += char;
                    }
                } else {
                    if (char == ")") {
                        readingParameter = false;
                    } else if(char == "|"){
                        parameterInd++;
                        tokenStrings[commandNum - 1].parameter.push("");
                    } else {
                        tokenStrings[commandNum - 1].parameter[parameterInd] += char;
                    }
                }
            }
        }

        // THE COLORS SHOULD PROBABLY BE STORED IN THE OPTIONS OBJECT
        // THAT WAY WE WOULD ONLY STORE THE COLOR INDEX IN THE RENDERCHARS
        // AND WE WOULD BE ABLE TO FREELY CHANGE THE COLORS WITHOUT NEEDING TO CHANGE THE DIALOGUE STRING   

        for (var i = 0; i < tokenStrings.length; i++) {
            var token = tokenStrings[i];
            switch (token.token) {
                case "dur":
                    if (!isNaN(+token.parameter[0])) {
                        textPage.options.duration = (+token.parameter[0]);
                    }
                    break;

                case "font":
                    textPage.options.font = token.parameter[0];
                    break;

                case "wait":
                    textPage.options.waitConfirm = true;
                    break;

                case "nextpg":
                    textPage.options.advancePage = true;
                    break;

                case "color":
                    if (!isNaN(+token.parameter[0])) {
                        textPage.options.colorId = (+token.parameter[0]);
                    }
                break;

                case "shadowColor":
                    if (!isNaN(+token.parameter[0])) {
                        textPage.options.shadowColorId = (+token.parameter[0]);
                    }
                break;

                case "delay":
                    if (!isNaN(+token.parameter[0])) {
                        textPage.options.delay = +token.parameter[0];
                    }
                break;
            
                case "shake":
                    textPage.options.shaking = !textPage.options.shaking;
                    break;

                case "wave":
                    textPage.options.waving = !textPage.options.waving;
                    break;

                case "shadow":
                    textPage.options.shadow = !textPage.options.shadow;
                    break;

                case "bend":
                    textPage.options.bend = !textPage.options.bend;
                    break;

                case "sclIn":
                    textPage.options.scaleIn = !textPage.options.scaleIn;
                    break;

                case "worm":
                    textPage.options.worming = !textPage.options.worming;
                    break;
                case "break":
                    textPage.options.lineBreak = true;
                    break;

                case "emotion":
                    if (!isNaN(+token.parameter[0])) {
                        textPage.options.emotion = +token.parameter[0];
                    }
                    break;
            }
        }
        textPage.addChar(text, ctx);
        textStringInd++;
    }
    textPage.addChar("", ctx);
}



class DialogboxObject {
	constructor(x, y, wid, hei, borderWid, borderHei) {
		this.x = y;
		this.y = x;

		this.width = wid;
		this.height = hei;

		this.borderWid = borderWid;
		this.borderHei = borderHei;

        this.textXOff = borderWid;
        this.textYOff = borderHei;

		this.borderXScl = 1;
		this.borderYScl = 1;

        // BOX RENDER
        this.hasBox = true;
		this.sprite = sprites[SPR.TEXTBOX];
        this.nineSlice = new NineSliceSprite(sprites[SPR.TEXTBOX], this.width, this.height, this.borderWid); 

        this.optionsBoxOffset = new Vector(0,this.height);

        this.optionsBox = new NineSliceSprite(sprites[SPR.TEXTBOX], this.width/4, this.height, this.borderWid);
    
        // TAIL RENDER
        this.hasTail = false;
        this.tailX = 0;
        this.tailY = 0;

        // SPACING
        this.lineSpacing = 30;
        this.letterSpacing = 20;

        // SOUNDS
        this.typerSoundInd = SND.SQUID;
		this.typerSound = -1;
        this.typerCooldown = new Alarm(5, 5);


        // DIALOGUE DATA
		this.pages = [];
        this.options = [];
        this.optionSelected = 0;

        // VARIABLES TO KEEP TRACK OF WHERE WE ARE IN THE PAGE
        this.readingChar = 0;
        this.readingLine = 0;
        this.readingPage = -1;
		this.readSpd = 0.5;
        this.readTime = 0;

        this.totalReadChars = 0;

        // READING STATE VARIABLES
        this.reading = false;
		this.waitConfirm = false;
        this.waitResponse = false;
        this.finished = true;
        this.answered = true;

        this.confirmIconAlarm = new Alarm(0, 100);
        this.confirmIconAlarm.loop = true;

	}

    reset(){
        // DIALOGUE DATA
		this.pages = [];
        this.options = [];
        this.optionSelected = 0;

        // VARIABLES TO KEEP TRACK OF WHERE WE ARE IN THE PAGE
        this.readingChar = 0;
        this.readingLine = 0;
        this.readingPage = -1;
		this.readSpd = 0.5;
        this.readTime = 0;


        this.totalReadChars = 0;

        // READING STATE VARIABLES
        this.reading = false;
        this.waitConfirm = false;
        this.waitResponse = false;
        this.finished = false;
        this.answered = false;
    }


    getEmotion(){
        if(!this.reading) return 0;
        return this.pages[this.readingPage].getCharRender(this.readingLine, this.readingChar).emotion;
    }




    // DIALOGUE LOADING METHODS
    createPageFromString(textString){
        var page = new TextPage();
        page.options.limitWidth = this.width - this.borderWid*2 - this.textXOff;
        page.options.lineSpacing = this.lineSpacing;
        page.options.letterSpacing = this.letterSpacing;

        processDialogueString(textString, page);
        this.addPage(page);
    }

    startReading(pageInd){
        this.reading = true;
        this.changePage(pageInd);
    }

    loadDialogData(data){
        this.reset();
        for(var pageStr of data.pagesStrings){
            this.createPageFromString(pageStr);
        }

        this.options = data.optionsList;

        this.startReading(0);
    }



	draw(ctx){
        if(!this.reading) return;

        if(this.hasBox){
            if(this.hasTail){
                var pos = new Vector(this.x + this.width/2, this.y + this.height/2);
                
                var len = distance(this.tailX - pos.x, this.tailY - pos.y);
                var ang = Math.atan2(this.tailY - pos.y, this.tailX - pos.x);
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.rotate(ang);
                ctx.fillStyle = "rgb(255,255,255)";
                ctx.fillRect(0, 0, len, 10);
                ctx.strokeStyle = "rgb(0,0,0)";
                ctx.lineWidth = 3;
                ctx.strokeRect(0, 0, len, 10);
                ctx.restore();
            }

            this.nineSlice.x = this.x;
            this.nineSlice.y = this.y;
            this.nineSlice.draw(ctx);
        }

        if(this.waitResponse){
            this.optionsBox.x = this.x+ this.optionsBoxOffset.x;
            this.optionsBox.y = this.y + this.optionsBoxOffset.y;
            this.optionsBox.height = this.borderWid*2 + this.options.length * 40;
            this.optionsBox.draw(ctx);

            // ctx.fillStyle = "rgb(255,0,0)";
            // ctx.fillRect(this.optionsBox.x + this.borderWid, this.optionsBox.y + this.borderWid, this.optionsBox.width - this.borderWid*2, this.optionsBox.height - this.borderHei*2);

            for(var i = 0; i < this.options.length; i++){
                var xx = this.optionsBox.x + this.borderWid + 40;
                var yy = this.optionsBox.y + this.borderWid + (i+0.5)*40;

                ctx.font = "38px Fixedsys";
               
              
               
                ctx.fillStyle = "rgb(0,0,0)";

                var border = 5;
                if(this.optionSelected == i){
                    ctx.fillText(">", xx-40 +border, yy+border);
                }
                ctx.fillText(this.options[i], xx+border, yy+border);

                
                ctx.fillStyle = "rgb(255,255,255)";
                if(this.optionSelected == i){
                    ctx.fillText(">", xx-40, yy);
                }
                ctx.fillText(this.options[i], xx, yy);



            }
        }

        if(this.waitConfirm){
            if(this.confirmIconAlarm.percentage() < 0.5){
                ctx.fillStyle = "rgb(255,255,255)";

                ctx.beginPath();
                ctx.moveTo(this.x + this.width - this.borderWid*1.5, this.y + this.height -this.borderHei*1.5);
                ctx.lineTo(this.x + this.width - this.borderWid*1, this.y + this.height -this.borderHei*1.5);
                ctx.lineTo(this.x + this.width - this.borderWid*1.25, this.y + this.height -this.borderHei*1.25);
                ctx.fill();
                ctx.end
                //ctx.fillRect(this.x + this.width - this.borderWid*1.5, this.y + this.height -this.borderHei*1.5, this.borderWid*0.5, this.borderHei*0.5);
            }
        } 





        if(this.readingPage != -1){
            var page = this.pages[this.readingPage];
            page.draw(ctx, this.totalReadChars, this.x + this.borderWid + this.textXOff, this.y + this.borderHei + this.textYOff);
        }
    }

 

    addPage(page){
        this.pages.push(page);
    }

    changePage(pageInd){

        if(pageInd >= this.pages.length) return;
        if(pageInd < 0) return;
  
        this.readingPage = pageInd;
        this.readingLine = 0;
        this.readingChar = 0;

        this.totalReadChars = 0;
        this.readTime = 0;

        this.reading = true;
        this.waitConfirm = false;
        this.waitResponse = false;

        // dont know how firstChar could be null
        // IF IT REALLY IS NULL WHY WOULD I BOTHER TO SET THE DURATION TO 1?    
        var firstChar = this.pages[this.readingPage].getCharRender(this.readingLine, this.readingChar);

        if(firstChar){
            this.charDuration = firstChar.duration + firstChar.delay; 
        } else {
            this.charDuration = 1;
        }
    }

    nextPage(){
        if(this.readingPage+1 < this.pages.length){
            this.changePage(this.readingPage+1);
        } else {
            if(this.options.length > 0){
                this.waitResponse = true;
            } else {
                this.reading = false;
                this.finished  =true;
            }
        }
    }



    inputConfirm(){
        if(!this.waitConfirm) return;

        this.waitConfirm = false;

        var page = this.pages[this.readingPage];
        if(this.totalReadChars >= page.getLength()){
            this.nextPage();
        }   
    }

    inputResponseMove(dir){
        if(!this.waitResponse) return;
        this.optionSelected += dir;
        if(this.optionSelected >= this.options.length){
            this.optionSelected = 0;
        } else if (this.optionSelected < 0){
            this.optionSelected = this.options.length-1;
        }
        
    }

    inputResponseConfirm(){
        if(!this.waitResponse) return;
        this.reading = false;
        this.finished = true;
        this.waitResponse = false;
    }

    update(dt){
        if(!this.reading) return;

        this.typerCooldown.update(dt);



        // PAGE UPDATING IS REQUIRED FOR ANIMATED TEXT, LIKE WAVING
        var page = this.pages[this.readingPage];
        page.update(dt);

        if(!this.waitConfirm){
            this.confirmIconAlarm.restart();
        }

        // IF IN PAUSE STATE, WAIT FOR CONFIRMATION TO CONTINUE
        if(this.waitConfirm){
            this.confirmIconAlarm.update(dt);
        } else if(this.waitResponse){

            
        } else {
            // IF NORMAL READING
            this.readTime += dt*this.readSpd;


            if(this.readTime >= this.charDuration){
                
                this.readTime -= this.charDuration;

                var line = page.getLine(this.readingLine);
                var charRender = line.getCharRender(this.readingChar);

                this.readingChar++;
                this.totalReadChars++;

                // PROCESSING INDIVIDUAL CHAR EVENTS
                if(charRender){
                    // SKIPS PAGE (Without user interaction)
                    if(charRender.advancePage){
                        this.nextPage();
                        return;
                    }

                    // PAUSES READING
                    if(charRender.waitConfirm){
                        this.waitConfirm = true;
                    }

                    // PLAYING TYPER SOUND
                    if(charRender.text != " " && charRender.text != "."){
                        if(this.typerCooldown.finished){
                            this.typerSound = playSound(this.typerSoundInd);
                            this.typerCooldown.restart();
                        }
                    }
                } 



     

                // NEXT TEXT LINE
                if(this.readingChar >= line.getLength()){
                    this.readingLine++;
                    this.readingChar = 0;

                    // END OF PAGE
                    if(this.readingLine >= page.lines.length){     
                        // WAIT CONFIRMATION
                        this.waitConfirm = true;
                        
                    } else {
                        // GETTING NEXT CHAR DURATION
                        var nextCharRender = line.getCharRender(this.readingChar);
                        this.charDuration = nextCharRender.duration + nextCharRender.delay;
                    }
                } else {
                    // GETTING NEXT CHAR DURATION
                    var nextCharRender = line.getCharRender(this.readingChar);
                    this.charDuration = nextCharRender.duration + nextCharRender.delay;
                }
            }
        }
    }
}



const DIALOGUE = Object.freeze(new Enum(
    "TEST",
    "TOTAL"
));


class DialogData{
    constructor(scripStringList, optionsList, answer){
        this.pagesStrings = scripStringList;
        this.optionsList = optionsList;
        this.answer = answer;
    }
}

var dialogues = [
    new DialogData(["<font(30px Arial)><dur(2)>UM... DOIS... TESTANDO!<delay(50)> <color(2)>VERDE, <dur(4)>LENTO <dur(1)> RAPIDO <shake>TREME <shake><wave>BALANÇA <wave><shadow> SOMBRA <font(5px Arial)>pequeno"], ["YES", "NO", "TALVEZ"], []),
];





class MagicGoatInterface{
    constructor(x, y){
        this.x = x;
        this.y = y;

        this.active = false;
        this.visible = true;

        this.goatSprite = new SpriteInstance(sprites[SPR.GOAT], x, y);
        this.goatSprite.setScale(0.5, 0.5);
        this.goatSprite.setOrigin(0.5, 1);

        this.textBoxSize = canvasWidth*0.4;

        this.stateFlow = new StateFlow(0, 100);
        this.stateFlow.trigger();


        this.textBox = new MagicTextBox(this.x, this.y, 0, 40);
        this.textBox.originX = 0.5;
        this.textBox.originY = 0;

        this.answering = false;
        this.answerText = "";
        this.answerAlarm = new Alarm(200);



        this.keyboard = new MagicKeyboard(this.x, this.y + 60, this.textBoxSize*1.5, this);
    }

    setText(text){
        this.textBox.setText(text);
    }

    keyClick(index){
        if(this.answering) return;

        if(index >= 0 && index < 26){
            this.textBox.addChar(String.fromCharCode(65 + index));
        } else if (index == 26){
            this.textBox.addChar("?");
        } else if (index == 27){
            this.textBox.addChar(" ");
        } else if (index == 28){
            this.textBox.removeChar();
        } else if (index == 29){
            this.processText(this.textBox.text);
        }
    }

    processText(text){
        console.log("PROCESSING TEXT: " + text + "...");

        const words = text
            .toUpperCase()
            .replace(/\?/g, "")
            .split(/\s+/);

        const questionMarks = [...text.matchAll(/\?/g)]
            .map(match => match.index);

        const isQuestion = questionMarks.length > 0;
        const questionCount = questionMarks.length;
        const isConfusing = questionCount > 1;

        // ["MAIONESE", "XAROPINHO", "BODE", "SABIO", "TALVEZ", "GRAMA", "FLORES", ""]

  

        var generic = ["SIM", "NÃO", "TALVEZ", "EU NÃO SEI", "PROVAVELMENTE SIM", "PROVAVELMENTE NÃO", "PERGUNTE MAIS TARDE", "NEGATIVO", "POSITIVO"];
        var askedMany = ["SÃO VÁRIAS INTERROGAÇÕES", "QUESTIONAMENTO PROFUNDO", "GRANDES QUESTÕES!", "???", "UMA INTERROGAÇÃO DE CADA VEZ"];
        var noText = ["...", ":^|", "*Silêncio*", "*O bode te encara*", "*O bode desvia o olhar*", "*O bode... cochilou?*", "*Vento misterioso*"];
        var noQuestion = ["ESTÁ AFIRMANDO?", "OK", "TUDO CERTO", "ALGUMA PERGUNTA?", "ONDE QUER CHEGAR?", "HUM..."];
        var questionMark = ["?", "??", "???", "????", "?????", "??????", "???????", "????????", "?????????", "??????????"];
        var askedSome = ["ESQUECI, FIZ ALGUMA PERGUNTA?", "É UMA RESPOSTA?", "NÃO ENTENDI, REPITA", "COMO ASSIM?"];
        var confusing = ["NÃO ENTENDI", "O QUE?", "DE QUE MANEIRA?", "CONFUSO...", "CONTEXTUALIZE", "DIGA MAIS", "EXPLIQUE-SE", "ELABORE A PERGUNTA", "NÃO COMPREENDO", "O QUE QUER DIZER?"];
        var yesorno = ["MINHAS REPOSTAS SÃO BINÁRIAS", "DIGO APENAS SIM OU NÃO", "REFAÇA A PERGUNTA", "SÓ RESPONDO SE É OU NÃO É", "NADA DE QUAL, QUEM, ONDE", "NADA DE QUANDO, COMO, PORQUE", "NADA DE O QUE, PRA QUE, DE QUE"];

        var myAnswers = ["SIM", "NAO", "TALVEZ", "YES", "NO", "MAYBE"];
        var questionWords = ["QUEM", "ONDE", "QUANDO", "PORQUE", "COMO", "QUAL", "QUAIS", "QUE"];

        var answer = "";
        if(words.length == 1 && words[0] == "" && !isQuestion){
            answer = choose(noText);
        } else if(words.length == 1 && words[0] == "" && isQuestion){
            answer = choose(questionMark);
        } else if(words.length > 0 && !isQuestion){

            if(words.length == 1){
                if(myAnswers.includes(words[0])){
                    answer = choose(askedSome);
                } else {
                    answer = choose(noQuestion);
                }
            } else {
                if(questionWords.includes(words[0]) || questionWords.includes(words[1])){
                    answer = choose(yesorno);
                } else {
                    answer = choose(noQuestion);
                }
            }
        } else if(words.length > 0 && isQuestion){

            if(isConfusing){
                answer = choose(askedMany);
            } else {
                if(words.length == 1){
                    answer = choose(confusing);
                } else {
                    if(questionWords.includes(words[0]) || questionWords.includes(words[1])){
                        answer = choose(yesorno);
                    } else {
                        answer = choose(generic);
                    }
                }
            }
        }


        this.answerText = answer;
        console.log("ANSWER: " + this.answerText);
        this.answering = true;
        this.answerAlarm.restart();
    }

    

    listHasAnyWord(list, words){
        for(var word of words){
            if(list.includes(word)) return true;
        }
        return false;
    }

    update(dt){
        this.goatSprite.setPosition(this.x, this.y);
        manager.addDrawRequest(new DrawRequest(this.goatSprite, 0));
        

        if(this.active){

            this.answerAlarm.update(dt);

            if(this.answering && this.answerAlarm.finished){
                this.answering = false;
                this.answerText = "";
            }

            //if(!this.answering){
                for(var i = KeyCodes.KeyA; i < KeyCodes.KeyA+26; i++){
                    if(input.keyState[i][1]){
                        this.keyClick(i - KeyCodes.KeyA);
                    }
                }

                if(input.keyState[KeyCodes.Enter][1]){
                    this.keyClick(29);
                }
                if(input.keyState[KeyCodes.Backspace][1]){
                    this.keyClick(28);
                }
                if(input.keyState[KeyCodes.Space][1]){
                    this.keyClick(27);
                }
                if(input.keyState[KeyCodes.Slash][1] && input.keyState[KeyCodes.Shift][0]){
                    this.keyClick(26);
                }
            //}
            this.textBox.setEditable(!this.answering);

            this.stateFlow.update(dt);
            this.textBox.setWidth(this.stateFlow.progress*this.textBoxSize);
            this.textBox.update(dt);
            this.keyboard.update(dt);
        }
    }

    draw(ctx){

        if(this.answering){
            var progress = this.answerAlarm.percentage();
            var alpha = Math.min(zigzag(progress)*10, 1);
            ctx.fillStyle = "rgba(255,255,255,"+alpha+")";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "72px Fixedsys";


            ctx.fillText(this.answerText, this.x + progress*50, this.y - 200);
        }

        this.textBox.draw(ctx);
        this.keyboard.draw(ctx);
    }
}

class MagicKeyboard{
    constructor(x, y, wid, owner){
        this.x = x;
        this.y = y;
        this.wid = wid;

        this.owner = owner;


        this.keys = [];

        var keyWid = this.wid/13;
        for(var j = 0; j < 2; j++){
            for(var i = 0; i < 13; i++){
                this.keys.push(new MagicKey(
                    this.x + keyWid*i - this.wid*0.5,
                    this.y + keyWid*j,
                    keyWid,
                    String.fromCharCode(65 + (i+j*13)), i+j*13
                ));
            }
        }

        var extraButtons = ["?", "__", "Del", "Ok"];
        for(var i = 0; i < 4; i++){
            this.keys.push(new MagicKey(this.x + keyWid*i - this.wid*0.5, this.y+ keyWid*2, keyWid, extraButtons[i], 26+i));
        }


    }

    update(dt){
        for(var magicKey of this.keys){
            magicKey.update(dt);
        }

        if(input.mouseState[0][1]){
            var clickedKey = null;
            for(var magicKey of this.keys){
                if(magicKey.hovered){
                    clickedKey = magicKey;
                    break;
                }
            }

            if(clickedKey){
                if(this.owner){
                    this.owner.keyClick(clickedKey.index);
                }
            }
        }
    }

    draw(ctx){
        for (var magicKey of this.keys){
            magicKey.draw(ctx);
        }
    }
}

class MagicKey {
    constructor(x, y, size, text, index){
        this.x = x;
        this.y = y;
        this.wid = size;
        this.hei = size;

        this.index = index;

        this.sprite = new SpriteInstance(sprites[SPR.BUTTONS], x, y, 1);
        this.sprite.setScale(this.wid/sprites[SPR.BUTTONS].width);
        this.text = text;

        this.hovered = false;
    }

    checkHover(mouseX, mouseY){
        if(mouseX < this.x || mouseX >= this.x + this.wid) return false;
        if(mouseY < this.y || mouseY >= this.y + this.hei) return false;
        return true;
    }


    update(dt){
        this.hovered = this.checkHover(input.mouseX, input.mouseY);
        this.sprite.setPosition(this.x, this.y);
        if(this.hovered) {
            this.sprite.setFrame(2);
        } else {
            this.sprite.setFrame(1);
        }
    }

    draw(ctx){

        this.sprite.draw(ctx);
        
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "36px Fixedsys";
        ctx.fillText(this.text, this.x + this.wid*0.5, this.y + this.hei*0.5);
    }
}

class MagicTextBox{
    constructor(x, y, wid, hei){
        this.x = x;
        this.y = y;
        this.wid = wid;
        this.hei = hei;
        this.originX = 0;
        this.originY = 0;

        this.text = "";
        this.charLimit = 40;

        this.cursorX = 0;

        this.padding = 10;

        this.editable = false;
        this.active = false;

        this.cursorAlarm = new Alarm(30);
        this.cursorAlarm.loop = true;
    }

    update(dt){
        this.cursorAlarm.update(dt);
    }

    addChar(char){
        this.text += char;
        this.setText(this.text);
    }

    removeChar(){
        this.text = this.text.slice(0, this.text.length-1);
        this.setText(this.text);
    }

    setText(text){
        this.text = text.slice(0, this.charLimit).toUpperCase();
        this.cursorX = this.x - this.originX*this.wid + this.padding + ctx.measureText(this.text + "__").width;
        console.log(this.cursorX);
    }
    setWidth(wid){
        this.wid = wid;
    }

    setHeight(hei){
        this.hei = hei;
    }

    setEditable(editable){
        this.editable = editable;
    }

    draw(ctx){
        
        ctx.strokeStyle = "rgb(120, 120, 120)";
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 3;

        var xx = this.x - this.originX*this.wid;
        var yy = this.y - this.originY*this.hei;

        ctx.fillRect(xx, yy, this.wid, this.hei);
        ctx.strokeRect(xx, yy, this.wid, this.hei);
        ctx.save();
        ctx.beginPath();
        ctx.rect(xx, yy, this.wid, this.hei);
        ctx.clip();

        ctx.fillStyle = "rgb(255,255,255)";
        if(!this.editable){
            ctx.fillStyle = "rgb(120, 120, 120)";
        }
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = "24px Fixedsys";

        if(this.cursorAlarm.percentage() > 0.5 || !this.editable){
            ctx.fillText(this.text, xx + this.padding, yy + this.hei*0.5);
        } else {
            ctx.fillText(this.text + "_", xx + this.padding, yy + this.hei*0.5);
        }

       
        ctx.restore();
    }


}
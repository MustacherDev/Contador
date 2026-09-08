

class GoatQuote extends BaseObject{
    constructor(x,y){
        super(x,y);

        this.goatSprite = new SpriteInstance(sprites[SPR.GOAT], this.x -180, this.y+250);
        this.goatSprite.setScale(-1, 1);
        this.goatSprite.setOrigin(0.5, 1);

        this.quotes = [
            ["Claro que eu converso sozinho","até eu preciso de um conselheiro expert"],
            ["Para evitar se machucar", "apenas não seja acertado"],
            ["Se você não souber o que faz", "o inimigo nunca saberá"],
            ["O homem sábio fica em silêncio", "principalmente porque esqueceu o que ia dizer"],
            ["Não é só porque o homem bobiou", "que ele dançou"],
            ["A.. A", "Atchoooo!"]
        ];

        this.authors = ["Bode Sábio", "Wise Goat", "Kapeth, o Antigo", "???", "Guru da Montanha", "Velho dos Penhascos", "Último Oráculo"];

        this.stateMachine = new StateMachine([60, 150, 200, 80]);
        this.stateMachine.autoProgress = true;
        this.stateMachine.onStateChange = (state) => {this.stateChange(state)};

        // this.textTop = new TextBlock(this.x, this.y, 600, 60);
        // this.textBottom = new TextBlock(this.x, this.y, 600, 60);

        this.setQuote(randInt(0, this.quotes.length), randInt(0, this.authors.length));
    }

    setQuote(quoteIndex, authorIndex){
        this.textTop = new TextBlock(this.x, this.y, 800, 60);
        this.textBottom = new TextBlock(this.x, this.y+40, 800, 60);
        this.textAuthor = new TextBlock(this.x, this.y+100, 600, 60);



        this.textTop.horizontalAlign = "center";
        this.textBottom.horizontalAlign = "center";
        this.textAuthor.horizontalAlign = "left";

        this.textTop.addText('"'+ this.quotes[quoteIndex][0], {
            font: "36px Arial",
            color: "rgb(255, 255, 255)",
            effects:{fadeIn:{}}
        });
        this.textTop.setReveal(true);

        this.textBottom.addText(this.quotes[quoteIndex][1] + '"', {
            font: "36px Arial",
            color: "rgb(255, 255, 255)",
            effects:{fadeIn:{duration:50}}
        });
        this.textBottom.setReveal(true);

        this.textAuthor.addText("- " + this.authors[authorIndex], {
            font: "24px Arial",
            color: "rgb(150, 150, 150)",
            effects:{fadeIn:{duration:50}}
        });
        this.textAuthor.setReveal(true);

        this.textTop.layout();
        this.textBottom.layout();
        this.textAuthor.layout();


        this.textTop.revealSpd = 0;
        this.textBottom.revealSpd = 0;
        this.textAuthor.revealSpd = 0;
    }

    stateChange(state){
        switch(state){
            case 1:
                this.textTop.revealSpd = 0.5;
                break;
            case 2:
                this.textBottom.revealSpd = 0.5;
                this.textAuthor.revealSpd = 0.3;
                break;
            case 3:
                
                SoundPlayer.play(SND.GOAT);
                break;
            case 4:
                this.active = false;
                break;
        }

        
    }

    update(dt){
        this.stateMachine.update(dt);

        this.textTop.update(dt);
        this.textBottom.update(dt);   
        this.textAuthor.update(dt);

        // this.textTop.x = this.x - 100*tweenInOut(this.stateMachine.getProgress(0));
        // this.textBottom.x = this.x + 100*tweenInOut(this.stateMachine.getProgress(1));

        var fadeOutAlpha = tweenIn(1- this.stateMachine.getProgress(3));

        this.textTop.alpha = fadeOutAlpha;
        this.textBottom.alpha = fadeOutAlpha;
        this.textAuthor.alpha = fadeOutAlpha;

        this.goatSprite.setAlpha(fadeOutAlpha * tweenIn(this.stateMachine.getProgress(0)));
    }

    draw(ctx){
        this.textBottom.draw(ctx);
        this.textTop.draw(ctx);
        this.textAuthor.draw(ctx);
        this.goatSprite.draw(ctx);
    }
}
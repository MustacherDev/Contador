class PeachKart{
    constructor(x, y, facing, state){
        this.x = x;
        this.y = y;

        this.hspd = 0;
        this.vspd = 0;

        this.hspdDamp = 1;

        this.imgSpd = 0;
        this.img = (facing == -1) ? 16 : 7;

        this.depth = 0;

        this.state = state;

        switch(state){
            case 0:
                this.hspd = facing*6;
                
                break;  

            case 1:
                this.hspd = facing*6;
                this.imgSpd = 0.25;
                break;  

            case 2:
                this.hspd = facing*8;
                this.hspdDamp = 0.98;
                break;
        }

        this.sprite = new SpriteInstance(sprites[SPR.PEACHKART], x, y);
        this.sprite.setScale(4, 4);
        this.sprite.setOrigin(0.5, 1);

        this.bumpAlarm = new Alarm(30);
        this.bumpAlarm.loop = true;

        this.fadeAlarm = new Alarm(400);
        this.alphaFlow = new StateFlow(2, 40);

        this.active = true;
    }

    update(dt){

        this.x += this.hspd*dt;
        if(this.fadeAlarm.percentage() > 0.2){
            this.hspd *= Math.pow(this.hspdDamp, dt);
        }
        this.y += this.vspd*dt;
        this.img += this.imgSpd*dt;

        this.bumpAlarm.update(Math.abs(dt*this.hspd*0.4));

        var bump = Math.floor(this.bumpAlarm.percentage()*2)*4;
        if(this.state == 1) bump = 0; 

        this.sprite.setPosition(this.x, this.y -bump);
        this.sprite.setFrame(this.img);
        this.sprite.setAlpha(this.alphaFlow.progress);

        if(this.state == 2 && Math.abs(this.hspd) < 0.04){
            this.active = false;
            manager.addParticle(particleExplosion(this.x, this.y));
            SoundPlayer.play(SND.EXPLOSION);
        }

        this.fadeAlarm.update(dt);
        if(this.fadeAlarm.finished){
            this.alphaFlow.hide();
            this.fadeAlarm.stop();
        }

        this.alphaFlow.update(dt);
        if(this.alphaFlow.state == 0) {
            this.active = false;
        }





        manager.addDrawObject(this);
    }

    draw(ctx){
        this.sprite.draw(ctx);
    }
}
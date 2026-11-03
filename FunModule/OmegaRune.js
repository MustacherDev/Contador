

class OmegaRune extends ManagerObject{
    constructor(x,y){
        super(x, y);

        this.bullets = [];

        this.heart = this.addObject(new OmegaHeart(this, this.x, this.y, randInt(0, OmegaHeart.typeNum)));
        this.box = this.addObject(new OmegaBox(this, this.x, this.y));

        this.startAlarm = new Alarm(100);
        this.bulletSpawnAlarm = new Alarm(100);
    }

    addBullet(bullet){
        this.bullets.push(bullet);
        this.addObject(bullet);
    }

    update(dt){
        
        this.updateObjects(dt);

        if(!this.active) return;

        // REMOVE INACTIVE BULLETS
        for(var i = 0; i < this.bullets.length; i++){
            var bullet = this.bullets[i];
            if(bullet.active) continue;

            this.bullets.splice(i, 1);
            i--;
        }


        this.startAlarm.update(dt);
        this.bulletSpawnAlarm.update(dt);

        if(this.bulletSpawnAlarm.finished){
            var xx = this.x + randRange(-canvasWidth*0.1, canvasWidth*0.1);
            var yy = this.y - canvasHeight*0.4 + randRange(-100, 100);

            var type = randInt(0, OmegaBullet.typeNum);
            var bullet = null;
            var dir = choose([1, -1]);
            var ang = randRange(0, Math.PI/0.5);
            var rad = 200 + randInt(0, canvasHeight*0.25);
            var xRad = this.x + Math.cos(ang)*rad;
            var yRad = this.y + Math.sin(ang)*rad;

            switch(type){
                case 0:
                    bullet = new SoccerBallOmegaBullet(this, randInt(canvasWidth*0.5, canvasWidth*0.5+200)*dir, canvasHeight*0.5, this.y + 200,  -dir);
                break;
                case 1:
                    bullet = new PillOmegaBullet(this,xx, yy);
                    break;
                case 2:
                    bullet = new HatOmegaBullet(this,xx, yy);
                    break;
                case 3:
                    bullet = new FlyOmegaBullet(this,xRad, yRad);
                    break;
            }

            this.addBullet(bullet);
            this.bulletSpawnAlarm.restart();
        }

        var t = this.startAlarm.percentage();
        this.box.setWidth(48 + 200*t);
        this.box.setHeight(48 + 200*t);

       
    }

    pushDraw(){
        if(!this.visible) return;
        this.pushDrawObjects();

        manager.addDrawObject(this);
    }

    draw(ctx){
        var wid = 200;
        var hei = 20;
        var xx = this.x - wid*0.5; 
        var yy = this.y + 200;
        var ratio = this.heart.hp/this.heart.hpMax;
        ctx.fillStyle = "rgb(255,0,0)";
        ctx.fillRect(xx, yy, wid, hei);
        ctx.fillStyle = "rgb(0,255,0)";
        ctx.fillRect(xx, yy, wid*ratio, hei);
    }
}

class OmegaObject extends GameObject{
    constructor(x, y, omegaManager){
        super(x, y);
        this.omegaManager = omegaManager;
    }
}

class OmegaBox extends OmegaObject{
    constructor(omegaManager, x, y){
        super(x, y, omegaManager);
        this.wid = 40;
        this.hei = 40;

        this.originX = 0.5;
        this.originY = 0.5;

        this.box = new BoundingBox(this.x, this.y, this.wid, this.hei);
        this.box.setOrigin(0.5, 0.5);
    }

    checkBorder(x, y, border){
        this.box.width -= border*2;
        this.box.height -= border*2;
        var result = this.box.contains(x, y);
        this.box.width = this.wid;
        this.box.height = this.hei;
        return result;
    }

    setWidth(wid){
        this.wid = wid;
        this.box.width = wid;
    }

     setHeight(hei){
        this.hei = hei;
        this.box.height = hei;
    }


    update(dt){
        this.box.setPosition(this.x, this.y);
    }

    draw(ctx){
        var lineWid = 8;
        ctx.lineWidth = lineWid;
        var wid = lineWid*2 + this.wid;
        var hei = lineWid*2 + this.hei;
        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.fillRect(this.x -wid*this.originX, this.y - hei*this.originY, wid, hei);
        ctx.strokeStyle = "rgb(43, 255, 0)";
        ctx.strokeRect(this.x -wid*this.originX, this.y - hei*this.originY, wid, hei);
    }
}


class OmegaHeart extends OmegaObject{
    static typeNum = 7;
    constructor(omegaManager, x, y, type){
        super(x, y, omegaManager);
        this.wid = 32;
        this.hei = 32;

        this.sprite = new SpriteInstance(sprites[SPR.HEART], this.x, this.y);
        var scl = this.wid/this.sprite.getSprWidth();
        this.sprite.setScale(scl);
        this.sprite.setOrigin(0.5, 0.5);

        this.spriteGraze = new SpriteInstance(sprites[SPR.HEART], this.x, this.y, 7);
        this.spriteGraze.setScale(scl*2.5);
        this.spriteGraze.setOrigin(0.5, 0.5);

        this.box = new BoundingBox(this.x, this.y, this.wid, this.hei);
        this.box.setOrigin(0.5, 0.5);

        this.boxHit = new BoundingBox(this.x, this.y, this.wid*1/8, this.hei*1/8);
        this.boxHit.setOrigin(0.5, 0.5);

        this.boxGraze = new BoundingBox(this.x, this.y, this.wid*2.8, this.hei*2.8);
        this.boxGraze.setOrigin(0.5, 0.5);

        this.hitCooldown = new Alarm(20);
        this.grazeCooldown = new Alarm(30);

        this.hpMax = 120;
        this.hp = this.hpMax;
        this.tp = 0;
        this.spd = 5;

        this.lastGrazeBullet = null;

  

        this.type = 0;
        this.setType(type);

        this.depth = -100;
    }

    setType(type){
        this.type = type % OmegaHeart.typeNum;
        this.sprite.setFrame(this.type);
    }

    getHit(bullet){
        if(!this.hitCooldown.finished) return;
        this.hitCooldown.restart();
        this.hp -= bullet.getDamage();
        SoundPlayer.play(SND.HEARTHIT);
    }

    getGraze(bullet){
        if(this.grazeCooldown.percentage < 0.5) return;
        if(this.lastGrazeBullet != bullet) {
            this.lastGrazeBullet = bullet;
        } else {
            if(!this.grazeCooldown.finished) return;
        }

        
        this.grazeCooldown.restart();
        SoundPlayer.play(SND.HEARTGRAZE);
        
        this.tp += bullet.getTp();
    }

    update(dt){
        this.sprite.setAlpha(1-tweenInOut(zloop(this.hitCooldown.percentage(), 2)));
        this.sprite.setPosition(this.x, this.y);
        this.box.setPosition(this.x, this.y);
        this.boxHit.setPosition(this.x, this.y);
        this.boxGraze.setPosition(this.x, this.y);

        this.hitCooldown.update(dt);
        this.grazeCooldown.update(dt);

        this.spriteGraze.setPosition(this.x, this.y);
        this.spriteGraze.setAlpha(1- this.grazeCooldown.percentage());

        var moveY = input.keyState[KeyCodes.KeyS][0] - input.keyState[KeyCodes.KeyW][0];
        var moveX = input.keyState[KeyCodes.KeyD][0] - input.keyState[KeyCodes.KeyA][0];

        if(!this.omegaManager.box.checkBorder(this.x + moveX*this.spd, this.y, this.wid/6)) moveX = 0;
        if(!this.omegaManager.box.checkBorder(this.x, this.y + moveY*this.spd, this.hei/6)) moveY = 0;

        this.x += moveX*this.spd*dt;
        this.y += moveY*this.spd*dt;


        // CHECKING FOR BULLET COLLISIONS
        for(var bullet of this.omegaManager.bullets){
            if(bullet.box.intersects(this.boxHit)) {
                this.getHit(bullet);
                this.getGraze(bullet);
                continue;
            }

            if(bullet.box.intersects(this.boxGraze)) {  
                this.getGraze(bullet);
                continue;
            }
        }


    }

    draw(ctx){
        this.sprite.draw(ctx);
        this.spriteGraze.draw(ctx);
    }
}

class OmegaBullet extends OmegaObject{
    static typeNum = 4;

    constructor(omegaManager,x, y, wid, hei, type){
        super(x, y, omegaManager);

        this.omegaManager = omegaManager;

        this.wid = wid;
        this.hei = hei;

        this.type = type;

        this.hspd = 0;
        this.vspd = 0;
        this.ang = 0;
        this.angSpd = 0;

        this.life = 400;

        this.box = new BoundingBox(this.x, this.y, this.wid, this.hei);
        this.box.setOrigin(0.5, 0.5);
    }


    getTp(){
        return 1;
    }

    getDamage(){
        return 5;
    }

    update(dt){}

    pushDraw(){
        manager.addDrawObject(this);
    }

    draw(ctx){
        if(!this.active) return;
        if(this.sprite) this.sprite.draw(ctx);
    }
}

class PillOmegaBullet extends OmegaBullet{
    constructor(omegaManager, x, y){
        super(omegaManager, x, y, 24,12, 1);
        this.sprite = new SpriteInstance(sprites[SPR.OMEGABULLETS], this.x, this.y);
        this.sprite.setFrame(this.type);

        this.scl = 3;
        this.wid *= this.scl;
        this.hei *= this.scl;
        this.sprite.setScale(this.scl);
        this.sprite.setOrigin(0.5, 0.5);

        this.vspd = 5;


    } 

    update(dt){
        if(!this.active) return;
        this.life -= dt;

        this.x += this.hspd*dt;
        this.y += this.vspd*dt;
        this.ang += this.angSpd*dt;

        this.sprite.setPosition(this.x, this.y);
        this.sprite.setRotation(this.ang);
        this.box.setPosition(this.x, this.y);

    }
}



class HatOmegaBullet extends OmegaBullet{
    constructor(omegaManager, x, y){
        super(omegaManager, x, y, 12,12, 2);
        this.sprite = new SpriteInstance(sprites[SPR.OMEGABULLETS], this.x, this.y);
        this.sprite.setFrame(this.type);

        this.scl = 3;
        this.wid *= this.scl;
        this.hei *= this.scl;
        this.sprite.setScale(this.scl);
        this.sprite.setOrigin(0.5, 0.5);

        this.vspd = 5;


    } 

    update(dt){
        if(!this.active) return;
        this.life -= dt;

        this.x += this.hspd*dt;
        this.y += this.vspd*dt;
        this.ang += this.angSpd*dt;

        this.sprite.setPosition(this.x, this.y);
        this.sprite.setRotation(this.ang);
        this.box.setPosition(this.x, this.y);

    }
}

class FlyOmegaBullet extends OmegaBullet{
    constructor(omegaManager, x, y){
        super(omegaManager, x, y, 6,6, 3);

        this.sprite = new SpriteInstance(sprites[SPR.OMEGABULLETS], this.x, this.y);
        this.sprite.setFrame(this.type);

        this.scl = 3;
        this.wid *= this.scl;
        this.hei *= this.scl;
        this.sprite.setScale(this.scl);
        this.sprite.setOrigin(1, 0.5);

        this.ang = randRange(0, Math.PI*2);

        this.phase = "spin";
        this.phaseTimer = 0;

        // Spin
        this.spinSpeed = 0.12;
        this.spinDeceleration = 0.08;

        // Aim
        this.aimDuration = 80;
        this.aimStartAng = 0;
        this.aimTargetAng = 0;

        // Dash
        this.dashSpeed = 16;
        this.dashDuration = 100;
    }

    update(dt){
        this.phaseTimer += dt;

        switch(this.phase){
            case "spin":{
                this.ang += this.spinSpeed * dt;
                this.spinSpeed = Math.max(0, this.spinSpeed - this.spinDeceleration * dt);

                if(this.spinSpeed <= 0){
                    this.phase = "aim";
                    this.phaseTimer = 0;

                    let player = this.omegaManager.heart;

                    this.aimStartAng = this.ang;
                    this.aimTargetAng = Math.atan2(
                        player.y - this.y,
                        player.x - this.x
                    );
                }
                break;
            }

            case "aim":{
                let t = Math.min(this.phaseTimer / this.aimDuration, 1);

                // Smooth interpolation
                t = t * t * (3 - 2 * t);

                let diff = Math.atan2(
                    Math.sin(this.aimTargetAng - this.aimStartAng),
                    Math.cos(this.aimTargetAng - this.aimStartAng)
                );

                this.ang = this.aimStartAng + diff * t;

                if(this.phaseTimer >= this.aimDuration){
                    this.phase = "dash";
                    this.phaseTimer = 0;
                }
                break;
            }

            case "dash":{
                this.x += Math.cos(this.ang) * this.dashSpeed * dt;
                this.y += Math.sin(this.ang) * this.dashSpeed * dt;

                if(this.phaseTimer >= this.dashDuration){
                    this.phase = "despawn";
                }
                break;
            }

            case "despawn":{
                this.active = false;
                break;
            }
        }

        this.sprite.setPosition(this.x, this.y);
        this.sprite.setRotation(this.ang);
        this.box.setPosition(this.x, this.y);

    }

}

class SoccerBallOmegaBullet extends OmegaBullet{
    constructor(omegaManager, x, y, groundY, dir = 1){
        super(omegaManager, x, y, 12, 12, 0);

        this.sprite = new SpriteInstance(sprites[SPR.OMEGABULLETS], this.x, this.y);
        this.sprite.setFrame(this.type);
        this.sprite.setOrigin(0.5, 0.5);

        this.scl = 3;
        this.wid *= this.scl;
        this.hei *= this.scl;
        this.sprite.setScale(this.scl);

        // Horizontal movement
        this.hspd = 6 * dir;

        // Vertical movement
        this.groundY = groundY;
        this.vspd = -10;
        this.gravity = 0.2;
        this.bounce = 1;

        // Lifetime
        this.lifetime = 500;
        this.timer = 0;

        this.ang = 0;
        this.angSpd = 0.04;
    }

    update(dt){
        this.timer += dt;

        if(this.timer >= this.lifetime){
            this.active = false;
            return;
        }

        // Horizontal movement
        this.x += this.hspd * dt;

        // Vertical movement
        this.vspd += this.gravity * dt;
        this.y += this.vspd* dt;

        // Ground collision and bounce
        if(this.y >= this.groundY){
            this.y = this.groundY;
            this.vspd = -Math.abs(this.vspd) * this.bounce;
        }

        this.ang += this.angSpd*dt;

        this.sprite.setPosition(this.x, this.y);
        this.sprite.setRotation(this.ang);
        this.box.setPosition(this.x, this.y);
    }
}
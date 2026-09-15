
class FunRoom {
    constructor(xSlot, ySlot){
        this.xSlot = xSlot;
        this.ySlot = ySlot;

        this.visible = false;
        this.active = false;

        this.ambientMusic = -1;
        this.ambientMusicTimestamp = 0;
        this.stopMusic = true;
        this.restartMusic = true;

        this.objects = [];
    }


    

    setActive(active){
        if(active == this.active) return;
        for(var obj of this.objects){
            obj.setActive(active);
        }
        this.active = active;
    }

    setVisible(visible){
        if(visible == this.visible) return;
        for(var obj of this.objects){
            obj.changeVisible(visible);
        }
        this.visible = visible;
    }

    addObject(obj){
        this.objects.push(obj);
        obj.setActive(this.active);
        obj.changeVisible(this.visible);
    }

    update(dt){
        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].update(dt);
        }
    }

    getX(){
        return this.xSlot*canvasWidth;
    }

    getY(){
        return this.ySlot*canvasHeight;
    }

    draw(ctx){
        for(var i = 0; i < this.objects.length; i++){
            this.objects[i].pushDraw(ctx);
        }
    }
}

class FunRoomViewer{
    constructor(x, y, camera){
        this.x = x;
        this.y = y;

        this.xSlot = 0;
        this.ySlot = 0;

        this.xSlotPrev = 0;
        this.ySlotPrev = 0;

        this.moving = false;
        this.alarm = new Alarm(100);
        this.alarm.stop();

        this.locked = false;

        this.camRoomXOff = 0;
        this.camRoomYOff = 0;

        this.tripleTapAlarm = new Alarm(50);
        this.tapXSide = 0;
        this.tapYSide = 0;
        this.tapSequence = 0;

        this.camera = camera;
    }

    isRoomVisible(room){    
        if(room.xSlot == this.xSlot && room.ySlot == this.ySlot) return true;
        if(this.moving && (room.xSlot == this.xSlotPrev && room.ySlot == this.ySlotPrev)) return true;
        return false;
    }

    isRoomActive(room){
        if(this.moving) return false;
        if(room.xSlot == this.xSlot && room.ySlot == this.ySlot) return true;
        return false;
    }

    getSlotKey(xSlot, ySlot){
        return `${xSlot},${ySlot}`;
    }

    getRoom(xSlot, ySlot){
        return manager.roomsMap.get(this.getSlotKey(xSlot, ySlot));
    }

    changeRoom(slotX, slotY){
        this.xSlot = slotX;
        this.ySlot = slotY;

        this.moving = true;
        this.alarm.start();

  
        var oldRoom = this.getRoom(this.xSlotPrev, this.ySlotPrev);  
        var currentMusic = SoundPlayer.getMusic();
        var currentMusicTimestamp = 0;

        if(currentMusic != -1){
            var currentMusicTimestamp = SoundPlayer.getTimestamp(currentMusic);
            if(oldRoom?.stopMusic){
                SoundPlayer.fadeMusicStop(SoundPlayer.getMusic(), 20*this.alarm.duration/2);
            } else {
                SoundPlayer.fadeMusic(SoundPlayer.getMusic(), 20*this.alarm.duration/2);
            }
        }

        
        if(oldRoom){
            if(oldRoom.ambientMusic != -1){
                oldRoom.ambientMusicTimestamp = currentMusicTimestamp;
            }
        }

        var newRoom = this.getRoom(this.xSlot, this.ySlot);
        if(!newRoom) return;
        if(newRoom.ambientMusic == -1) return;

        SoundPlayer.playMusic(newRoom.ambientMusic);
        SoundPlayer.fadeIn(newRoom.ambientMusic, 20*this.alarm.duration/2);

        if(!newRoom.restartMusic){
            SoundPlayer.setTimestamp(newRoom.ambientMusic, newRoom.ambientMusicTimestamp);
        }
    }

    checkBorderTap(){
        var diffX = ((input.mouseCanvasX/canvasWidth)  - 0.5)*2;
        var diffY = ((input.mouseCanvasY/canvasHeight) - 0.5)*2;

        if(Math.abs(diffX) < 0.8) diffX = 0;
        if(Math.abs(diffY) < 0.8) diffY = 0;

        console.log(diffX, diffY);
        if(diffX == 0 && diffY == 0) return {valid:false};
        return {valid:true, xSide: sign(diffX), ySide:sign(diffY)};
    }


    update(dt){
        this.alarm.update(dt);
        if(this.alarm.finished){
            this.alarm.stop();
            this.xSlotPrev = this.xSlot;
            this.ySlotPrev = this.ySlot;
            this.moving = false;
        }   

        this.tripleTapAlarm.update(dt);
        if(this.tripleTapAlarm.finished){
            this.tapSequence = 0;
        }

        if(!this.moving && !this.locked){
            var movX = -input.keyState[KeyCodes.ArrowLeft][1] + input.keyState[KeyCodes.ArrowRight][1];
            var movY = -input.keyState[KeyCodes.ArrowUp][1] + input.keyState[KeyCodes.ArrowDown][1];
            if(movX != 0){
                this.xSlot += movX;
                this.moving = true;
            }
            if(movY != 0){
                this.ySlot += movY;
                this.moving = true;
            }

            if(input.mouseState[0][1]){
                if(this.tapSequence == 0){
                    var tapInfo = this.checkBorderTap();
                    if(tapInfo.valid){
                        this.tapXSide = tapInfo.xSide;
                        this.tapYSide = tapInfo.ySide;
                        this.tapSequence++;
                        this.tripleTapAlarm.restart();
                        console.log("FIRST TAP");
                    }
                } else {
                    var tapInfo = this.checkBorderTap();
                    if(tapInfo.valid){
                        this.tapSequence++;

                        if(this.tapXSide != tapInfo.xSide || this.tapYSide != tapInfo.ySide){
                            this.tapXSide = tapInfo.xSide;
                            this.tapYSide = tapInfo.ySide;
                            this.tapSequence = 1;
                            this.tripleTapAlarm.restart();
                            console.log("FIRST TAP");
                        }
                    }


                    if(this.tapSequence >= 3){
                        movX = this.tapXSide;
                        movY = this.tapYSide;
                        this.xSlot += movX;
                        this.ySlot += movY;
                        this.moving = true;
                        this.tapSequence = 0;
                        console.log("THIRD TAP");
                    }
                }
            }

            

            if(this.moving) this.changeRoom(this.xSlot, this.ySlot);

      
                
            

        }


        var t = tweenInOut(this.alarm.percentage());
        var tInv = 1-t;
        this.x = (this.xSlot*t + this.xSlotPrev*tInv)*canvasWidth;
        this.y = (this.ySlot*t + this.ySlotPrev*tInv)*canvasHeight;
        this.camera.x = canvasWidth*0.5 + this.x + this.camRoomXOff;
        this.camera.y = canvasHeight*0.5 + this.y + this.camRoomYOff;
    }
}

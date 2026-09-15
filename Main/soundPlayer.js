class SoundPlayer {

  static play(soundInd) {
    sounds[soundInd].howl.volume(sounds[soundInd].vol);
    //console.log(sounds[soundInd].howl.volume() + " HOWLER VOLUME ");
    return sounds[soundInd].howl.play();
  }

  static pause(soundInd, soundId = -1) {
    if (soundId == -1) {
      sounds[soundInd].howl.pause();
    } else {
      sounds[soundInd].howl.pause(soundId);
    }
  }

  static stop(soundInd, soundId = -1) {
    if (soundId == -1) {
      sounds[soundInd].howl.stop();
    } else {
      sounds[soundInd].howl.stop(soundId);
    }
  }

  // MAKES A SOUND FADE VOLUME TO 0 AND THEN STOP
  static fadingStop(soundInd, duration = 1000, soundId = -1) {
    if (soundId == -1) {
      sounds[soundInd].howl.fade(sounds[soundInd].vol, 0, duration);
      sounds[soundInd].howl.once('fade', () => {
        let ind = this.allMusicPlaying.indexOf(soundId);
        if(ind != -1){
          this.allMusicPlaying.splice(ind, 1);
        }
        sounds[soundInd].howl.stop();
      });
    } else {
      sounds[soundInd].howl.fade(sounds[soundInd].vol, 0, duration, soundId).once('fade', () => {
        let ind = this.allMusicPlaying.indexOf(soundId);
        if(ind != -1){
          this.allMusicPlaying.splice(ind, 1);
        }
        sounds[soundInd].howl.stop(soundId);
      });
    }
  }

  static fadeOut(soundInd, duration = 1000, soundId = -1) {
    if (soundId == -1) {
      sounds[soundInd].howl.fade(sounds[soundInd].vol, 0, duration);
    }
  }

  
  static fadeIn(soundInd, duration = 2000, startVol = 0){
    if(soundInd == -1) return;

    sounds[soundInd].howl.volume(startVol);
    console.log(sounds[soundInd].howl.volume() + " HOWLER VOLUME ");
    sounds[soundInd].howl.fade(startVol,sounds[soundInd].vol, duration);
  }

  static fadeRange(soundInd, startVol, endVol,  duration = 2000){
    if(soundInd == -1) return;

    sounds[soundInd].howl.volume(startVol);
    sounds[soundInd].howl.fade(startVol,endVol, duration);
  }

  static fadeToVolume(soundInd, endVol,  duration = 2000){
    if(soundInd == -1) return;

    const currentVol = sounds[soundInd].howl.volume();

    const startVol = currentVol === undefined
        ? sounds[soundInd].vol
        : currentVol;

    sounds[soundInd].howl.fade(startVol, endVol, duration);
  }



  /////// MUSIC STUFF
  // WHILE SOUNDS CAN BE PLAYED TOGETHER, MUSIC IS A TYPE OF SOUND
  // THAT CAN'T HAVE MULTIPLE BEING PLAYED TOGETHER, ONLY ONE AT A TIME

  //static currentMusic = -1;
  static channelNum = 4;
  static musicChannels = [-1, -1, -1, -1];
  static allMusicPlaying = [];

  static getMusic(channel = 0){
    return this.musicChannels[channel];
  }

  static setMusic(musicInd, channel = 0){
    this.musicChannels[channel] = musicInd; 
  }

  static playMusic(musicInd, channel = 0) {
    var curMusic = this.getMusic(channel);

    if (musicInd == -1) return;
    if (musicInd == curMusic) return;

    if (curMusic != -1) {
      this.fadingStop(curMusic, 2000);
    }


    if(this.allMusicPlaying.includes(musicInd)) {
      this.fadeIn(musicInd);
      this.setMusic(musicInd, channel);
      return;
    }



    this.play(musicInd);
    this.allMusicPlaying.push(musicInd);
    this.setMusic(musicInd, channel);
  }

  static getTimestamp(soundInd){
    if(soundInd == -1) return 0;
    return sounds[soundInd].howl.seek();
  }

  static setTimestamp(soundInd, timestamp){
    if(soundInd == -1) return false;
    sounds[soundInd].howl.seek(timestamp);
    return true;
  }


  static fadeMusic(musicInd, duration = 2000, channel = 0) {
    if (musicInd == -1) return;

    var curMusic = this.getMusic(channel);


    this.fadeOut(musicInd, duration);
    if (curMusic == musicInd) {
      this.setMusic(-1, channel);
    }
  }

  static fadeMusicStop(musicInd, duration = 2000, channel = 0) {
    if (musicInd == -1) return;

    var curMusic = this.getMusic(channel);


    this.fadingStop(musicInd, duration);
    if (curMusic == musicInd) {
      this.setMusic(-1, channel);
    }
  }

  static stopMusic(musicInd, channel = 0) {
    if (musicInd == -1) return;

    this.stop(musicInd);
    if (this.getMusic(channel) == musicInd) {
      this.setMusic(-1, channel);
    }
  }
}


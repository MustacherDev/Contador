Howler.autoUnlock = true;

const SPR = new Enum();
var sprites = [];

const SND = new Enum();
var sounds = [];



class MustTexture{
  constructor(path){
    this.path = path;
    this.image = null;
  }

  createImage(){
    var image = new Image();
    image.src = this.path;
    this.image = image;
    return image;
  }

  checkLoaded(){
    if(!this.image) return;
    return this.image.complete;
  }
}

class MustAudio {
  constructor(howlAudio) {
    this.howl = howlAudio;
    this.vol = 0.5;
    this.looping = false;
    this.volume(this.vol);
    this.loop(false);
  }


  volume(volume) {
    this.vol = volume;
    this.howl.volume(volume);
  }

  loop(loop) {
    this.looping = loop;
    this.howl.loop(loop);
  }
}


class Assets{ 

  static images = new Map(); 
  static sprites = new Map();
  static audios = new Map(); 

  static texturesLoaded = false;
  static spritesLoaded = false;

  static checkTextures(){
    for (var [key, texture] of this.images) {
      if (!texture.checkLoaded()) {
        return false;
      }
    }
    this.texturesLoaded = true;
    return true;
  }

  static loadSprites(){
    if (this.spritesLoaded) return;

    SPR.addEntry("TOTAL");
    SND.addEntry("TOTAL");

    for (var i = 0; i < SPR.TOTAL; i++) {
      sprites[i].configure();
    }

    this.spritesLoaded = true;
  }
  
  
  static addSound(enumName, path, config = {}){
    var volume = config.volume ?? 0.5;
    var loop = config.loop ?? false;
    var sound = new MustAudio(new Howl({ src: [path] }));
    sound.volume(volume);
    sound.loop(loop);
    this.audios.set(enumName, sound);
    SND.addEntry(enumName);
    sounds.push(sound);
  }

  static getSound(key){
    return this.audios.get(key);
  }

  static addSprite(enumName, path, config = {}){
    var texture = this.images.get(path);

    if(!texture){
      texture = this.addTexture(path);
    }

    var wid = config.wid ?? -1;
    var hei = config.hei ?? -1;

    var sprite = new Sprite(texture, wid, hei);
    
    if(wid != -1 && hei != -1){
      var cols = config.cols ?? 1;
      var rows = config.rows ?? 1;
      var imgX = config.imgX ?? 0;
      var imgY = config.imgY ?? 0;

      sprite.spriteMap.setImages(imgX, imgY, wid, hei, cols, rows, false);
    } 

    this.sprites.set(enumName, sprite);
    SPR.addEntry(enumName);
    sprites.push(sprite);
  }

  static getSprite(key){
    return this.sprites.get(key);
  }

  static addTexture(path){
    var texture = new MustTexture(path);
    texture.createImage();
    this.images.set(path, texture);
    return texture;
  }
}






class SoundPlayer {

  static play(soundInd) {
    sounds[soundInd].howl.volume(sounds[soundInd].vol);
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
        sounds[soundInd].howl.stop();
      });
    } else {
      sounds[soundInd].howl.fade(sounds[soundInd].vol, 0, duration, soundId).once('fade', () => {
        sounds[soundInd].howl.stop(soundId);
      });
    }
  }

  
  static fadeIn(soundInd, duration = 2000, startVol = 0){
    if(soundInd == -1) return;

    sounds[soundInd].howl.fade(startVol,sounds[soundInd].vol, duration);
  }

  static fadeRange(soundInd, startVol, endVol,  duration = 2000){
    if(soundInd == -1) return;

    sounds[soundInd].howl.fade(startVol,endVol, duration);
  }

  static fadeToVolume(soundInd, endVol,  duration = 2000){
    if(soundInd == -1) return;

    var startVol = sounds[soundInd].howl.volume() || sounds[soundInd].vol;
    sounds[soundInd].howl.fade(startVol, endVol, duration);
  }



  /////// MUSIC STUFF
  // WHILE SOUNDS CAN BE PLAYED TOGETHER, MUSIC IS A TYPE OF SOUND
  // THAT CAN'T HAVE MULTIPLE BEING PLAYED TOGETHER, ONLY ONE AT A TIME

  //static currentMusic = -1;
  static channelNum = 4;
  static musicChannels = [-1, -1, -1, -1];

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

    this.play(musicInd);
    this.setMusic(musicInd, channel);
  }


  static fadeMusic(musicInd, duration = 2000, channel = 0) {
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



Assets.addSound("TICK", "Sounds/tick.mp3", 0.6);
Assets.addSound("TOCK", "Sounds/tock.mp3", 0.6);
Assets.addSound("CORRECT", "Sounds/correct.wav");
Assets.addSound("WATERDROP", "Sounds/waterDrop1.mp3");
Assets.addSound("POP", "Sounds/Pop.mp3");
Assets.addSound("POOF", "Sounds/poof.mp3");
Assets.addSound("WRENCH", "Sounds/socketWrench.mp3");
Assets.addSound("SPLASH", "Sounds/splash.mp3");
Assets.addSound("SHOOT", "Sounds/Shoot1.wav");
Assets.addSound("STOMP", "Sounds/stomp.mp3");
Assets.addSound("EXPLOSION", "Sounds/explosion.wav", 0.2);
Assets.addSound("DRMARIOBUMP", "Sounds/DrMario/drBump.wav");
Assets.addSound("DRMARIOMOVE", "Sounds/DrMario/drMove.wav");
Assets.addSound("DRMARIOCLEARVIRUS", "Sounds/DrMario/drClearVirus.wav");
Assets.addSound("DRMARIOCLEARPILL", "Sounds/DrMario/drClearPill.wav");
Assets.addSound("GOAT", "Sounds/goat.wav");
Assets.addSound("BOSSAUSADA", "Sounds/Bossa Usadinha.mp3",{loop:true});
Assets.addSound("MUSICDRAMA", "Sounds/The Four Seasons.mp3");
Assets.addSound("MEOW", "Sounds/meow.wav");

Assets.addSprite("PORTRAITS", "Sprites/portrait2.png", {wid:256, hei:256, cols:6, rows:6});
Assets.addSprite("PORTRAITS2", "Sprites/portrait3.png", {wid:256, hei:256, cols:6, rows:3});
Assets.addSprite("PEACHKART", "Sprites/peachKart.png", {wid:32, hei:32, cols:12, rows:2});
Assets.addSprite("EXPLOSION", "Sprites/explosion.png", {wid:71, hei:100, cols:6, rows:3});
Assets.addSprite("DRMARIOSHEET", "Sprites/DrMarioSheet2.png", {wid:8, hei:8, cols:6, rows:5});
Assets.addSprite("GOAT", "Sprites/bode.png");
Assets.addSprite("PLANTS", "Sprites/plants.png", {wid:16, hei:16, cols:5, rows:1});
Assets.addSprite("BUTTONS", "Sprites/buttons.png", {wid:20, hei:20, cols:1, rows:3});
Assets.addSprite("CLOCK", "Sprites/clockSheet.png", {wid:16, hei:16, cols:8, rows:1});
Assets.addSprite("TROPHIES", "Sprites/trophies.png", {wid:16, hei:16, cols:6, rows:4});
Assets.addSprite("KNOWLEDGE", "Sprites/knowledge.png", {wid:640, hei:360, cols:3, rows:5});
Assets.addSprite("STAR", "Sprites/star.png", {wid:128, hei:128, cols:2, rows:1});
Assets.addSprite("BIGCLOCK", "Sprites/bigClock.png", {wid:16, hei:48, cols:3, rows:1});
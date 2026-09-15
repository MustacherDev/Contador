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










Assets.addSound("TICK", "Sounds/tick.mp3", {volume:0.6});
Assets.addSound("TOCK", "Sounds/tock.mp3", {volume:0.6});
Assets.addSound("CORRECT", "Sounds/correct.wav");
Assets.addSound("WATERDROP", "Sounds/waterDrop1.mp3");
Assets.addSound("POP", "Sounds/Pop.mp3");
Assets.addSound("POOF", "Sounds/poof.mp3");
Assets.addSound("WRENCH", "Sounds/socketWrench.mp3");
Assets.addSound("SPLASH", "Sounds/splash.mp3");
Assets.addSound("SHOOT", "Sounds/Shoot1.wav");
Assets.addSound("STOMP", "Sounds/stomp.mp3");
Assets.addSound("EXPLOSION", "Sounds/explosion.wav", {volume:0.2});
Assets.addSound("DRMARIOBUMP", "Sounds/DrMario/drBump.wav");
Assets.addSound("DRMARIOMOVE", "Sounds/DrMario/drMove.wav");
Assets.addSound("DRMARIOCLEARVIRUS", "Sounds/DrMario/drClearVirus.wav");
Assets.addSound("DRMARIOCLEARPILL", "Sounds/DrMario/drClearPill.wav");
Assets.addSound("GOAT", "Sounds/goat.wav");
Assets.addSound("BOSSAUSADA", "Sounds/Bossa Usadinha.mp3",{loop:true});
Assets.addSound("MUSICDRAMA", "Sounds/The Four Seasons.mp3");
Assets.addSound("MEOW", "Sounds/meow.wav",{volume:0.2});
Assets.addSound("KEYPRESS1", "Sounds/keyPress1.mp3");
Assets.addSound("KEYPRESS2", "Sounds/keyPress2.mp3");
Assets.addSound("KEYPRESS3", "Sounds/keyPress3.mp3");
Assets.addSound("KEYRELEASE1", "Sounds/keyRelease1.mp3");
Assets.addSound("KEYRELEASE2", "Sounds/keyRelease2.mp3");
Assets.addSound("KEYRELEASE3", "Sounds/keyRelease3.mp3");
Assets.addSound("DOGBARK", "Sounds/dogBark.mp3");
Assets.addSound("WRONG", "Sounds/wrong.wav");
Assets.addSound("UFO", "Sounds/UFO.wav");
Assets.addSound("CHICKEN", "Sounds/chicken.mp3");
Assets.addSound("BOING", "Sounds/boing.wav");
Assets.addSound("MUSICSPOTUS", "Sounds/Spotus Quest.mp3",{loop:true});
Assets.addSound("HEARTHIT", "Sounds/heartHit.wav");
Assets.addSound("HEARTGRAZE", "Sounds/heartGraze.wav");

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
Assets.addSprite("PBODY", "Sprites/purpledude/pBody.png");
Assets.addSprite("PHEAD", "Sprites/purpledude/pHead.png");
Assets.addSprite("PLEG", "Sprites/purpledude/pLeg.png");
Assets.addSprite("PARM", "Sprites/purpledude/pArm.png");
Assets.addSprite("CUP", "Sprites/cup.png", {wid:34, hei:34, cols:2, rows:2});
Assets.addSprite("CUPITEM", "Sprites/cupItems.png", {wid:16, hei:16, cols:4, rows:9});
Assets.addSprite("BOMB", "Sprites/bombs.png", {wid:32, hei:32, cols:4, rows:1});
Assets.addSprite("SPOTUSBODY", "Sprites/ballguy/body.png", {wid:80, hei:80, cols:2, rows:1});
Assets.addSprite("SPOTUSFACE", "Sprites/ballguy/faces.png", {wid:80, hei:80, cols:2, rows:3});
Assets.addSprite("SPOTUSHAT", "Sprites/ballguy/tophat.png", {wid:48, hei:48, cols:3, rows:1});
Assets.addSprite("SPOTUSLEG", "Sprites/ballguy/leg.png");
Assets.addSprite("SPOTUSFOOT", "Sprites/ballguy/foot.png");
Assets.addSprite("POSTERS", "Sprites/poster.png",{wid:48, hei:64, cols:2, rows:1});
Assets.addSprite("SIGN", "Sprites/sign.png");
Assets.addSprite("XMASLIGHT", "Sprites/lights.png");
Assets.addSprite("HEART", "Sprites/heart.png", {wid:16, hei:16, cols:8, rows:1});
Assets.addSprite("OMEGABULLETS", "Sprites/bullets.png", {wid:32, hei:32, cols:4, rows:1});
Assets.addSprite("PIPE", "Sprites/pipe.png");
Assets.addSprite("CLOCKPOINTER", "Sprites/clockPointer.png", {wid:12, hei:3, cols:1, rows:3});
Assets.addSprite("SKYPROPS", "Sprites/skyProps.png", {wid:32, hei:32, cols:4, rows:1});
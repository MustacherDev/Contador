var path = "Sounds/";

Howler.autoUnlock = true;
console.log("IMAGES BEEN CREATED");


/// SOUND AND TEXTURES LOADER

// Loading Sounds
var sounds = [];

const SND = Object.freeze(new Enum(
  "HIT",
  "POP",
  "TOTAL"
));

const sndPaths = [
  "Hit.mp3",
  "Pop.mp3",
];

class MustAudio {
  constructor(howlAudio) {
    this.howl = howlAudio;
    this.vol = 0.75;
    this.looping = false;
    this.volume(this.vol);
    this.loop(false);
  }


  volume(volume) {
    this.vol = volume;
    this.howl.volume(volume);
  }

  loop(loop){
    this.looping = loop;
    this.howl.loop(loop);
  }
}

for (var i = 0; i < sndPaths.length; i++) {
  sounds.push(new MustAudio(new Howl({ src: ["Sounds/" + sndPaths[i]] })));
}



function playSound(soundInd) {
  sounds[soundInd].howl.volume(sounds[soundInd].vol);
  return sounds[soundInd].howl.play();
}


var playingMusic = -1;

function playMusic(musicInd){
  if(musicInd == -1) return;
  if(musicInd == playingMusic) return;

  if(playingMusic != -1){
    fadingStopSound(playingMusic, 2000);
  }

  playSound(musicInd);
  playingMusic = musicInd;
}

function fadeMusic(musicInd, duration = 2000){
  if(musicInd == -1) return;

  fadingStopSound(musicInd, duration);
  if(playingMusic == musicInd){
    playingMusic = -1;
  }
}

function stopMusic(musicInd){
  if(musicInd == -1) return;

  stopSound(musicInd);
  if(playingMusic == musicInd){
    playingMusic = -1;
  }
}

function pauseSound(soundInd, soundId = -1) {
  if (soundId == -1) {
    sounds[soundInd].howl.pause();
  } else {
    sounds[soundInd].howl.pause(soundId);
  }
}

function stopSound(soundInd, soundId = -1) {
  if (soundId == -1) {
    sounds[soundInd].howl.stop();
  } else {
    sounds[soundInd].howl.stop(soundId);
  }
}

function fadingStopSound(soundInd, duration = 1000, soundId = -1) {
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




const SPR = Object.freeze(new Enum(
  "WHITEFRAME",
  "TEXTBOX",
  "TOTAL"
));






var spritesLoaded = false;

var sprites = [];

path = "Sprites/";

console.log("IMAGES BEEN CREATED");

var images = new Map([
  ["WhiteBox", createImageSimple("whiteFrame.png")],
  ["TextBox", createImageSimple("textBox2.png")],
  ]
);



function createImageSimple(name){
  return createImage("Sprites/" + name);
}

function createImage(src){
  var image = new Image();
  image.src = src;
  return image;
}


function loadSprites() {
  if (!spritesLoaded) {
    for (var i = 0; i < SPR.TOTAL; i++) {
      sprites.push(null);
    }
    sprites[SPR.WHITEFRAME] = createSpriteComplete("WhiteBox", 16, 16, 3, 3);
    sprites[SPR.TEXTBOX] = createSpriteComplete("TextBox", 6, 6, 3, 3);
    

    var success = true;
    for (var i = 0; i < SPR.TOTAL; i++) {
      if(!sprites[i]){
        console.log("SPRITE " + SPR.getName(i) + " WAS NOT CREATED");
        success = false;
      }
    }

    if(success){
      spritesLoaded = true;
    }
  }
}


function createSpriteComplete(imageKey, wid, hei, imgX = 1, imgY = 1, xx=0, yy =0){
  if(!images.has(imageKey)) return console.log("CANNOT FIND IMAGE KEY IN FUNCTION: createSpriteComplete()");
  var img = images.get(imageKey);
  var sprite = createSprite(img);

  var ww = wid || img.naturalWidth;
  var hh = hei || img.naturalHeight;
  sprite.setSubimg(ww, hh, imgX, imgY, xx, yy);

  return sprite;
}

function addSpriteImgs(sprite, xx, yy, imgX, imgY){
  sprite.addSubimgs(xx, yy, imgX, imgY);
}

function checkImages() {
  for (var [key, image] of images) {
    if (!image.complete) {
      return false;
    }
  }
  return true;
}

// Object Handlers
// Enumerator for Objects


const OBJECT = Object.freeze(new Enum(
    "GAMEOBJECT",
    "BOX",
    "BALL",
    "TILE",
    "CATTHING",
    "CATFOOD",
    "CALENDAR",
    "BANANA",
    "BALLOONZOMBIE",
    "GREENARROW",
    "MONKEYTHING",
    "TOTAL"
));

var objDepths = [
    0,//"GAMEOBJECT",
    0,//"BOX",
    0,//"BALL",
    0,//"TILE",
    0,//"WOODSEMISOLID",
    0,//"GENERICPLAYER",
    0,
    0,
    //"TOTAL"
];

// Base Object
class GameObject {
    constructor(x, y, sprite) {
      this.x = x;
      this.y = y;
      this.hspd = 0;
      this.vspd = 0;
      this.angSpd = 0;
  
      this.sprite = sprite;
      this.depth =0;
      this.ang = 0;
      this.xScl = 1;
      this.yScl = 1;

      this.variation = 0;
      this.variationNum = 1;
  
      this.type = OBJECT.GAMEOBJECT;
      this.tags = [];
  
      this.room = null;
  
      this.active = true;

      this.setDepth();
    }
  
    addTag(tag) {
      this.tags.push(tag);
    }
  
  
    draw(ctx) {
      this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.xScl, 0, 0, 0);
    }
  
    update(dt) {
      this.x += this.hspd * dt;
      this.y += this.vspd * dt;
      this.ang += this.angSpd * dt;
    }
  
    pushDraw() {
      manager.addDrawRequest(new DrawRequest(this, this.depth, 0));
    }
  
    drawRequest(ctx, parameter) {
      this.draw(ctx);
    }
  
    onDestroy() {
  
    }
  
    onRespawn() {
  
    }
  
    onRoomEnter() {
  
    }
  
    updateVariation(variation){

    }

    nextVariation(){
        this.updateVariation((this.variation + 1)%(this.variationNum));
    }

    setDepth(depth = objDepths[this.type]){
      this.depth = depth;
    }

    interact(){
      
    }


    moveX(amount) {
      this.x += amount;
    }
  
    moveY(amount) {
      this.y += amount;
    }
  }
  
  class GameObjectWrapper extends GameObject{
    constructor(obj){
      super(0, 0, null);
      this.obj = obj;
    }

    update(dt){
      this.obj.update(dt);
    }

    draw(ctx){
      this.obj.draw(ctx);
    }
  }
  
  class DrawRequest {
    constructor(obj, depth, parameter = null) {
      this.obj = obj;
      this.depth = depth;
      this.parameter = parameter;
    }
  
    draw(ctx) {
      this.obj.drawRequest(ctx, this.parameter);
  
    }
  }
  
  
  
  
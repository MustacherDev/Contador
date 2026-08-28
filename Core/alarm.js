

class Alarm {
  constructor(duration, startTime = 0, paused = false){
    this.timer = startTime;
    this.duration = duration;
    this.finished = false;
    this.paused = paused;
    this.loop = false;
  }

  update(dt){

    if(!this.paused){
      this.timer += dt;
    }

    if(this.timer >= this.duration){
      this.finished = true;

      if(this.loop){
        this.finished = false;
        this.timer = 0;
      }
    }
  }

  setDuration(duration){
    this.duration = duration;
  }

  restart(){
    this.finished = false;
    this.timer = 0;
  }

  rewind(){
    this.finished = false;
    this.timer -= this.duration;
  }

  stop(){
    this.restart();
    this.paused = true;
  }

  start(){
    this.restart();
    this.paused = false;
  }

  end(){
    this.timer = this.duration;
    this.finished = true;
  }

  pause(){
    this.paused = true;
  }

  resume(){
    this.paused = false;
  }

  percentage(){
    return clamp(this.timer/this.duration, 0, 1);
  }
}

class RealTimeAlarm{
  constructor(endDate){
    this.time = endDate;
    this.active = false;
  }

  check(){
    if(this.active){
      var now = new Date();
      if(now.getTime() >= this.time.getTime()){
        return true;
      }
    }

    return false;
  }
}


function zeroPad(number, targetLength) {
  // Ensure targetLength is a positive integer
  targetLength = Math.floor(Math.max(targetLength, 0));

  // Convert the number to a string
  var numberString = number.toString();

  // Add leading zeros until the string length reaches the target length
  while (numberString.length < targetLength) {
    numberString = '0' + numberString;
  }

  return numberString;
}


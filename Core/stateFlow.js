class StateFlow{
  constructor(state, stateTime){
    this.state = state;
    this.stateTimer = 0;
    this.stateTime = stateTime;
    this.progress = 0;
    this.setState(this.state);
  }

  setState(state){
    this.state = state;

    if(this.state == 2 || this.state == 3){
      this.progress = 1;
      this.stateTimer = this.stateTime;
    } else {
      this.progress = 0;
      this.stateTimer = 0;
    }


  }

  update(dt){


    switch(this.state){
      case 0:
        this.progress = 0;
        break;
      case 1:
        this.stateTimer += dt;
        if(this.stateTimer < this.stateTime){
          this.progress = this.stateTimer/this.stateTime;
        } else {
          this.state = 2;
          this.progress = 1;
        }
        break;
      case 2:
        this.progress = 1;
        break;
      case 3:
        this.stateTimer -= dt;
        if(this.stateTimer > 0){
          this.progress = this.stateTimer/this.stateTime;
        } else {
          this.state = 0;
          this.progress = 0;
        }
        break;
    }


  }

  trigger(){
    if(this.state == 0){
      this.state = 1;
    } else if (this.state == 3){
      this.state = 1;
    }
  }

  hide(){
    if(this.state == 2){
      this.state = 3;
    } else if (this.state == 1){
      this.state = 3;
    }
  }
}


class StateDuoFlow{
  constructor(state, stateInTime, stateOutTime){
    this.state = state;
    this.stateTimer = 0;

    this.stateTime = Math.max(stateInTime, stateOutTime);
    this.stateInSpd = this.stateTime/stateInTime;
    this.stateOutSpd = this.stateTime/stateOutTime;

    this.progress = 0;
  }

  setState(state){
    this.state = state;

    if(this.state == 2 || this.state == 3){
      this.progress = 1;
    } else {
      this.progress = 0;
    }

    this.stateTimer = 0;
  }

  update(dt){


    switch(this.state){
      case 0:
        this.progress = 0;
        break;
      case 1:
        this.stateTimer += dt*this.stateInSpd;
        if(this.stateTimer < this.stateTime){
          this.progress = this.stateTimer/this.stateTime;
        } else {
          this.state = 2;
          this.progress = 1;
        }
        break;
      case 2:
        this.progress = 1;
        break;
      case 3:
        this.stateTimer -= dt*this.stateOutSpd;
        if(this.stateTimer > 0){
          this.progress = this.stateTimer/this.stateTime;
        } else {
          this.state = 0;
          this.progress = 0;
        }
        break;
    }


  }

  trigger(){
    if(this.state == 0){
      this.state = 1;
    } else if (this.state == 3){
      this.state = 1;
    }
  }

  hide(){
    if(this.state == 2){
      this.state = 3;
    } else if (this.state == 1){
      this.state = 3;
    }
  }
}

class StateMachine{
  constructor(stateDurationList){
    this.stateList = [];
    this.state = 0;
    this.progress = 0;

    this.totalTime  = 0;
    this.totalTimer = 0;
    this.totalTimerWhole = 0;
    this.totalProgress = 0;

    this.autoProgress = false;
    this.canProgress  = false;
    this.finished = false;

    this.onStateChange = null;
    
    for(var duration of stateDurationList){
      this.stateList.push(new Alarm(duration));
      this.totalTime += duration;
    }

    this.paused = false;
  }

  getProgress(state = this.state){
    return this.stateList[state].percentage();
  }

  proceed(){
    if(!this.canProgress) return;
    this.canProgress = false;
    if(this.state < this.stateList.length-1){
      this.totalTimerWhole += this.stateList[this.state].duration;
      this.state++;

      this.onStateChange?.(this.state);
    } else {
      this.totalTimerWhole += this.stateList[this.state].duration;
      this.onStateChange?.(this.state+1);
      this.finished = true;
    }
  }

  restart(){
    for(var alarm of this.stateList){
      alarm.restart();
    }
    this.state = 0;
    this.progress = 0;

    this.totalTimer = 0;
    this.totalTimerWhole = 0;
    this.totalProgress = 0;
    this.canProgress  = false;
    this.finished = false;

    this.paused = false;
  } 

  stop(){
    this.restart();
    this.paused = true;
  }

  start(){
    this.restart();
    this.paused = false;
    this.onStateChange?.(this.state);

  }

  update(dt){
    
    if(this.state < this.stateList.length){
      if(this.paused) dt = 0;
      
      this.stateList[this.state].update(dt);
      this.progress = this.getProgress();
      this.totalTimer = this.totalTimerWhole + this.stateList[this.state].timer;
    }

    this.totalProgress = this.totalTimer/this.totalTime;

    if(!this.canProgress){
      if(this.stateList[this.state].finished){
        this.canProgress = true;
      }
    }

    if(this.autoProgress){
      this.proceed();
    }
  }
}



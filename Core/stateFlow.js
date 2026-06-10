class StateFlow{
  constructor(state, stateTime){
    this.state = state;
    this.stateTimer = 0;
    this.stateTime = stateTime;
    this.progress = 0;
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


// ACTIONS ARE PACKETS OF CODE THAT CAN BE PUT ON A QUEUE AND BE EXECUTED IN SEQUENCE
// THAT WAY YOU CAN HAVE LOGICAL STUFF BE TIED TO TIMED ACTION EVENTS, INSTEAD OF HAVING ALL LOGIC HAPPEN INSTANTLY


class ActionQueue {

    constructor(){
        this.actions = [];
        this.current = null;
    }

    isEmpty(){
        return this.actions.length === 0;
    }

    add(action){
        this.actions.push(action);
    }

    addImmediate(action){
        // Adds action right after the current action, so it will be executed next
        this.actions.unshift(action);
        console.log("ADDED IMMEDIATE " + action.constructor.name + " ACTION");
    }

    clear(){
        this.actions = [];
        this.current = null;
    }

    update(dt){

        if(!this.current){

            if(this.actions.length === 0)
                return;

            this.current = this.actions.shift();
            this.current.start();
        }

        this.current.update(dt);

        if(this.current.isFinished()){
            this.current = null;
        }
    }
}

class Action {
    start() {}
    update(dt) {}
    isFinished() { return true; }
}

class ParallelAction extends Action{
    constructor(actions){
        super();
        this.actions = actions;
    }

    start(){
        for(var action of this.actions){
            action.start();
        }
    }

    update(dt){
        for(var action of this.actions){
            action.update(dt);
        }
    }

    isFinished(){
        for(var action of this.actions){
            if (!action.isFinished()) return false;
        }
        return true;
    }
}

class SequentialAction extends Action{
    constructor(actions){
        super();
        this.actions = actions;
        this.currentAction = null;
        this.currentActionIndex = -1;
    }

    start(){
        if(this.actions.length <= 0) return; 

        this.currentActionIndex = 0;
        this.currentAction = this.actions[this.currentActionIndex];

        this.currentAction.start();
    }

    update(dt){
        if(!this.currentAction) return;

        this.currentAction.update(dt);

        if(this.currentAction.isFinished()){
            this.currentActionIndex++;
            this.currentAction = this.actions[this.currentActionIndex];
            this.currentAction?.start();
        }
    }

    isFinished(){
        if(this.currentActionIndex == -1) return true;
        if(!this.currentAction) return true;

        return false;
    }
}

class FlipSlotAction extends Action{
    constructor(slot){
        super();
        this.slot = slot;
       
    }

    start(){
        this.slot.flipAct.flip();
    }
}

class CodeAction extends Action{
    constructor(method){
        super();
        this.method = method;

        this.aborted = false;
    }

    start(){
        this.aborted = !(this.method() ?? true);
    }
}


class WaitAction extends Action{
    constructor(duration){
        super();
        this.duration = duration;
        this.timer = 0;
        this.finished = false;
    }

    update(dt){
        if(this.isFinished()) return;
        this.timer+=dt;
        if(this.timer >= this.duration) this.finished = true;
    }

    isFinished(){
        return this.finished;
    }
} 

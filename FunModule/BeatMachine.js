class BeatMachine{
    constructor(beats){
        this.bps = beats;
        this.lastBeat = 0;
        this.startTime = new Date();
        this.beatTrigger = null;
    }

    update(dt){
        const now = new Date();
        var msDiff = now - this.startTime;
        var beat = Math.floor(msDiff*this.bps/1000);

        if(beat != this.lastBeat){
            this.lastBeat = beat;
            if(this.beatTrigger){
                this.beatTrigger(beat);
            }
        }
    }
}

class BeatPattern {
    constructor(bps, patternSize, beatList){
        this.bps = bps;

        this.beatList = beatList;
        this.patternSize = patternSize;
    }

    checkBeat(beat){
        var beatWrap = beat%this.patternSize;
        if(this.beatList.includes(beatWrap)) return true;
        return false;
    }
}


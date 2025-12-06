function Enum() {
    this.nextIndex = 0;

    this.names = [];

    for (let i = 0; i < arguments.length; ++i) {
        this[arguments[i]] = i;
        this.names.push(arguments[i]);
        this.nextIndex++;
    }

    this.addEntry = function(name){
        this[name] = this.nextIndex;
        this.names.push(name);
        this.nextIndex++;

        return this.nextIndex -1;
    }

    this.getName = function(index){
        return this.names[index];
    }

    this.getIndex = function(name){
        return this[name];
    }
    return this;
}
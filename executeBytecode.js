const fm = require('./functionMappings');
var Queue = function(buf){
    this.byteArray = [...buf];
    this.numBytes = this.byteArray.length;
    this.pos = 0;
    this.hasBytes = function(){
        return this.pos < this.numBytes;
    }
    this.jumpTo = function(newPos){
        this.pos = Math.min(newPos, this.numBytes);
    }
    this.getPos = function(newPos){
        return this.pos;
    }
    this.readByte = function(){
        var o = this.byteArray[this.pos];
        this.pos++;
        return o;
    }
    this.readInt16 = function(){
        return (this.readByte() << 1) + this.readByte();
    }
    this.readInt32 = function(){
        return (this.readInt16() << 2) + this.readInt16();
    }
    this.readInt64 = function(){
        return BigInt("0x" + this.readInt32().toString(16) + this.readInt32().toString(16));
    }
    this.readString = function(){
        var out = "";
        var cc = this.readByte();
        while(cc != 0x00){
            out += String.fromCharCode(cc);
            cc = this.readByte();
        }
        return out;
    }
}

function execute(buf){
    var queue = new Queue(buf);
    while(queue.hasBytes()){
        var inst = queue.readInt16();
        // console.log(inst);
        fm[inst](queue, null);
    }
}

module.exports = execute;
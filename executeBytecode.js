const fm = require('./functionMappings');
var ExecutionError = function(type, exitCode){
    throw type;
    console.log(type);
    process.exit(exitCode === undefined ? 1 : exitCode);
}
var getByteFromValue = function(number, pos){
    var n = BigInt(number).toString(16).length%2==1?"0"+BigInt(number).toString(16):BigInt(number).toString(16);
    pos *= 2;
    return Number("0x"+n.substr(pos, pos+2));
}
function getByteLength(val){
    return Math.ceil(BigInt(val).toString(16).length/2);
}
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
    this.readNBytes = function(amt){
        var out = "0x";
        for(var i = 0; i < amt; i++){
            out += this.readByte().toString(16);
        }
        if(getByteLength(out) > 4){
            return BigInt(out);
        }
        return Number(out);
    }
    this.readInt16 = function(){
        return (this.readByte() << 1*8) + this.readByte();
    }
    this.readInt32 = function(){
        return (this.readInt16() << 2*8) + this.readInt16();
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

var Memory = function(size){
    this.mem = (new Array(size)).fill(0);
    this.freeLocs = (new Array(size)).fill(1);
    this.memSize = size;
    this.findNextFreeOfSize = function(sizeToFind){
        var curSize = 0;
        var loc = 0;
        while(curSize < sizeToFind){
            if(this.freeLocs[loc] == 1){
                curSize++;
            } else {
                curSize = 0;
            }
            loc++;
            if(loc === this.memSize){
                return false;
            }
        }
        // return false;
        return loc-sizeToFind;
    }
    this.writeAt = function(loc, bytesToWrite){
        var pos = loc;
        for(var i = 0; i < getByteLength(bytesToWrite); i++){
            this.writeInt8(pos+i, getByteFromValue(bytesToWrite, i));
        }
    }
    this.writeInt8 = function(loc, byteToWrite){
        if(loc >= this.memSize){
            ExecutionError("Invalid Memory Address");
        }
        this.mem[loc] = Math.min(byteToWrite, 0xFF);
    }
    this.clearNBytes = function(loc, amt){
        var pos = loc;
        for(var i = 0; i < amt; i++){
            this.writeInt8(pos+i, 0)
        }
    }
    this.writeInt64AtFree = function(value){
        // console.log(value);
        var writePos = this.findNextFreeOfSize(8);
        if(writePos === false){
            ExecutionError("Out of Memory");
        } else {
            for(var i = 1; i < 9; i++){
                this.mem[writePos] = getByteFromValue(value, i);
                writePos++;
            }
        }
    }
    this.readByte = function(addr){
        return addr < this.memSize ? this.mem[addr] : ExecutionError("Invalid Memory Address");
    }
    this.readInt16 = function(addr){
        if(addr+2 >= this.memSize){
            ExecutionError("Invalid Memory Address");
        }
        return (this.readByte(addr+1) << 8) + this.readByte(addr);
    }
    this.readInt32 = function(addr){
        if(addr+4 >= this.memSize){
            console.log(0);
            ExecutionError("Invalid Memory Address");
        }
        return (this.readByte(addr+3) << 24) + (this.readByte(addr+2) << 16) + (this.readByte(addr+1) << 8) + (this.readByte(addr));
    }
    this.readNBytes = function(addr, amt){
        if(addr+amt >= this.memSize){
            ExecutionError("Invalid Memory Address");
        }
        var outAsString = "0x";
        for(var i = 0; i < amt; i++){
            outAsString += this.mem[addr+i].toString(16);
        }
        if(amt > 4){
            return BigInt(outAsString);
        }
        return Number(outAsString);
    }
    this.readString = function(addr){
        var delim = 0x00;
        var out = "";
        while(this.mem[addr] != delim){
            out += String.fromCharCode(this.mem[addr]);
            addr++;
        }
        return out;
    }
}

function execute(buf){
    var queue = new Queue(buf);
    var memAmount = 0;
    var memInited = false;
    var headerVersion = queue.readInt32();
    var curInst = queue.readByte();
    while(curInst != 0x00){
        if(curInst == 0x01){
            if(memInited) process.exit(1);
            memAmount = queue.readInt32();
            memInited = true;
        }
        curInst = queue.readByte();
    }
    if(!memInited) process.exit(2);
    var mem = new Memory(memAmount);
    // console.log(queue.pos);
    var l = 0;
    while(queue.hasBytes()){
        var paramByte = queue.readByte();
        var inst = queue.readInt16();
        // console.log(paramByte, inst, queue.pos);
            fm[inst](paramByte, queue, mem);
        // try{
        // } catch (e){
        //     console.log(paramByte, inst, queue.pos);
        // }
    }
}

module.exports = execute;
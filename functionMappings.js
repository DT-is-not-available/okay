var mappings = {};

// halt
mappings[0x0000] = function(paramByte, queue, mem){
    return;
}

// print
// CAN ONLY READ 32-BIT NUMBERS FROM MEMORY (when reading a number from memory)
// maybe chage to 64 bit if we expand the max ram?
mappings[0x0001] = function(paramByte, queue, mem){
    var isAddr = (paramByte >> 7);
    var isStr = (paramByte >> 6) & 0b01;
    var NBytes = paramByte & 0b00111111;
    console.log(paramByte.toString(2));
    if(isAddr){
        if(isStr){
            console.log(mem.readString(queue.readInt32()));
        } else {
            // console.log(queue.readInt32());
            var a = queue.readInt32();
            console.log(a, NBytes);
            console.log(mem.readNBytes(a, 4));
        }
    } else {
        if(isStr){
            console.log(queue.readString());
        } else {
            console.log(queue.readNBytes(NBytes));
        }
    }
}

// jump
mappings[0x0002] = function(paramByte, queue, mem){
    queue.jumpTo(queue.readInt32());
}

// set
mappings[0x0003] = function(paramByte, queue, mem){
    var loc = queue.readInt64();
    var val = queue.readNBytes(paramByte);
    // console.log(loc, val, queue.pos);
    mem.writeAt(Number(loc), val);
}

// clr
// CAN ONLY READ 32-BIT NUMBERS FROM MEMORY
// maybe chage to 64 bit if we expand the max ram?
mappings[0x0004] = function(paramByte, queue, mem){
    var numTypes = [
        (paramByte >> 7) & 0b00000001,
        (paramByte >> 3) & 0b00000001
    ]
    // console.log(numTypes, paramByte.toString(2));
    var numBits = [
        (paramByte >> 4) & 0b00000111,
        paramByte & 0b00000111
    ];
    // console.log(numBits);
    var loc;
    var amt;
    if(numTypes[0] == 0){
        loc = queue.readNBytes(numBits[0]);
    } else {
        loc = mem.readInt32(queue.readNBytes(numBits[0]));
    }
    if(numTypes[1] == 0){
        amt = queue.readNBytes(numBits[1]);
    } else {
        var a = numBits[1];
        var b = queue.readNBytes(a);
        // console.log(b);
        amt = mem.readInt32(b);
    }
    // console.log(loc, amt);
    mem.clearNBytes(loc, amt);
}

mappings[0x0005] = function(paramByte, queue, mem){
    var valType = paramByte;
    switch(valType){
        case 0b00000000:
            process.exit(queue.readByte());
            break;
        case 0b00000001:
            process.exit(mem.readByte(queue.readInt32()));
            break;
            
    }
}

// memDebug
mappings[0xffff] = function(paramByte, queue, mem){
    console.log(mem.mem/*.splice(0,8)*/);
}

module.exports = mappings;
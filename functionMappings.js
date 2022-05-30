var mappings = {};

mappings[0x0000] = function(queue, mem){
    return;
}

mappings[0x0001] = function(queue, mem){
    console.log(queue.readString());
}

mappings[0x0002] = function(queue, mem){
    queue.jumpTo(queue.readInt32());
}

module.exports = mappings;
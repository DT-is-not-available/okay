var insts = {};



insts['halt'] = {
    id: 0x0000,
    argsLength: 0,
    argsByteLengths: [],
    totalCommandLength: 2,
    turnToBytes: function(args){
        return [];
    }
};

insts['print'] = {
    id: 0x0001,
    argsLength: 1,
    argsByteLengths: [4],
    totalCommandLength: 6,
    turnToBytes: function(args){
        var out = [];
        out.push([args[0], -1]);
        return out;
    }
};

insts['jump'] = {
    id: 0x0002,
    argsLength: 1,
    argsByteLengths: [4],
    totalCommandLength: 6,
    turnToBytes: function(args){
        var out = [];
        out.push([
            parseInt(args[0]),
            4
        ]);
        return out;
    }
};

module.exports = insts;
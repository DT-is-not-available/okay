var insts = {};

function getByteLength(val){
    return Math.ceil(BigInt(val).toString(16).length/2);
}
function parseArgAsNum(arg){
    var num = arg;
    var type = 0;
    if(num.charAt(0) == "@"){
        num = num.substr(1, num.length);
        type = 1;
    }
    return [num, type];
}

insts['halt'] = {
    id: 0x0000,
    argsLength: 0,
    argsByteLengths: [],
    totalCommandLength: 2,
    getParamBits: function(v){
        return 0;
    },
    turnToBytes: function(args){
        return [];
    }
};
// 0 = number, 1 = address, 2 = string address, 3 = string
insts['print'] = {
    id: 0x0001,
    argsLength: 1,
    argsByteLengths: [4],
    totalCommandLength: 6,
    getParamBits: function(v){
        var a = v[0];
        var val = a[0];
        var bl = a[1];
        var type = a[2];
        if(type === 3){
            return 0b01000100;
        }
        if(type === 2){
            return 0b11000100;
        }
        if(type === 1){
            return 0b10000000 | bl;
        }
        var out = bl & 0b00111111;
        // console.log(out.toString(2).split(""));
        // process.exit(1);
        return out;
    },
    turnToBytes: function(args){
        var out = [];
        var out0 = [];
        var arg = args[0];
        if(arg[1] === 0){
            if(arg[0].charAt(1) != '@'){
                var nt = parseArgAsNum(arg[0]);
                out0.push(Number(nt[0]));
                if(!nt[1]){
                    out0.push(getByteLength(Number(nt[0])));
                } else {
                    out0.push(4);
                }
                out0.push(nt[1]);
            } else {
                out0.push(Number(arg[0].substr(0, arg[0].length)));
                out0.push(4);
                out0.push(2);
            }
        } else if (arg[1] === 1){
            out0.push(arg[0]);
            out0.push(-1);
            out0.push(3);
        }
        out.push(out0);
        return out;
    }
};

insts['jump'] = {
    id: 0x0002,
    argsLength: 1,
    argsByteLengths: [8],
    totalCommandLength: 10,
    getParamBits: function(v){
        return 0;
    },
    turnToBytes: function(args){
        var out = [];
        out.push([
            BigInt(args[0]),
            8
        ]);
        return out;
    }
};

insts['set'] = {
    id: 0x0003,
    argsLength: 2,
    argsByteLengths: [8,-2],
    totalCommandLength: 10,
    getParamBits: function(v){
        // console.log(v[1][0]);
        return getByteLength(v[1][0]);
    },
    turnToBytes: function(args){
        var out = [];
        out.push([
            BigInt(args[0][0]),
            8
        ]);
        out.push([
            BigInt(args[1][0]),
            -2
        ]);
        return out;
    }
}

insts['clr'] = {
    id: 0x0004,
    argsLength: 2,
    argsByteLengths: [8, 8],
    totalCommandLength: 18,
    getParamBits: function(v){
        var V0L = Math.ceil(BigInt(v[0][1]).toString(2).length);
        var v0 = v[0][1].toString(2);
        while(v0.length < 3){
            v0 = "0" + v0;
        }
        if(v[0][2] == 0){
            v0 = "0" + v0;
        } else {
            v0 = "1" + v0;
        }
        var v1 = v[1][1].toString(2);
        while(v1.length < 3){
            v1 = "0" + v1;
        }
        if(v[1][2] == 0){
            v1 = "0" + v1;
        } else {
            v1 = "1" + v1;
        }
        // console.log("0b"+v0+v1);
        return Number("0b"+v0+v1);
    },
    turnToBytes: function(args){
        var out = [];
        var parsed = parseArgAsNum(args[0]);
        var num = parsed[0];
        var type = parsed[1];
        var a = Math.ceil(BigInt(num).toString(16).length/2);
        out.push([
            a>4?BigInt(num):parseInt(num),
            a,
            type
        ]);
        parsed = parseArgAsNum(args[1]);
        num = parsed[0];
        type = parsed[1];
        a = Math.ceil(BigInt(num).toString(16).length/2);
        out.push([
            a>4?BigInt(num):num,
            a,
            type
        ]);
        return out;
    }
}

insts['exit'] = {
    id: 0x0005,
    argsLength: 1,
    argsByteLengths: [1],
    totalCommandLength: 3,
    getParamBits: function(v){
        // console.log(v[0][2]);
        if(v[0][2] === 0){
            return 0b00000000;
        }
        if(v[0][2] === 1){
            return 0b00000001;
        }
    },
    turnToBytes: function(args){
        var out = [];
        var parsed = parseArgAsNum(args[0]);
        var num = parsed[0];
        var type = parsed[1];
        out.push([
            parseInt(num),
            [1,4][type],
            type
        ]);
        return out;
    }
}

insts['memDebug'] = {
    id: 0xffff,
    argsLength: 0,
    argsByteLengths: [],
    totalCommandLength: 2,
    getParamBits: function(v){
        return 0;
    },
    turnToBytes: function(args){
        return [];
    }
}

module.exports = insts;
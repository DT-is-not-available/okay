const instData = require('./instructionData');
const headerData = require('./headerMappings');

var getByteFromValue = function(number, pos){
    var n = BigInt(number).toString(16).length%2==1?"0"+BigInt(number).toString(16):BigInt(number).toString(16);
    pos *= 2;
    return Number("0x"+n.substr(pos, pos+2));
}
function getByteLength(val){
    return Math.ceil(BigInt(val).toString(16).length/2);
}
function parseLine(line, delimiter, shouldTrim, removeSemicolon){
    var out = [];
    delimiter = delimiter || ',';
    shouldTrim = shouldTrim === undefined ? true : shouldTrim;
    removeSemicolon = removeSemicolon === undefined ? true : removeSemicolon;
    var isInQuote = false;
    
    var quoteChars = ['"', "'"];
    var currentString = "";
    var lineArr = line.split('');
    if(lineArr[lineArr.length-1] == ';'){
        lineArr.pop();
    }
    lineArr.forEach((c, i, l) => {
        // console.log(c);
        if(quoteChars.indexOf(c) == -1){
            if(isInQuote){
                currentString += c;
            } else {
                if(c === delimiter){
                    // console.log(currentString);
                    out.push([currentString, 0]);
                    // console.log(out);
                    currentString = "";
                } else {
                    currentString += c;
                }
            }
        } else {
            out.push([currentString, 1]);
            currentString = "";
            isInQuote = !isInQuote;
        }
    });
    if(currentString != '') out.push([currentString, 0]);
    var o = [];
    out.forEach((e)=>{
        // console.log(e, line);
        o.push([e[0].trim(), e[1]]);
    });
    out = [];
    o.forEach((e) => {
        if(!(e[0] === '')){
            out.push(e);
        }
    });
    // console.log(out, line);
    return out;
}

function linesToArray(lines){
    var out = [];
    const headerVersion = 0x00000000;
    out.push([[headerVersion, 4]]);
    lines.forEach((line, lineNum) => {
        if(line.charAt(0) == '.'){
            var l = line.substr(1, line.length);
            var lineBytes = [];
            var lineArgs = parseLine(
                l
            );
            // console.log(lineArgs);
            var cmd = lineArgs.shift()[0];
            var data = headerData[cmd];
            var params = data.getParams(lineArgs);
            lineBytes.push([data.id, 1]);
            lineBytes.push(...params);
            out.push(lineBytes);
        } else {
            var l = line;
            var lineBytes = [];
            var lineArgs = parseLine(
                l
            );
            var instructionStr = lineArgs.shift()[0];
            var instructionData = instData[instructionStr];
            var instructionArgs = instructionData.turnToBytes(lineArgs);
            var paramBits = instructionData.getParamBits(instructionArgs);
            lineBytes.push([paramBits, 1]);
            lineBytes.push([instructionData.id, 2]);
            lineBytes.push(...instructionArgs);
            out.push(lineBytes);
        }
    });
    return out;
}

function arrayToBuffer(arr){
    console.log(arr);
    var out;
    var byteCount = 0;
    arr.forEach((e) => {
        e.forEach((e1) => {
            if(e1.length>1){
                if(e1[1] == -1){
                    byteCount += e1[0].length+1;
                } else if(e1[1] == -2){
                    byteCount += getByteLength(e1[0]);
                } else {
                    byteCount += e1[1];
                }
                if(isNaN(byteCount)){
                    console.log(e1);
                    process.exit();
                }
            }
        });
    });
    out = Buffer.alloc(byteCount);
    // console.log(byteCount);
    var curPos = 0;
    arr.forEach((e) => {
        e.forEach((e1) => {
            switch(e1[1]){
                case 0:
                    break;
                case 1:
                    out.writeUInt8(e1[0], curPos);
                    curPos += 1;
                    break;
                case 2:
                    out.writeUInt16BE(e1[0], curPos);
                    curPos += 2;
                    break;
                case 4:
                    out.writeUInt32BE(e1[0], curPos);
                    curPos += 4;
                    break;
                case 8:
                    out.writeBigInt64BE(e1[0], curPos);
                    curPos += 8;
                    break;
                case -1:
                    // console.log(e1[0]);
                    // process.exit();
                    curPos += out.write(e1[0], curPos);
                    out.writeUInt8(0, curPos);
                    curPos += 1;
                    break;
                case -2:
                    var bl = getByteLength(e1[0]);
                    for(var i = 0; i < bl; i++){
                        // console.log(e1[0]);
                        // console.log(getByteFromValue(e1[0], i).toString(16), bl, i);
                        out.writeUInt8(getByteFromValue(e1[0], i), curPos);
                        curPos += 1;
                    }
                    break;
                default:
                    for(var i = 0; i < e1[1]; i++){
                        out.writeInt8(getByteFromValue(e1[0], i), curPos);
                        curPos += 1;
                    }
                    break;
            }
        });
    });
    return out;
}

function compile(data){
    var lines = data.split('\n');
    // console.log(lines);
    var arr = linesToArray(lines);
    // console.log(arr);
    var buf = arrayToBuffer(arr);
    // console.log(buf);
    return buf;
}

module.exports = compile;
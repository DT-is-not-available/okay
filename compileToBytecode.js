const instData = require('./instructionData');

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
                    out.push(currentString);
                    currentString = "";
                } else {
                    currentString += c;
                }
            }
        } else {
            isInQuote = !isInQuote;
        }
    });
    if(currentString != '') out.push(currentString);
    var o = [];
    out.forEach((e)=>{
        // console.log(e.trim());
        o.push(e.trim());
    })
    return o;
}

function linesToArray(lines){
    var out = [];
    lines.forEach((line, lineNum) => {
        // console.log(line);
        var lineBytes = [];
        var lineArgs = parseLine(
            line
        );
        // console.log(lineArgs);
        var instructionStr = lineArgs.shift();
        var instructionData = instData[instructionStr];
        lineBytes.push([instructionData.id, 2]);
        var instructionArgs = instructionData.turnToBytes(lineArgs);
        lineBytes.push(...instructionArgs);
        out.push(lineBytes);
    });
    return out;
}

function arrayToBuffer(arr){
    var out;
    var byteCount = 0;
    arr.forEach((e) => {
        e.forEach((e1) => {
            byteCount += e1[1] != -1 ? e1[1] : e1[0].length+1;
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
                    out.writeInt8(e1[0], curPos);
                    curPos += 1;
                    break;
                case 2:
                    out.writeInt16BE(e1[0], curPos);
                    curPos += 2;
                    break;
                case 4:
                    out.writeInt32BE(e1[0], curPos);
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
                    out.writeInt8(0, curPos);
                    curPos += 1;
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
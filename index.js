const fs = require("fs");
var argv = process.argv;
if(argv.length == 4){
    const compile = require('./compileToBytecode');
    const execute = require('./executeBytecode');
    const sourceFile = argv[2];
    const bycd = compile(fs.readFileSync(sourceFile, 'utf-8'));
    // console.log(bycd);
    fs.writeFileSync(argv[3], bycd);
    execute(bycd);
} else if (argv.length == 3){
    // this is the node.js testing executor section
    const execute = require('./executeBytecode');
    execute(fs.readFileSync(argv[2]));
}
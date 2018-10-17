const fs = require('fs');
const process = require('process');

fs.copyFileSync(process.argv[2], process.argv[3]);
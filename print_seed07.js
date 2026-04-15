const fs = require('fs');
const content = fs.readFileSync('web/js/gamedata.js', 'utf8');
const match = content.match(/"seed07": "(.*?)",?\n/);
if(match) console.log(match[0]);

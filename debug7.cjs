const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

let i = c.indexOf("const updateCardState = async");
let end = c.indexOf("};", i);
console.log(c.substring(i, end+2));

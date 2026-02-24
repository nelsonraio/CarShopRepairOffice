const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

let i = c.indexOf("interface KanbanCard {");
let rest = c.substring(i);
let end = rest.indexOf("const columns");
console.log(rest.substring(0, end));

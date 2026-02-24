const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find where 'aguarda_peca' cards are processed
let i = c.indexOf("estado === 'aguarda_peca'");
console.log(c.substring(i-50, i+800));

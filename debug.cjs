const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');
let i = c.indexOf("pendingTargetColumn === 'aguarda_peca'");
console.log(c.substring(i, i+2500));

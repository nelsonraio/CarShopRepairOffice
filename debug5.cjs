const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find where waitingParts is added to card
let i = c.indexOf("waitingParts:");
console.log(c.substring(i-20, i+100));

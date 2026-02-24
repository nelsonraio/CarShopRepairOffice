const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');
let i = c.indexOf("setSelectedCard(card)");
console.log(c.substring(i-100, i+200));

const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find the card creation in workOrders.forEach
let i = c.indexOf("workOrders.forEach(order =>");
let end = c.indexOf("});", i);
console.log(c.substring(i, end));

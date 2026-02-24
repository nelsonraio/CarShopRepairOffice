const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find where workOrders are processed
let i = c.indexOf("workOrders.forEach(order =>");
console.log(c.substring(i, i+1200));

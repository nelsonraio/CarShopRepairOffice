const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find where workOrders with 'Aguarda Peças' are processed
let i = c.indexOf("'Aguarda Peças'");
if (i === -1) {
  console.log("Not found");
} else {
  // Get context around it
  let start = Math.max(0, i - 500);
  let end = Math.min(c.length, i + 800);
  console.log(c.substring(start, end));
}

const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find the section that processes work orders
let i = c.indexOf("workOrders.forEach");
if (i === -1) {
  console.log("Not found");
} else {
  let end = c.indexOf("});", i) + 3;
  console.log(c.substring(i, end));
}

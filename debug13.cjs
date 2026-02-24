const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

let i = c.indexOf("const handleCardClick");
if (i === -1) {
  console.log("Not found");
} else {
  let end = c.indexOf("};", i) + 2;
  console.log(c.substring(i, end));
}

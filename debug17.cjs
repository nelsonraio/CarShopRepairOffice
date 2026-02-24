const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

let i = c.indexOf("const handleCardDrop");
if (i === -1) {
  console.log("Not found");
} else {
  // Get more context - 150 lines
  let lines = c.substring(i).split('\n');
  for (let j = 80; j < 180; j++) {
    if (lines[j]) console.log(lines[j]);
  }
}

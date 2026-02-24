const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find the section where 'aguarda_peca' column is populated
let i = c.indexOf("estado: 'Aguarda Peças'");
if (i === -1) {
  i = c.indexOf("'aguarda_peca'");
}
if (i === -1) {
  console.log("Not found: 'aguarda_peca'");
} else {
  let end = c.indexOf("});", i) + 3;
  console.log(c.substring(i, end));
}

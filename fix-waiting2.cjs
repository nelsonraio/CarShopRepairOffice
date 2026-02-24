const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find the handleSaveWaitingParts function and add a page reload
const oldCode = `// Close modal and update UI
      setShowWaitingPartsModal(false);
      setPendingWorkOrderRef(null);
      setSelectedParts(new Set());
      setWaitingParts('');
      setWorkOrderItems([]);

      // Update card state
      updateCardState(updatedCard, 'aguarda_peca');
      setPendingCard(updatedCard);`;

const newCode = `// Close modal and update UI
      setShowWaitingPartsModal(false);
      setPendingWorkOrderRef(null);
      setSelectedParts(new Set());
      setWaitingParts('');
      setWorkOrderItems([]);

      // Update card state
      updateCardState(updatedCard, 'aguarda_peca');
      setPendingCard(updatedCard);

      // Force page reload to refresh all data
      window.location.reload();`;

c = c.replace(oldCode, newCode);

fs.writeFileSync('src/components/KanbanBoard.tsx', c);
console.log('Fixed with reload!');

const fs = require('fs');
let c = fs.readFileSync('src/components/KanbanBoard.tsx', 'utf8');

// Find and fix the updateCardState call to include workOrderItems
const oldCode = `updateCardState(pendingCard, 'aguarda_peca');
      setPendingCard(null);`;

const newCode = `// Update the card with the work order items before moving
      const updatedCard = {
        ...pendingCard,
        proc: workOrderRef,
        work_order_ref: workOrderRef,
        work_order_items: workOrderItems,
        waiting_parts: workOrderItems
          .filter(item => item.tipo_item === 'peca')
          .map(item => ({
            id: item.id,
            descricao: item.descricao,
            quantidade: item.quantidade,
            valor_total: item.valor_total
          }))
      };
      updateCardState(updatedCard, 'aguarda_peca');
      setPendingCard(updatedCard);`;

c = c.replace(oldCode, newCode);

fs.writeFileSync('src/components/KanbanBoard.tsx', c);
console.log('Fixed!');

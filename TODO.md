# TODO List

## Task: Add Work Order Print Icon to Budgets Grid

### Understanding:
- When a budget is approved ("Aprovado"), a work order is automatically created via the API
- Currently only budget print icon exists
- Need to add a second print icon for work orders that appears only for approved budgets
- The two icons should be visually distinguished

### Implementation Steps:

1. [ ] Modify `src/app/orcamentos/page.tsx`
   - [ ] Add a second print button that appears only when budget.estado === 'Aprovado'
   - [ ] Use a different color (green) for the work order print icon
   - [ ] Add a different tooltip: "Imprimir Ordem de Trabalho"
   - [ ] Add `handlePrintWorkOrder` function that:
     - Generates work order reference from budget reference
     - Opens print window with work order details
   - [ ] Ensure the icons are visually distinct:
     - Budget print: Blue (existing)
     - Work order print: Green (new)

### Follow-up Steps:
- [ ] Test the changes in the browser
- [ ] Verify both print functions work correctly

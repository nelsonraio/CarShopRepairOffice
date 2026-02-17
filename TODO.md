# TODO - Add Print Functionality to Work Orders Grid

## Task
Add print functionality to the work orders grid (ordens de trabalho) similar to what exists in orçamentos.

## Steps

- [x] 1. Add `handlePrintWorkOrder` function to `src/app/ordens-trabalho/page.tsx`
  - Create a printable HTML page with work order details
  - Include company header, client info, vehicle info, mechanic, dates
  - Include problem description
  - Include signature sections
  
- [x] 2. Add print button to the Actions column in the work orders table
  - Add a printer icon button similar to orçamentos page
  - Position it before the edit and delete buttons

- [x] 3. Add status change functionality to Work Orders grid
  - Add status change button
  - Add modal for status selection
  - Handle "Aguardando Peças" with parts selection
  - Add validation for empty parts list
  - Add "Select All" button for parts

## Files to Modify
- `src/app/ordens-trabalho/page.tsx`

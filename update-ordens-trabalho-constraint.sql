-- Update check constraint for ordens_trabalho table to support new states
-- Old states: pendente, em_andamento, concluido, cancelado, faturado
-- New states: em_andamento, aguarda_peca, concluido, entregue, cancelado

ALTER TABLE `ordens_trabalho` DROP CONSTRAINT `ordens_trabalho_chk_1`;

ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_chk_1` CHECK (`estado` IN ('em_andamento', 'aguarda_peca', 'concluido', 'entregue', 'cancelado'));

-- Corrigir tipos das colunas FK na tabela ordens_trabalho

-- veiculo_id deve ser BIGINT UNSIGNED (para corresponder com veiculos.id)
ALTER TABLE `ordens_trabalho` MODIFY `veiculo_id` BIGINT UNSIGNED NOT NULL;

-- cliente_id deve ser INT (padrão é signed)
ALTER TABLE `ordens_trabalho` MODIFY `cliente_id` INT NOT NULL;

-- mecanico_id deve ser INT 
ALTER TABLE `ordens_trabalho` MODIFY `mecanico_id` INT NULL;

-- orcamento_id deve ser BIGINT UNSIGNED 
ALTER TABLE `ordens_trabalho` MODIFY `orcamento_id` BIGINT UNSIGNED NULL;

-- agendamento_id já foi alterado anteriormente para BIGINT UNSIGNED
-- Mas vamos garantir que está correto
ALTER TABLE `ordens_trabalho` MODIFY `agendamento_id` BIGINT UNSIGNED NULL;

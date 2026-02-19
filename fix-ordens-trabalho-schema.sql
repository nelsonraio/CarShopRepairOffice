-- Atualização da tabela ordens_trabalho para corresponder ao schema Prisma
-- Alterar o tipo de agendamento_id de INT para BIGINT
ALTER TABLE `ordens_trabalho` MODIFY `agendamento_id` BIGINT UNSIGNED NULL;


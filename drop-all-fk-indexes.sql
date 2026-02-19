-- Remover TODAS as foreign keys da tabela ordens_trabalho
-- Primeiro vamos listar e depois removê-las

-- Desabilitar verificações de foreign key temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- Recriar a tabela sem as foreign keys problemáticas para depois adicioná-las corretamente
-- Nota: Esta abordagem preserva os dados mas remove todas as constraints

-- Lista de possíveis foreign keys que podem existir (tentaremos remover cada uma)
-- Usaremos uma abordagem de tentar remover sem gerar erro se não existir

-- Criar script dinâmico (MySQL não suporta DROP IF EXISTS para FK diretamente)
-- Vamos simplesmente remover as constraints conhecidas

ALTER TABLE `ordens_trabalho` DROP INDEX `ordens_trabalho_veiculo_id_fkey`;
ALTER TABLE `ordens_trabalho` DROP INDEX `ordens_trabalho_cliente_id_fkey`;
ALTER TABLE `ordens_trabalho` DROP INDEX `ordens_trabalho_mecanico_id_fkey`;
ALTER TABLE `ordens_trabalho` DROP INDEX `ordens_trabalho_orcamento_id_fkey`;
ALTER TABLE `ordens_trabalho` DROP INDEX `ordens_trabalho_agendamento_id_fkey`;

SET FOREIGN_KEY_CHECKS = 1;

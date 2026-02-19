-- Script gerado pelo Prisma migrate diff para sincronizar schema com base de dados

-- DropForeignKey
ALTER TABLE `ordens_trabalho` DROP FOREIGN KEY `ordens_trabalho_veiculo_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordens_trabalho` DROP FOREIGN KEY `ordens_trabalho_cliente_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordens_trabalho` DROP FOREIGN KEY `ordens_trabalho_mecanico_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordens_trabalho` DROP FOREIGN KEY `ordens_trabalho_orcamento_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordens_trabalho` DROP FOREIGN KEY `ordens_trabalho_agendamento_id_fkey`;

-- Adicionar foreign keys com as opções corretas do Prisma
ALTER TABLE `ordens_trabalho` 
ADD CONSTRAINT `ordens_trabalho_veiculo_id_fkey` 
FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ordens_trabalho` 
ADD CONSTRAINT `ordens_trabalho_cliente_id_fkey` 
FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ordens_trabalho` 
ADD CONSTRAINT `ordens_trabalho_mecanico_id_fkey` 
FOREIGN KEY (`mecanico_id`) REFERENCES `mecanicos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ordens_trabalho` 
ADD CONSTRAINT `ordens_trabalho_orcamento_id_fkey` 
FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `ordens_trabalho` 
ADD CONSTRAINT `ordens_trabalho_agendamento_id_fkey` 
FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

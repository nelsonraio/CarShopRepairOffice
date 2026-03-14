/*
  Warnings:

  - You are about to drop the column `perfil` on the `clientes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `clientes` DROP COLUMN `perfil`,
    ADD COLUMN `perfil_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `faturas` ADD COLUMN `recibo_toconline_id` VARCHAR(50) NULL,
    ADD COLUMN `toconline_customer_id` VARCHAR(50) NULL,
    ADD COLUMN `toconline_id` VARCHAR(50) NULL;

-- CreateTable
CREATE TABLE `categorias_peca` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `categorias_peca_id`(`id`),
    UNIQUE INDEX `categorias_peca_nome`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis_clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

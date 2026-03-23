/*
  Warnings:
  - You are about to drop the column `categoria` on the `pecas` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `pecas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pecas` DROP COLUMN `categoria`,
    ADD COLUMN `categoria_id` BIGINT UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_peca`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

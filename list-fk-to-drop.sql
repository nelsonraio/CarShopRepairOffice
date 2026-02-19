-- Remover todas as foreign keys existentes na tabela ordens_trabalho
-- Primeiro identificar as foreign keys existentes dinamicamente

SET @database_name = 'carrepairshopgest';
SET @table_name = 'ordens_trabalho';

-- Desabilitar verificações de foreign key
SET FOREIGN_KEY_CHECKS = 0;

-- Remover foreign keys conhecidas (tentar sem gerar erro se não existirem)
-- Precisamos fazer isso manualmente porque MySQL não tem DROP IF EXISTS para FK

SELECT CONCAT('ALTER TABLE `', TABLE_NAME, '` DROP FOREIGN KEY `', CONSTRAINT_NAME, '`;')
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'carrepairshopgest'
  AND TABLE_NAME = 'ordens_trabalho'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

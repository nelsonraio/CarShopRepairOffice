-- Script para remover foreign keys da tabela ordens_trabalho
-- Executa cada comando separadamente, ignorando erros se a FK não existir

-- FK para veiculo_id
DROP PROCEDURE IF EXISTS drop_fk_if_exists;

DELIMITER $$
CREATE PROCEDURE drop_fk_if_exists(
    IN tableName VARCHAR(64),
    IN constraintName VARCHAR(64)
)
BEGIN
    DECLARE _count INT;
    
    SELECT COUNT(*) INTO _count
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND CONSTRAINT_NAME = constraintName
        AND CONSTRAINT_TYPE = 'FOREIGN KEY';
    
    IF _count > 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', tableName, '` DROP FOREIGN KEY `', constraintName, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Remover as foreign keys
CALL drop_fk_if_exists('ordens_trabalho', 'ordens_trabalho_veiculo_id_fkey');
CALL drop_fk_if_exists('ordens_trabalho', 'ordens_trabalho_cliente_id_fkey');
CALL drop_fk_if_exists('ordens_trabalho', 'ordens_trabalho_mecanico_id_fkey');
CALL drop_fk_if_exists('ordens_trabalho', 'ordens_trabalho_orcamento_id_fkey');
CALL drop_fk_if_exists('ordens_trabalho', 'ordens_trabalho_agendamento_id_fkey');

-- Limpar procedure
DROP PROCEDURE IF EXISTS drop_fk_if_exists;

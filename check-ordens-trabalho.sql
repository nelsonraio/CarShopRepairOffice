-- Verificar estrutura da tabela ordens_trabalho
DESCRIBE ordens_trabalho;

-- Verificar foreign keys
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
    TABLE_SCHEMA = 'carrepairshopgest'
    AND TABLE_NAME = 'ordens_trabalho'
    AND REFERENCED_TABLE_NAME IS NOT NULL;

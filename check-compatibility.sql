-- Verificar detalhes das colunas de ID e FK
SELECT 
    'ordens_trabalho.veiculo_id' as coluna,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'ordens_trabalho'
  AND COLUMN_NAME = 'veiculo_id'
UNION ALL
SELECT 
    'veiculos.id' as coluna,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'veiculos'
  AND COLUMN_NAME = 'id';

-- Verificar foreign keys existentes
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'carrepairshopgest'
  AND TABLE_NAME = 'ordens_trabalho'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

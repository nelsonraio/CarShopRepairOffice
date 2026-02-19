-- Verificar tipos das colunas envolvidas nas foreign keys
SELECT 'ordens_trabalho', COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'ordens_trabalho'
  AND COLUMN_NAME IN ('veiculo_id', 'cliente_id', 'mecanico_id', 'orcamento_id', 'agendamento_id')
UNION ALL
SELECT 'veiculos', COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'veiculos'
  AND COLUMN_NAME = 'id'
UNION ALL
SELECT 'clientes', COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'clientes'
  AND COLUMN_NAME = 'id'
UNION ALL
SELECT 'mecanicos', COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'mecanicos'
  AND COLUMN_NAME = 'id'
UNION ALL
SELECT 'orcamentos', COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'orcamentos'
  AND COLUMN_NAME = 'id'
UNION ALL
SELECT 'agendamentos', COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND TABLE_NAME = 'agendamentos'
  AND COLUMN_NAME = 'id';
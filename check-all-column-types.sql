-- Verificar tipos de todas as colunas FK
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'carrepairshopgest' 
  AND (
      (TABLE_NAME = 'ordens_trabalho' AND COLUMN_NAME IN ('veiculo_id', 'cliente_id', 'mecanico_id', 'orcamento_id', 'agendamento_id'))
      OR (TABLE_NAME = 'veiculos' AND COLUMN_NAME = 'id')
      OR (TABLE_NAME = 'clientes' AND COLUMN_NAME = 'id')
      OR (TABLE_NAME = 'mecanicos' AND COLUMN_NAME = 'id')
      OR (TABLE_NAME = 'orcamentos' AND COLUMN_NAME = 'id')
      OR (TABLE_NAME = 'agendamentos' AND COLUMN_NAME = 'id')
  )
ORDER BY TABLE_NAME, COLUMN_NAME;

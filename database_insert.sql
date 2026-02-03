-- Inserir categorias de serviço
INSERT INTO categorias_servico (nome, descricao, duracao_estimada) VALUES
('Manutenção', 'Manutenção preventiva e corretiva', '2 hours'),
('Reparação', 'Reparações mecânicas e elétricas', '4 hours'),
('Inspeção', 'Inspeções e diagnósticos', '1 hour'),
('Substituição', 'Substituição de peças e componentes', '3 hours');

-- Inserir faturas
INSERT INTO faturas (numero_fatura, cliente_id, ordem_trabalho_id, data_emissao, data_vencimento, estado, subtotal, valor_imposto, valor_desconto, valor_total, valor_pago) VALUES
('FAT-2024-001', 1, 1, '2024-10-15', '2024-11-15', 'paga', 120.00, 27.60, 0.00, 147.60, 147.60),
('FAT-2024-002', 1, 2, '2024-11-02', '2024-12-02', 'paga', 85.00, 19.55, 0.00, 104.55, 104.55),
('FAT-2024-003', 2, 3, '2024-10-28', '2024-11-28', 'paga', 95.00, 21.85, 0.00, 116.85, 116.85),
('FAT-2024-004', 3, 4, '2024-09-15', '2024-10-15', 'paga', 180.00, 41.40, 0.00, 221.40, 221.40),
('FAT-2024-005', 4, 5, '2024-08-10', '2024-09-10', 'paga', 120.00, 27.60, 0.00, 147.60, 147.60),
('FAT-2024-006', 5, 6, '2024-11-05', '2024-12-05', 'paga', 75.00, 17.25, 0.00, 92.25, 92.25),
('FAT-2024-007', 5, 7, '2024-10-20', '2024-11-20', 'paga', 350.00, 80.50, 0.00, 430.50, 430.50),
('FAT-2024-008', 5, 8, '2024-09-12', '2024-10-12', 'paga', 45.00, 10.35, 0.00, 55.35, 55.35),
('FAT-2024-009', 6, 9, '2024-10-18', '2024-11-18', 'paga', 65.00, 14.95, 0.00, 79.95, 79.95),
('FAT-2024-010', 7, 10, '2024-09-25', '2024-10-25', 'paga', 95.00, 21.85, 0.00, 116.85, 116.85),
('FAT-2024-011', 7, 11, '2024-11-08', '2024-12-08', 'paga', 140.00, 32.20, 0.00, 172.20, 172.20),
('FAT-2024-012', 8, 12, '2024-10-30', '2024-11-30', 'pendente', 0.00, 0.00, 0.00, 0.00, 0.00);

-- Inserir cartões Kanban
INSERT INTO cartoes_kanban (coluna_id, titulo, descricao, prioridade, posicao) VALUES
(1, 'Reparação Fiat Punto', 'Cliente relatou barulho estranho no motor', 'alta', 1),
(2, 'Revisão VW Golf', 'Revisão de 120.000km', 'normal', 1),
(3, 'Inspeção BMW X5', NULL, 'normal', 1),
(4, 'Mudança Óleo Seat Leon', NULL, 'baixa', 1),
(5, 'Substituição Amortecedores', 'Cliente queixou-se de conforto na suspensão', 'normal', 1);

-- Inserir histórico de cartões Kanban
INSERT INTO historico_cartao_kanban (cartao_id, coluna_origem_id, coluna_destino_id, movido_por, notas) VALUES
(1, NULL, 1, 1, 'Cartão criado na coluna A Agendar'),
(1, 1, 3, 1, 'Movido para Em Andamento'),
(1, 3, 5, 1, 'Serviço concluído, movido para Pronto'),
(2, NULL, 2, 1, 'Cartão criado na coluna Agendado'),
(2, 2, 3, 1, 'Movido para Em Andamento'),
(3, NULL, 2, 1, 'Cartão criado na coluna Agendado'),
(4, NULL, 2, 1, 'Cartão criado na coluna Agendado'),
(5, NULL, 1, 1, 'Cartão criado na coluna A Agendar');

-- Inserir itens de fatura
INSERT INTO itens_fatura (fatura_id, descricao, quantidade, preco_unitario, valor_desconto, valor_imposto, valor_total) VALUES
(1, 'Mudança Óleo + Filtros', 1, 120.00, 0.00, 27.60, 147.60),
(2, 'Inspeção Periódica', 1, 85.00, 0.00, 19.55, 104.55),
(3, 'Substituição Pastilhas Travão', 1, 95.00, 0.00, 21.85, 116.85),
(4, 'Revisão Geral', 1, 180.00, 0.00, 41.40, 221.40),
(5, 'Substituição Bateria', 1, 120.00, 0.00, 27.60, 147.60),
(6, 'Mudança Óleo', 1, 75.00, 0.00, 17.25, 92.25),
(7, 'Reparação Sistema Elétrico', 1, 350.00, 0.00, 80.50, 430.50),
(8, 'Substituição Escovas Limpa-Vidros', 1, 45.00, 0.00, 10.35, 55.35),
(9, 'Inspeção Pós-Compra', 1, 65.00, 0.00, 14.95, 79.95),
(10, 'Substituição Filtros', 1, 95.00, 0.00, 21.85, 116.85),
(11, 'Revisão 40.000km', 1, 140.00, 0.00, 32.20, 172.20),
(12, 'Inspeção Garantia', 1, 0.00, 0.00, 0.00, 0.00);

-- Inserir orçamentos
INSERT INTO orcamentos (numero_orcamento, cliente_id, veiculo_id, data_emissao, data_expiracao, estado, total_pecas, total_mao_obra, total_desconto, total_imposto, total_geral) VALUES
('TVDE0001', 1, 1, '2024-10-10', '2024-10-20', 'aprovado', 30.00, 90.00, 0.00, 27.60, 147.60),
('C00001', 1, 2, '2024-10-28', '2024-11-07', 'aprovado', 0.00, 85.00, 0.00, 19.55, 104.55),
('TVDE0002', 2, 3, '2024-10-25', '2024-11-04', 'aprovado', 25.00, 70.00, 0.00, 21.85, 116.85),
('C00002', 3, 4, '2024-09-10', '2024-09-20', 'aprovado', 60.00, 120.00, 0.00, 41.40, 221.40),
('TVDE0003', 4, 5, '2024-08-05', '2024-08-15', 'aprovado', 60.00, 60.00, 0.00, 27.60, 147.60),
('C00003', 5, 6, '2024-11-01', '2024-11-11', 'pendente', 75.00, 100.00, 0.00, 40.25, 215.25),
('TVDE0004', 6, 9, '2024-10-15', '2024-10-25', 'rejeitado', 0.00, 65.00, 0.00, 14.95, 79.95),
('C00004', 7, 10, '2024-09-20', '2024-09-30', 'aprovado', 95.00, 50.00, 0.00, 33.35, 178.35),
('TVDE0005', 8, 12, '2024-11-05', '2024-11-15', 'pendente', 50.00, 80.00, 0.00, 29.90, 159.90),
('C00005', 3, 4, '2024-10-01', '2024-10-11', 'expirado', 40.00, 110.00, 0.00, 34.20, 184.20),
('TVDE0006', 1, 1, '2024-11-10', '2024-11-20', 'pendente', 20.00, 80.00, 0.00, 22.80, 122.80),
('C00006', 2, 3, '2024-09-05', '2024-09-15', 'aprovado', 35.00, 75.00, 0.00, 25.55, 135.55),
('TVDE0007', 5, 7, '2024-10-05', '2024-10-15', 'rejeitado', 100.00, 150.00, 0.00, 57.00, 307.00),
('C00007', 6, 9, '2024-11-15', '2024-11-25', 'pendente', 0.00, 70.00, 0.00, 16.10, 86.10),
('TVDE0008', 7, 11, '2024-08-20', '2024-08-30', 'aprovado', 45.00, 95.00, 0.00, 32.35, 172.35);

-- Inserir itens de orçamento
INSERT INTO itens_orcamento (orcamento_id, tipo_item, descricao, quantidade, preco_unitario, percentual_desconto, valor_desconto, percentual_imposto, valor_imposto, valor_total) VALUES
(1, 'peca', 'Filtro de Óleo Bosch', 1, 6.00, 0.00, 0.00, 23.00, 1.38, 7.38),
(1, 'peca', 'Óleo Castrol Edge 5W30 (5L)', 1, 30.00, 0.00, 0.00, 23.00, 6.90, 36.90),
(1, 'servico', 'Mudança Óleo + Filtros', 1, 90.00, 0.00, 0.00, 23.00, 20.70, 110.70),
(2, 'servico', 'Inspeção Periódica', 1, 85.00, 0.00, 0.00, 23.00, 19.55, 104.55),
(3, 'peca', 'Pastilhas Travão Brembo (Frente)', 1, 25.00, 0.00, 0.00, 23.00, 5.75, 30.75),
(3, 'servico', 'Substituição Pastilhas Travão', 1, 70.00, 0.00, 0.00, 23.00, 16.10, 86.10),
(4, 'peca', 'Filtro de Óleo Bosch', 1, 6.00, 0.00, 0.00, 23.00, 1.38, 7.38),
(4, 'peca', 'Óleo Castrol Edge 5W30 (5L)', 1, 30.00, 0.00, 0.00, 23.00, 6.90, 36.90),
(4, 'peca', 'Vela de Ignição NGK Laser Iridium', 4, 8.00, 0.00, 0.00, 23.00, 7.36, 39.36),
(4, 'servico', 'Revisão Geral', 1, 120.00, 0.00, 0.00, 23.00, 27.60, 147.60),
(5, 'peca', 'Bateria 12V 70AH', 1, 60.00, 0.00, 0.00, 23.00, 13.80, 73.80),
(5, 'servico', 'Substituição Bateria', 1, 60.00, 0.00, 0.00, 23.00, 13.80, 73.80);

-- Inserir logs de auditoria
INSERT INTO log_auditoria (utilizador_id, acao, nome_tabela, id_registo, valores_antigos, valores_novos, endereco_ip, agente_utilizador) VALUES
(1, 'INSERT', 'clientes', 1, NULL, '{"nome": "João Silva", "email": "joao.silva@email.pt"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'INSERT', 'veiculos', 1, NULL, '{"marca": "Peugeot", "modelo": "308", "matricula": "45-GH-23"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'UPDATE', 'ordens_trabalho', 1, '{"estado": "em_andamento"}', '{"estado": "concluido"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'INSERT', 'faturas', 1, NULL, '{"numero_fatura": "FAT-2024-001", "valor_total": 147.60}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'UPDATE', 'pecas', 1, '{"quantidade_stock": 50}', '{"quantidade_stock": 45}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'INSERT', 'orcamentos', 1, NULL, '{"numero_orcamento": "ORC-2024-001", "total_geral": 147.60}', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'UPDATE', 'cartoes_kanban', 1, '{"coluna_id": 1}', '{"coluna_id": 3}', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'INSERT', 'agendamentos', 1, NULL, '{"titulo": "Reparação Fiat Punto", "data_agendamento": "2024-11-01"}', '192.168.1.106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'UPDATE', 'clientes', 1, '{"total_gasto": 0.00}', '{"total_gasto": 147.60}', '192.168.1.107', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(1, 'INSERT', 'transacoes_pecas', 1, NULL, '{"peca_id": 1, "tipo_transacao": "saida", "quantidade": 1}', '192.168.1.108', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

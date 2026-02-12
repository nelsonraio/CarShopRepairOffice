# Sistema de Gestão de Oficina Automóvel - Esquema da Base de Dados

## Visão Geral

Este documento descreve o esquema completo da base de dados para o Sistema de Gestão de Oficina Automóvel. O esquema foi concebido para suportar todas as operações comerciais, incluindo gestão de clientes, acompanhamento de veículos, agendamento de serviços, inventário de peças, orçamentos, faturação e gestão de fluxo de trabalho.

## Princípios de Design da Base de Dados

- **Normalização**: As tabelas estão normalizadas para reduzir redundâncias e melhorar a integridade dos dados
- **Relacionamentos**: Relacionamentos adequados de chaves estrangeiras mantêm a consistência dos dados
- **Indexação**: Indexação estratégica para otimizar o desempenho das consultas
- **Restrições**: Validação de dados através de restrições e triggers
- **Auditoria**: Controlo de alterações para dados comerciais críticos

## Esquema da Base de Dados

### Tabelas Principais

#### 1. utilizadores
Tabela de autenticação e autorização de utilizadores.

```sql
CREATE TABLE `utilizadores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_utilizador` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hash_palavra_passe` varchar(255) NOT NULL,
  `nome_completo` varchar(100) NOT NULL,
  `papel` enum('admin','gestor','mecanico','rececionista') NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_utilizador` (`nome_utilizador`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 2. clientes
Informações de clientes e relacionamento comercial.

```sql
CREATE TABLE `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) NOT NULL,
  `nif` varchar(20) DEFAULT NULL,
  `endereco` text,
  `perfil` enum('Normal','TVDE Interno','Empresa') DEFAULT 'Normal',
  `data_registo` date DEFAULT (curdate()),
  `total_gasto` decimal(10,2) DEFAULT '0.00',
  `visitas` int DEFAULT '0',
  `notas` text,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nif` (`nif`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 3. veiculos
Informações de veículos ligadas aos clientes.

```sql
CREATE TABLE `veiculos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `ano` int DEFAULT NULL,
  `numero_chassis` varchar(17) DEFAULT NULL,
  `tipo_motor` varchar(50) DEFAULT NULL,
  `tipo_combustivel` varchar(20) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'disponivel',
  `quilometragem` int DEFAULT '0',
  `ultima_intervencao` date DEFAULT NULL,
  `proxima_revisao` date DEFAULT NULL,
  `companhia_seguros` varchar(100) DEFAULT NULL,
  `apolice_seguro` varchar(50) DEFAULT NULL,
  `validade_seguro` date DEFAULT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `numero_chassis` (`numero_chassis`),
  CONSTRAINT `veiculos_chk_1` CHECK ((`ano` >= 1900)),
  CONSTRAINT `veiculos_chk_2` CHECK ((`tipo_combustivel` in (_utf8mb4'Gasolina',_utf8mb4'Gasóleo',_utf8mb4'Elétrico',_utf8mb4'Híbrido'))),
  CONSTRAINT `veiculos_chk_3` CHECK ((`estado` in (_utf8mb4'na_oficina',_utf8mb4'disponivel',_utf8mb4'vendido',_utf8mb4'abandonado')))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 4. mecanicos
Informações de funcionários para mecânicos e técnicos.

```sql
CREATE TABLE `mecanicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilizador_id` int DEFAULT NULL,
  `nome` varchar(100) NOT NULL,
  `especialidade` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `tarifa_horaria` decimal(8,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_contratacao` date DEFAULT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Gestão de Peças e Inventário

#### 5. fornecedores
Informações de fornecedores para aquisição de peças.

```sql
CREATE TABLE `fornecedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `pessoa_contato` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` text,
  `nif` varchar(20) DEFAULT NULL,
  `termos_pagamento` varchar(50) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 6. pecas
Inventário e catálogo de peças.

```sql
CREATE TABLE `pecas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `referencia` varchar(50) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `categoria` varchar(50) NOT NULL,
  `fornecedor_id` int DEFAULT NULL,
  `custo_unitario` decimal(10,2) NOT NULL,
  `preco_venda` decimal(10,2) NOT NULL,
  `quantidade_stock` int DEFAULT '0',
  `nivel_stock_minimo` int DEFAULT '0',
  `nivel_stock_maximo` int DEFAULT NULL,
  `localizacao` varchar(100) DEFAULT NULL,
  `veiculos_compativeis` text,
  `ativo` tinyint(1) DEFAULT '1',
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `referencia` (`referencia`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 7. transacoes_pecas
Movimentos de stock e transações de inventário.

```sql
CREATE TABLE `transacoes_pecas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `peca_id` int NOT NULL,
  `tipo_transacao` varchar(20) NOT NULL,
  `quantidade` int NOT NULL,
  `custo_unitario` decimal(10,2) DEFAULT NULL,
  `custo_total` decimal(10,2) DEFAULT NULL,
  `documento_referencia` varchar(50) DEFAULT NULL,
  `fornecedor_id` int DEFAULT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `transacoes_pecas_chk_1` CHECK ((`tipo_transacao` in (_utf8mb4'entrada',_utf8mb4'saida',_utf8mb4'ajuste',_utf8mb4'devolucao')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Gestão de Serviços

#### 8. categorias_servico
Categorias para diferentes tipos de serviços.

```sql
CREATE TABLE `categorias_servico` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `duracao_estimada` time DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 9. servicos
Serviços disponíveis oferecidos pela oficina.

```sql
CREATE TABLE `servicos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `preco_base` decimal(10,2) DEFAULT NULL,
  `duracao_estimada` time DEFAULT NULL,
  `requer_pecas` tinyint(1) DEFAULT '0',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 10. agendamentos
Agendamentos de serviços programados.

```sql
CREATE TABLE `agendamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `veiculo_id` int NOT NULL,
  `mecanico_id` int DEFAULT NULL,
  `servico_id` int DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `data_agendamento` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'agendado',
  `prioridade` varchar(10) DEFAULT 'normal',
  `custo_estimado` decimal(10,2) DEFAULT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `agendamentos_chk_1` CHECK ((`estado` in (_utf8mb4'agendado',_utf8mb4'confirmado',_utf8mb4'em_andamento',_utf8mb4'concluido',_utf8mb4'cancelado',_utf8mb4'nao_compareceu'))),
  CONSTRAINT `agendamentos_chk_2` CHECK ((`prioridade` in (_utf8mb4'baixa',_utf8mb4'normal',_utf8mb4'alta',_utf8mb4'urgente')))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Quotes & Estimates

#### 11. orcamentos
Orçamentos de serviços e estimativas.

```sql
CREATE TABLE `orcamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ref_orcamento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `veiculo_id` int NOT NULL,
  `preparado_por` int DEFAULT NULL,
  `data_emissao` date DEFAULT NULL,
  `data_expiracao` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendente',
  `total_pecas` decimal(10,2) DEFAULT '0.00',
  `total_mao_obra` decimal(10,2) DEFAULT '0.00',
  `total_desconto` decimal(10,2) DEFAULT '0.00',
  `total_imposto` decimal(10,2) DEFAULT '0.00',
  `total_geral` decimal(10,2) NOT NULL,
  `notas` text,
  `data_aprovacao` date DEFAULT NULL,
  `aprovado_por` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_orcamento` (`ref_orcamento`) USING BTREE,
  CONSTRAINT `orcamentos_chk_1` CHECK ((`estado` in (_utf8mb4'pendente',_utf8mb4'aprovado',_utf8mb4'rejeitado',_utf8mb4'expirado',_utf8mb4'convertido')))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 12. itens_orcamento
Itens individuais dentro de um orçamento.

```sql
CREATE TABLE `itens_orcamento` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `orcamento_id` int NOT NULL,
  `tipo_item` varchar(20) NOT NULL,
  `servico_id` int DEFAULT NULL,
  `peca_id` int DEFAULT NULL,
  `descricao` text NOT NULL,
  `quantidade` decimal(8,2) DEFAULT '1.00',
  `preco_unitario` decimal(10,2) NOT NULL,
  `percentual_desconto` decimal(5,2) DEFAULT '0.00',
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `percentual_imposto` decimal(5,2) DEFAULT '23.00',
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `itens_orcamento_chk_1` CHECK ((`tipo_item` in (_utf8mb4'servico',_utf8mb4'peca',_utf8mb4'outro')))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Ordens de Trabalho e Histórico de Serviços

#### 13. ordens_trabalho
Trabalho real realizado nos veículos.

```sql
CREATE TABLE `ordens_trabalho` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ref_ordem_trabalho` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `veiculo_id` int NOT NULL,
  `mecanico_id` int DEFAULT NULL,
  `orcamento_id` int DEFAULT NULL,
  `agendamento_id` int DEFAULT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_conclusao` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'em_andamento',
  `quilometragem_servico` int DEFAULT NULL,
  `descricao_problema` text,
  `trabalho_realizado` text,
  `recomendacoes` text,
  `total_pecas` decimal(10,2) DEFAULT '0.00',
  `total_mao_obra` decimal(10,2) DEFAULT '0.00',
  `total_desconto` decimal(10,2) DEFAULT '0.00',
  `total_imposto` decimal(10,2) DEFAULT '0.00',
  `total_geral` decimal(10,2) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_ordem_trabalho` (`ref_ordem_trabalho`) USING BTREE,
  CONSTRAINT `ordens_trabalho_chk_1` CHECK ((`estado` in (_utf8mb4'pendente',_utf8mb4'em_andamento',_utf8mb4'concluido',_utf8mb4'cancelado',_utf8mb4'faturado')))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 14. itens_ordem_trabalho
Itens detalhados em uma ordem de trabalho.

```sql
CREATE TABLE `itens_ordem_trabalho` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ordem_trabalho_id` int DEFAULT NULL,
  `tipo_item` varchar(20) NOT NULL,
  `servico_id` int DEFAULT NULL,
  `peca_id` int DEFAULT NULL,
  `descricao` text NOT NULL,
  `quantidade` decimal(8,2) DEFAULT '1.00',
  `preco_unitario` decimal(10,2) NOT NULL,
  `horas_trabalho` decimal(6,2) DEFAULT NULL,
  `tarifa_horaria` decimal(8,2) DEFAULT NULL,
  `percentual_desconto` decimal(5,2) DEFAULT '0.00',
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `percentual_imposto` decimal(5,2) DEFAULT '23.00',
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `itens_ordem_trabalho_chk_1` CHECK ((`tipo_item` in (_utf8mb4'servico',_utf8mb4'peca',_utf8mb4'outro')))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 15. pecas_ordem_trabalho
Peças utilizadas em ordens de trabalho (tabela de junção com quantidades).

```sql
CREATE TABLE `pecas_ordem_trabalho` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ordem_trabalho_id` int NOT NULL,
  `peca_id` int NOT NULL,
  `quantidade_utilizada` decimal(8,2) NOT NULL,
  `custo_unitario` decimal(10,2) NOT NULL,
  `custo_total` decimal(10,2) NOT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Faturação

#### 16. faturas
Faturas de clientes.

```sql
CREATE TABLE `faturas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero_fatura` varchar(20) NOT NULL,
  `cliente_id` int NOT NULL,
  `ordem_trabalho_id` int DEFAULT NULL,
  `data_emissao` date DEFAULT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_pagamento` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendente',
  `subtotal` decimal(10,2) NOT NULL,
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `valor_pago` decimal(10,2) DEFAULT '0.00',
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_fatura` (`numero_fatura`),
  CONSTRAINT `faturas_chk_1` CHECK ((`estado` in (_utf8mb4'pendente',_utf8mb4'parcial',_utf8mb4'paga',_utf8mb4'vencida',_utf8mb4'cancelada')))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 17. itens_fatura
Itens dentro de uma fatura.

```sql
CREATE TABLE `itens_fatura` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fatura_id` int NOT NULL,
  `item_ordem_trabalho_id` int DEFAULT NULL,
  `descricao` text NOT NULL,
  `quantidade` decimal(8,2) DEFAULT '1.00',
  `preco_unitario` decimal(10,2) NOT NULL,
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 18. pagamentos
Registos de pagamentos para faturas.

```sql
CREATE TABLE `pagamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fatura_id` int NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `metodo_pagamento` varchar(50) NOT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `notas` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `pagamentos_chk_1` CHECK ((`metodo_pagamento` in (_utf8mb4'dinheiro',_utf8mb4'cartao_credito',_utf8mb4'cartao_debito',_utf8mb4'transferencia',_utf8mb4'cheque',_utf8mb4'mbway',_utf8mb4'paypal')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### Kanban & Workflow Management

#### 19. colunas_kanban
Colunas do quadro Kanban.

```sql
CREATE TABLE `colunas_kanban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `posicao` int NOT NULL,
  `cor` varchar(7) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 20. cartoes_kanban
Cartões Kanban representando itens de trabalho.

```sql
CREATE TABLE `cartoes_kanban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coluna_id` int NOT NULL,
  `ordem_trabalho_id` int DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `prioridade` varchar(10) DEFAULT 'normal',
  `atribuido_a` int DEFAULT NULL,
  `data_limite` date DEFAULT NULL,
  `etiquetas` text,
  `posicao` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 21. historico_cartao_kanban
Rastreamento de auditoria para movimentos de cartões Kanban.

```sql
CREATE TABLE `historico_cartao_kanban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cartao_id` int NOT NULL,
  `coluna_origem_id` int DEFAULT NULL,
  `coluna_destino_id` int NOT NULL,
  `movido_por` int DEFAULT NULL,
  `movido_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notas` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### System Configuration & Audit

#### 22. configuracoes_sistema
Definições de configuração da aplicação.

```sql
CREATE TABLE `configuracoes_sistema` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `chave_configuracao` varchar(100) NOT NULL,
  `valor_configuracao` text,
  `tipo_configuracao` varchar(20) DEFAULT 'string',
  `descricao` text,
  `sistema` tinyint(1) DEFAULT '0',
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `chave_configuracao` (`chave_configuracao`),
  CONSTRAINT `configuracoes_sistema_chk_1` CHECK ((`tipo_configuracao` in (_utf8mb4'string',_utf8mb4'number',_utf8mb4'boolean',_utf8mb4'json')))
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

#### 23. log_auditoria
Rastreamento de auditoria em todo o sistema.

```sql
CREATE TABLE `log_auditoria` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `utilizador_id` int DEFAULT NULL,
  `acao` varchar(100) NOT NULL,
  `nome_tabela` varchar(50) DEFAULT NULL,
  `id_registo` int DEFAULT NULL,
  `valores_antigos` json DEFAULT NULL,
  `valores_novos` json DEFAULT NULL,
  `endereco_ip` varchar(100) DEFAULT NULL,
  `agente_utilizador` text,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## Database Views

### 1. resumo_clientes
Vista de resumo para o painel de clientes.

```sql
CREATE VIEW resumo_clientes AS
SELECT
    c.id,
    c.nome,
    c.email,
    c.telefone,
    c.total_gasto,
    c.visitas,
    COUNT(v.id) as contagem_veiculos,
    MAX(ot.data_conclusao) as ultima_data_servico,
    AVG(ot.total_geral) as custo_medio_servico
FROM clientes c
LEFT JOIN veiculos v ON c.id = v.cliente_id
LEFT JOIN ordens_trabalho ot ON c.id = ot.cliente_id AND ot.estado = 'concluido'
WHERE c.ativo = true
GROUP BY c.id, c.nome, c.email, c.telefone, c.total_gasto, c.visitas;
```

### 2. historico_servico_veiculos
Histórico completo de serviços para veículos.

```sql
CREATE VIEW historico_servico_veiculos AS
SELECT
    v.id as id_veiculo,
    v.matricula,
    v.marca,
    v.modelo,
    ot.numero_ordem_trabalho,
    ot.data_inicio,
    ot.data_conclusao,
    ot.descricao_problema,
    ot.trabalho_realizado,
    ot.total_geral,
    m.nome as nome_mecanico,
    STRING_AGG(iot.descricao, '; ') as servicos_realizados
FROM veiculos v
LEFT JOIN ordens_trabalho ot ON v.id = ot.veiculo_id
LEFT JOIN mecanicos m ON ot.mecanico_id = m.id
LEFT JOIN itens_ordem_trabalho iot ON ot.id = iot.ordem_trabalho_id
WHERE ot.estado = 'concluido'
GROUP BY v.id, v.matricula, v.marca, v.modelo, ot.id, ot.numero_ordem_trabalho,
         ot.data_inicio, ot.data_conclusao, ot.descricao_problema,
         ot.trabalho_realizado, ot.total_geral, m.nome;
```

### 3. receitas_mensais
Análise de receitas por mês.

```sql
CREATE VIEW receitas_mensais AS
SELECT
    DATE_TRUNC('month', f.data_emissao) as mes,
    COUNT(f.id) as contagem_faturas,
    SUM(f.valor_total) as receita_total,
    SUM(f.valor_pago) as total_pago,
    SUM(f.valor_total - f.valor_pago) as valor_pendente,
    AVG(f.valor_total) as valor_medio_fatura
FROM faturas f
WHERE f.estado != 'cancelada'
GROUP BY DATE_TRUNC('month', f.data_emissao)
ORDER BY mes DESC;
```

## Triggers & Functions

### 1. Atualizar Estatísticas de Clientes
Atualizar automaticamente o total gasto e visitas dos clientes quando as ordens de trabalho são concluídas.

```sql
CREATE OR REPLACE FUNCTION atualizar_estatisticas_clientes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'concluido' AND (OLD.estado IS NULL OR OLD.estado != 'concluido') THEN
        UPDATE clientes
        SET total_gasto = total_gasto + NEW.total_geral,
            visitas = visitas + 1,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.cliente_id;
    ELSIF OLD.estado = 'concluido' AND NEW.estado != 'concluido' THEN
        UPDATE clientes
        SET total_gasto = total_gasto - OLD.total_geral,
            visitas = visitas - 1,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.cliente_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gatilho_conclusao_ordem_trabalho
    AFTER UPDATE ON ordens_trabalho
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_estatisticas_clientes();
```

### 2. Atualizar Quilometragem do Veículo
Atualizar a quilometragem do veículo quando as ordens de trabalho são concluídas.

```sql
CREATE OR REPLACE FUNCTION atualizar_quilometragem_veiculo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado = 'concluido' AND NEW.quilometragem_servico IS NOT NULL THEN
        UPDATE veiculos
        SET quilometragem = NEW.quilometragem_servico,
            ultima_intervencao = NEW.data_conclusao,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.veiculo_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gatilho_quilometragem_veiculo
    AFTER UPDATE ON ordens_trabalho
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_quilometragem_veiculo();
```

### 3. Atualizar Stock de Peças
Atualizar automaticamente o stock de peças quando as ordens de trabalho utilizam peças.

```sql
CREATE OR REPLACE FUNCTION atualizar_stock_pecas()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE pecas
        SET quantidade_stock = quantidade_stock - NEW.quantidade_utilizada,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.peca_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE pecas
        SET quantidade_stock = quantidade_stock + OLD.quantidade_utilizada,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = OLD.peca_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE pecas
        SET quantidade_stock = quantidade_stock - (NEW.quantidade_utilizada - OLD.quantidade_utilizada),
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = NEW.peca_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gatilho_stock_pecas
    AFTER INSERT OR UPDATE OR DELETE ON pecas_ordem_trabalho
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_stock_pecas();
```

### 4. Audit Trail Trigger
Generic audit trail for all tables.

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_row JSONB;
    new_row JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_row = row_to_json(OLD)::JSONB;
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values)
        VALUES (current_setting('app.current_user_id', true)::INTEGER, 'DELETE', TG_TABLE_NAME, OLD.id, old_row);
    ELSIF TG_OP = 'UPDATE' THEN
        old_row = row_to_json(OLD)::JSONB;
        new_row = row_to_json(NEW)::JSONB;
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (current_setting('app.current_user_id', true)::INTEGER, 'UPDATE', TG_TABLE_NAME, NEW.id, old_row, new_row);
    ELSIF TG_OP = 'INSERT' THEN
        new_row = row_to_json(NEW)::JSONB;
        INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
        VALUES (current_setting('app.current_user_id', true)::INTEGER, 'INSERT', TG_TABLE_NAME, NEW.id, new_row);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Script de Sementação de Dados

### Inserção de Dados de Exemplo

```sql
-- Inserir configurações padrão do sistema
INSERT INTO configuracoes_sistema (chave_configuracao, valor_configuracao, tipo_configuracao, descricao, sistema) VALUES
('nome_empresa', 'Oficina Automóvel', 'string', 'Nome da empresa', true),
('endereco_empresa', 'Rua das Oficinas, 123, Porto', 'string', 'Endereço da empresa', true),
('telefone_empresa', '+351 222 333 444', 'string', 'Telefone da empresa', true),
('email_empresa', 'info@oficina.pt', 'string', 'Email da empresa', true),
('taxa_imposto', '23.00', 'number', 'Percentagem padrão da taxa de imposto', true),
('moeda', 'EUR', 'string', 'Moeda padrão', true);

-- Inserir colunas padrão do Kanban
INSERT INTO colunas_kanban (nome, descricao, posicao, cor) VALUES
('A Agendar', 'Serviços aguardando agendamento', 1, '#ef4444'),
('Agendado', 'Serviços agendados', 2, '#f97316'),
('Em Andamento', 'Serviços em execução', 3, '#eab308'),
('Aguardando Peças', 'Serviços aguardando peças', 4, '#22c55e'),
('Pronto', 'Serviços concluídos', 5, '#3b82f6'),
('Entregue', 'Veículos entregues aos clientes', 6, '#8b5cf6');

-- Inserir categorias de serviço
INSERT INTO categorias_servico (nome, descricao, duracao_estimada) VALUES
('Manutenção', 'Manutenção preventiva e corretiva', '2 hours'),
('Reparação', 'Reparações mecânicas e elétricas', '4 hours'),
('Inspeção', 'Inspeções e diagnósticos', '1 hour'),
('Substituição', 'Substituição de peças e componentes', '3 hours');

-- Inserir serviços de exemplo
INSERT INTO servicos (categoria_id, nome, descricao, preco_base, duracao_estimada, requer_pecas) VALUES
(1, 'Mudança de Óleo', 'Substituição de óleo do motor e filtros', 45.00, '30 minutes', true),
(1, 'Revisão Geral', 'Revisão completa de 60.000km', 150.00, '3 hours', true),
(2, 'Reparação Motor', 'Diagnóstico e reparação de problemas no motor', 0.00, '8 hours', true),
(3, 'Inspeção Pré-Compra', 'Inspeção completa para compra de veículo usado', 85.00, '2 hours', false);
```

## Estratégia de Migração

### Da Dados de Simulação para Base de Dados

1. **Fase 1: Tabelas Principais**
   - Criar tabelas de utilizadores, clientes, veículos, mecânicos
   - Migrar dados de simulação existentes
   - Configurar sistema de autenticação

2. **Fase 2: Gestão de Serviços**
   - Criar tabelas de agendamentos, orçamentos, ordens_trabalho
   - Implementar fluxo de trabalho de serviços
   - Configurar sistema Kanban

3. **Fase 3: Inventário e Faturação**
   - Criar tabelas de peças, fornecedores, faturas
   - Implementar gestão de inventário
   - Configurar sistema de faturação

4. **Fase 4: Funcionalidades Avançadas**
   - Adicionar rastreamento de auditoria e triggers
   - Implementar vistas de relatórios
   - Configurar processos automatizados

## Considerações de Performance

### Estratégia de Indexação
- Chaves primárias automaticamente indexadas
- Chaves estrangeiras indexadas para desempenho de junções
- Campos de estado e data indexados para filtragem
- Índices compostos para padrões de consulta comuns

### Otimização de Consultas
- Utilizar vistas de base de dados para agregações complexas
- Implementar paginação para grandes conjuntos de dados
- Cache de dados frequentemente acessados
- Utilizar tipos de dados apropriados para desempenho

## Medidas de Segurança

### Proteção de Dados
- Encriptar dados sensíveis (palavras-passe, informações de pagamento)
- Implementar segurança ao nível da linha
- Auditorias de segurança regulares
- Registo e monitorização de acesso

### Controlo de Acesso
- Permissões baseadas em funções
- Princípio do menor privilégio
- Gestão de sessões
- Limitação de taxa de API

Este esquema de base de dados fornece uma base sólida para o Sistema de Gestão de Oficina Automóvel, suportando todos os requisitos atuais e permitindo expansão futura.

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
CREATE TABLE utilizadores (
    id SERIAL PRIMARY KEY,
    nome_utilizador VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hash_palavra_passe VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(100) NOT NULL,
    papel VARCHAR(20) NOT NULL CHECK (papel IN ('admin', 'gestor', 'mecanico', 'rececionista')),
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices



```

#### 2. clientes
Informações de clientes e relacionamento comercial.

```sql
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20) NOT NULL,
    nif VARCHAR(20) UNIQUE,
    endereco TEXT,
    perfil VARCHAR(20) DEFAULT 'Normal' CHECK (perfil IN ('Normal', 'TVDE Interno', 'Empresa')),
    data_registo DATE DEFAULT CURRENT_DATE,
    total_gasto DECIMAL(10,2) DEFAULT 0.00,
    visitas INTEGER DEFAULT 0,
    notas TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices





```

#### 3. veiculos
Informações de veículos ligadas aos clientes.

```sql
CREATE TABLE veiculos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    ano INTEGER CHECK (ano >= 1900 AND ano <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    numero_chassis VARCHAR(17) UNIQUE,
    tipo_motor VARCHAR(50),
    tipo_combustivel VARCHAR(20) CHECK (tipo_combustivel IN ('Gasolina', 'Gasóleo', 'Elétrico', 'Híbrido')),
    estado VARCHAR(20) DEFAULT 'disponivel' CHECK (estado IN ('na_oficina', 'disponivel', 'vendido', 'abandonado')),
    quilometragem INTEGER DEFAULT 0,
    ultima_intervencao DATE,
    proxima_revisao DATE,
    companhia_seguros VARCHAR(100),
    apolice_seguro VARCHAR(50),
    validade_seguro DATE,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices





```

#### 4. mecanicos
Informações de funcionários para mecânicos e técnicos.

```sql
CREATE TABLE mecanicos (
    id SERIAL PRIMARY KEY,
    utilizador_id INTEGER,
    nome VARCHAR(100) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    tarifa_horaria DECIMAL(8,2),
    ativo BOOLEAN DEFAULT true,
    data_contratacao DATE,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices



```

### Gestão de Peças e Inventário

#### 5. fornecedores
Informações de fornecedores para aquisição de peças.

```sql
CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    pessoa_contato VARCHAR(100),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    nif VARCHAR(20),
    termos_pagamento VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER
);

-- Índices


```

#### 6. pecas
Inventário e catálogo de peças.

```sql
CREATE TABLE pecas (
    id SERIAL PRIMARY KEY,
    referencia VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    fornecedor_id INTEGER,
    custo_unitario DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2) NOT NULL,
    quantidade_stock INTEGER DEFAULT 0,
    nivel_stock_minimo INTEGER DEFAULT 0,
    nivel_stock_maximo INTEGER,
    localizacao VARCHAR(100),
    veiculos_compativeis TEXT[], -- Array of compatible vehicle models
    ativo BOOLEAN DEFAULT true,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER
);

-- Índices





```

#### 7. transacoes_pecas
Movimentos de stock e transações de inventário.

```sql
CREATE TABLE transacoes_pecas (
    id SERIAL PRIMARY KEY,
    peca_id INTEGER NOT NULL,
    tipo_transacao VARCHAR(20) NOT NULL CHECK (tipo_transacao IN ('entrada', 'saida', 'ajuste', 'devolucao')),
    quantidade INTEGER NOT NULL,
    custo_unitario DECIMAL(10,2),
    custo_total DECIMAL(10,2),
    documento_referencia VARCHAR(50), -- Fatura, número de encomenda, etc.
    fornecedor_id INTEGER,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER
);

-- Indexes



```

### Gestão de Serviços

#### 8. categorias_servico
Categorias para diferentes tipos de serviços.

```sql
CREATE TABLE categorias_servico (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    duracao_estimada INTERVAL, -- Tempo médio para este serviço
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes


```

#### 9. servicos
Serviços disponíveis oferecidos pela oficina.

```sql
CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER ),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco_base DECIMAL(10,2),
    duracao_estimada INTERVAL,
    requer_pecas BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes



```

#### 10. agendamentos
Agendamentos de serviços programados.

```sql
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL ),
    veiculo_id INTEGER NOT NULL ),
    mecanico_id INTEGER ),
    servico_id INTEGER ),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    estado VARCHAR(20) DEFAULT 'agendado' CHECK (estado IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu')),
    prioridade VARCHAR(10) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    custo_estimado DECIMAL(10,2),
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER ),
    atualizado_por INTEGER )
);

-- Índices






```

### Quotes & Estimates

#### 11. orcamentos
Orçamentos de serviços e estimativas.

```sql
CREATE TABLE orcamentos (
    id SERIAL PRIMARY KEY,
    numero_orcamento VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL ),
    veiculo_id INTEGER NOT NULL ),
    preparado_por INTEGER ),
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_expiracao DATE,
    estado VARCHAR(20) DEFAULT 'pendente' CHECK (estado IN ('pendente', 'aprovado', 'rejeitado', 'expirado', 'convertido')),
    total_pecas DECIMAL(10,2) DEFAULT 0.00,
    total_mao_obra DECIMAL(10,2) DEFAULT 0.00,
    total_desconto DECIMAL(10,2) DEFAULT 0.00,
    total_imposto DECIMAL(10,2) DEFAULT 0.00,
    total_geral DECIMAL(10,2) NOT NULL,
    notas TEXT,
    data_aprovacao DATE,
    aprovado_por INTEGER ),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices





```

#### 12. itens_orcamento
Itens individuais dentro de um orçamento.

```sql
CREATE TABLE itens_orcamento (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER NOT NULL ) ON DELETE CASCADE,
    tipo_item VARCHAR(20) NOT NULL CHECK (tipo_item IN ('servico', 'peca', 'outro')),
    servico_id INTEGER ),
    peca_id INTEGER ),
    descricao TEXT NOT NULL,
    quantidade DECIMAL(8,2) DEFAULT 1.00,
    preco_unitario DECIMAL(10,2) NOT NULL,
    percentual_desconto DECIMAL(5,2) DEFAULT 0.00,
    valor_desconto DECIMAL(10,2) DEFAULT 0.00,
    percentual_imposto DECIMAL(5,2) DEFAULT 23.00,
    valor_imposto DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) NOT NULL,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices



```

### Ordens de Trabalho e Histórico de Serviços

#### 13. ordens_trabalho
Trabalho real realizado nos veículos.

```sql
CREATE TABLE ordens_trabalho (
    id SERIAL PRIMARY KEY,
    numero_ordem_trabalho VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL ),
    veiculo_id INTEGER NOT NULL ),
    mecanico_id INTEGER ),
    orcamento_id INTEGER ),
    agendamento_id INTEGER ),
    data_inicio DATE,
    data_conclusao DATE,
    estado VARCHAR(20) DEFAULT 'em_andamento' CHECK (estado IN ('pendente', 'em_andamento', 'concluido', 'cancelado', 'faturado')),
    quilometragem_servico INTEGER,
    descricao_problema TEXT,
    trabalho_realizado TEXT,
    recomendacoes TEXT,
    total_pecas DECIMAL(10,2) DEFAULT 0.00,
    total_mao_obra DECIMAL(10,2) DEFAULT 0.00,
    total_desconto DECIMAL(10,2) DEFAULT 0.00,
    total_imposto DECIMAL(10,2) DEFAULT 0.00,
    total_geral DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER ),
    atualizado_por INTEGER )
);

-- Índices






```

#### 14. itens_ordem_trabalho
Itens detalhados em uma ordem de trabalho.

```sql
CREATE TABLE itens_ordem_trabalho (
    id SERIAL PRIMARY KEY,
    ordem_trabalho_id INTEGER NOT NULL ) ON DELETE CASCADE,
    tipo_item VARCHAR(20) NOT NULL CHECK (tipo_item IN ('servico', 'peca', 'outro')),
    servico_id INTEGER ),
    peca_id INTEGER ),
    descricao TEXT NOT NULL,
    quantidade DECIMAL(8,2) DEFAULT 1.00,
    preco_unitario DECIMAL(10,2) NOT NULL,
    horas_trabalho DECIMAL(6,2),
    tarifa_horaria DECIMAL(8,2),
    percentual_desconto DECIMAL(5,2) DEFAULT 0.00,
    valor_desconto DECIMAL(10,2) DEFAULT 0.00,
    percentual_imposto DECIMAL(5,2) DEFAULT 23.00,
    valor_imposto DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) NOT NULL,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices



```

#### 15. pecas_ordem_trabalho
Peças utilizadas em ordens de trabalho (tabela de junção com quantidades).

```sql
CREATE TABLE pecas_ordem_trabalho (
    id SERIAL PRIMARY KEY,
    ordem_trabalho_id INTEGER NOT NULL ) ON DELETE CASCADE,
    peca_id INTEGER NOT NULL ),
    quantidade_utilizada DECIMAL(8,2) NOT NULL,
    custo_unitario DECIMAL(10,2) NOT NULL,
    custo_total DECIMAL(10,2) NOT NULL,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices


```

### Faturação

#### 16. faturas
Faturas de clientes.

```sql
CREATE TABLE faturas (
    id SERIAL PRIMARY KEY,
    numero_fatura VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER NOT NULL ),
    ordem_trabalho_id INTEGER ),
    data_emissao DATE DEFAULT CURRENT_DATE,
    data_vencimento DATE,
    data_pagamento DATE,
    estado VARCHAR(20) DEFAULT 'pendente' CHECK (estado IN ('pendente', 'parcial', 'paga', 'vencida', 'cancelada')),
    subtotal DECIMAL(10,2) NOT NULL,
    valor_imposto DECIMAL(10,2) DEFAULT 0.00,
    valor_desconto DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) DEFAULT 0.00,
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER )
);

-- Índices






```

#### 17. itens_fatura
Itens dentro de uma fatura.

```sql
CREATE TABLE itens_fatura (
    id SERIAL PRIMARY KEY,
    fatura_id INTEGER NOT NULL ) ON DELETE CASCADE,
    item_ordem_trabalho_id INTEGER ),
    descricao TEXT NOT NULL,
    quantidade DECIMAL(8,2) DEFAULT 1.00,
    preco_unitario DECIMAL(10,2) NOT NULL,
    valor_desconto DECIMAL(10,2) DEFAULT 0.00,
    valor_imposto DECIMAL(10,2) DEFAULT 0.00,
    valor_total DECIMAL(10,2) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices


```

#### 18. pagamentos
Registos de pagamentos para faturas.

```sql
CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    fatura_id INTEGER NOT NULL ),
    data_pagamento DATE DEFAULT CURRENT_DATE,
    valor DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50) NOT NULL CHECK (metodo_pagamento IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'transferencia', 'cheque', 'mbway', 'paypal')),
    referencia VARCHAR(100), -- Referência da transação, número do cheque, etc.
    notas TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER )
);

-- Índices



```

### Kanban & Workflow Management

#### 19. colunas_kanban
Colunas do quadro Kanban.

```sql
CREATE TABLE colunas_kanban (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    posicao INTEGER NOT NULL,
    cor VARCHAR(7), -- Código de cor hexadecimal
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices


```

#### 20. cartoes_kanban
Cartões Kanban representando itens de trabalho.

```sql
CREATE TABLE cartoes_kanban (
    id SERIAL PRIMARY KEY,
    coluna_id INTEGER NOT NULL ),
    ordem_trabalho_id INTEGER ),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade VARCHAR(10) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    atribuido_a INTEGER ),
    data_limite DATE,
    etiquetas TEXT[], -- Array of tags
    posicao INTEGER NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER ),
    atualizado_por INTEGER )
);

-- Índices





```

#### 21. historico_cartao_kanban
Rastreamento de auditoria para movimentos de cartões Kanban.

```sql
CREATE TABLE historico_cartao_kanban (
    id SERIAL PRIMARY KEY,
    cartao_id INTEGER NOT NULL ) ON DELETE CASCADE,
    coluna_origem_id INTEGER ),
    coluna_destino_id INTEGER NOT NULL ),
    movido_por INTEGER ),
    movido_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Índices


```

### System Configuration & Audit

#### 22. configuracoes_sistema
Definições de configuração da aplicação.

```sql
CREATE TABLE configuracoes_sistema (
    id SERIAL PRIMARY KEY,
    chave_configuracao VARCHAR(100) UNIQUE NOT NULL,
    valor_configuracao TEXT,
    tipo_configuracao VARCHAR(20) DEFAULT 'string' CHECK (tipo_configuracao IN ('string', 'number', 'boolean', 'json')),
    descricao TEXT,
    sistema BOOLEAN DEFAULT false,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_por INTEGER )
);

-- Índices

```

#### 23. log_auditoria
Rastreamento de auditoria em todo o sistema.

```sql
CREATE TABLE log_auditoria (
    id SERIAL PRIMARY KEY,
    utilizador_id INTEGER ),
    acao VARCHAR(100) NOT NULL,
    nome_tabela VARCHAR(50),
    id_registo INTEGER,
    valores_antigos JSONB,
    valores_novos JSONB,
    endereco_ip INET,
    agente_utilizador TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices





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

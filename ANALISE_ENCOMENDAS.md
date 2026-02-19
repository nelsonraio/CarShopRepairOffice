# Análise e Melhorias - Sistema de Encomendas e Peças

## 📊 Estado Atual

### Estrutura Existente
1. **Tabelas no Banco de Dados**
   - `pecas` - Catálogo de peças com stock
   - `pecas_ordem_trabalho` - Rastreamento de peças usadas nas ordens de trabalho
   - `transacoes_pecas` - Log de movimentos de stock
   - `fornecedores` - Informações dos fornecedores

2. **Componentes Frontend**
   - `OrdesModal.tsx` - Lista de encomendas (ainda com dados MOCK)
   - `OrderPartsModal.tsx` - Modal para encomendar peças
   - `PartsTable.tsx` - Tabela de peças
   - `pecas/page.tsx` - Página principal de peças

3. **APIs Existentes**
   - `GET /api/pecas` - Lista peças activas
   - `POST /api/pecas` - Adiciona nova peça
   - `PUT /api/pecas` - Atualiza peça
   - `GET /api/fornecedores` - Lista fornecedores

---

## ⚠️ Problemas Identificados

### 1. **Falta de Sistema de Encomendas Persistente**
   - **Problema**: Os dados das encomendas no `OrdersModal.tsx` são MOCK (hardcoded)
   - **Impacto**: Não há persistência de encomendas na base de dados
   - **Consequência**: Histórico de encomendas não é guardado

### 2. **Sem Tabela de Encomendas**
   - **Problema**: Não existe modelo Prisma para armazenar encomendas
   - **Impacto**: Impossível rastrear status de encomendas (pendente, em trânsito, recebido)
   - **Consequência**: Sem auditoria e controlo de encomendas

### 3. **Gestão de Stock Incompleta**
   - **Problema**: `quantidade_stock` é apenas um número, sem histórico detalhado
   - **Impacto**: Impossível saber quando o stock foi recebido de uma encomenda específica
   - **Consequência**: Não há rastreabilidade completa

### 4. **Falta de Alertas de Stock**
   - **Problema**: Sem sistema automático para alertar quando stock está abaixo do mínimo
   - **Impacto**: Risco de funcionar sem peças essenciais
   - **Consequência**: Paradas no trabalho não planeadas

### 5. **Sem Dashboard Analítico**
   - **Problema**: Sem visualização de problemas de stock e encomendas
   - **Impacto**: Difícil identificar padrões de consumo
   - **Consequência**: Gestão reactiva em vez de proactiva

### 6. **Sem Integração com Ordem de Trabalho**
   - **Problema**: Encomendas de peças não estão ligadas às ordens de trabalho que as necessitam
   - **Impacto**: Sem visibilidade de porque está uma encomenda pendente
   - **Consequência**: Comunicação deficiente com clientes

---

## ✨ Melhorias Sugeridas

### 🥇 Prioridade 1: Criar Sistema de Encomendas (Crítico)

#### 1.1 Criar Tabela `encomendas_pecas`
```sql
CREATE TABLE encomendas_pecas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  numero_encomenda VARCHAR(20) UNIQUE NOT NULL,
  fornecedor_id INT NOT NULL,
  data_encomenda DATE NOT NULL,
  data_entrega_estimada DATE,
  data_entrega_real DATE,
  estado ENUM('rascunho', 'pendente', 'em_transito', 'recebido', 'cancelado'),
  custo_total DECIMAL(10,2),
  notas TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);
```

#### 1.2 Criar Tabela `itens_encomenda_peca`
```sql
CREATE TABLE itens_encomenda_peca (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  encomenda_id BIGINT NOT NULL,
  peca_id BIGINT NOT NULL,
  quantidade_encomendada INT NOT NULL,
  quantidade_recebida INT DEFAULT 0,
  preco_unitario DECIMAL(10,2),
  ordem_trabalho_id BIGINT,
  estado ENUM('pendente', 'recebido', 'cancelado'),
  FOREIGN KEY (encomenda_id) REFERENCES encomendas_pecas(id),
  FOREIGN KEY (peca_id) REFERENCES pecas(id),
  FOREIGN KEY (ordem_trabalho_id) REFERENCES ordens_trabalho(id)
);
```

#### 1.3 Criar API de Encomendas
- `POST /api/encomendas` - Criar encomenda
- `GET /api/encomendas` - Listar encomendas
- `GET /api/encomendas?fornecedor_id=123` - Encomendas por fornecedor
- `GET /api/encomendas?estado=pendente` - Encomendas por estado
- `PATCH /api/encomendas/[id]` - Actualizar estado
- `PUT /api/encomendas/[id]/receber` - Receber encomenda

---

### 🥈 Prioridade 2: Dashboard de Stock

#### 2.1 Criar Página `/estoque` com:
- **Peças em Risco**: Abaixo do nível mínimo
- **Encomendas Pendentes**: Aguardando recebimento
- **Gráfico de Consumo**: Top 10 peças mais usadas
- **Alertas**: Peças não recebidas no prazo

#### 2.2 Endpoint para Dashboard
```typescript
GET /api/estoque/resumo
Resposta:
{
  peças_em_risco: [{ id, nome, stock, minimo, fornecedor }],
  encomendas_pendentes: [{ id, numero, fornecedor, dias_atraso }],
  consumo_mes: [{ peca: { nome }, quantidade_usada }],
  valor_pendente: 1250.50
}
```

---

### 🥉 Prioridade 3: Alertas Automáticos

#### 3.1 Sistema de Alertas
- Quando `quantidade_stock <= nivel_stock_minimo`
- Quando encomenda atrasar > 5 dias
- Quando receceber encomenda com discrepância

#### 3.2 API de Alertas
```typescript
GET /api/alertas?tipo=stock,encomenda
GET /api/alertas/lido - Listar apenas não lidos
PATCH /api/alertas/[id]/ler
```

---

### 🔄 Integração com Ordem de Trabalho

#### 4.1 Campo em Ordens de Trabalho
Ligação entre itens de ordem de trabalho e encomendas:
```typescript
// Em itens_encomenda_peca
ordem_trabalho_item_id: BigInt (vincular ao item específico)
```

#### 4.2 Funcionalidades
- Ao criar ordem de trabalho, sugerir encomendas para peças em falta
- Notificação quando peça encomendada chega
- Bloquear conclusão de ordem se peças não foram recebidas

---

### 📈 Melhorias Adicionais

#### 5.1 Gestão Avançada de Stock
- Lotes/Números de série (se aplicável)
- Localização de armazenamento
- Rastreabilidade de procedência

#### 5.2 Previsões
- Sugerir quantidade ideal a encomendar baseado em histórico
- Alertas para sazonalidade de consumo

#### 5.3 Relatórios
- Custo de stock bloqueado
- ROT (Rotation) - Peças não movidas há X meses
- Fornecedores: Fiabilidade, prazos, preços

#### 5.4 Integrações
- API para enviar encomendas directamente ao fornecedor
- Email automático ao fornecedor quando encomenda criada
- SMS/WhatsApp para alertas críticos

---

## 📋 Resumo das Implementações Recomendadas

| Prioridade | Feature | Complexidade | Tempo Est. |
|-----------|---------|--------------|-----------|
| 1 | Tabelas de Encomendas | Média | 2h |
| 1 | APIs de Encomendas | Média | 3h |
| 1 | UI do OrdersModal | Média | 2h |
| 2 | Dashboard de Stock | Alta | 4h |
| 2 | Alertas Básicos | Média | 2h |
| 3 | Integração Ordem-Encomenda | Média | 3h |
| 3 | Relatórios | Alta | 5h |
| 4 | Previsões ML | Muito Alta | 8h+ |

---

## 🎯 Próximos Passos Recomendados

1. **Implementar imediatamente**:
   - Criar tabelas de encomendas no banco
   - Implementar APIs básicas CRUD
   - Converter OrdersModal de mock para dados reais

2. **Implementar em segunda fase**:
   - Dashboard de Stock
   - Sistema de Alertas
   - Integração com Ordens de Trabalho

3. **Melhorias futuras**:
   - Sistema de previsões
   - Integrações com fornecedores
   - Análise de tendências

---

## 💾 Ficheiros a Ser Modificados/Criados

### Novos Ficheiros
- `prisma/migrations/XXX_create_encomendas.sql`
- `src/app/api/encomendas/route.ts`
- `src/app/api/encomendas/[id]/route.ts`
- `src/app/api/estoque/resumo/route.ts`
- `src/app/api/alertas/route.ts`
- `src/app/estoque/page.tsx` (novo)
- `src/components/AlertasPanel.tsx` (novo)

### Ficheiros a Modificar
- `prisma/schema.prisma` (adicionar modelos de encomendas)
- `src/app/pecas/page.tsx` (actualizar imports, remover mock data)
- `src/components/OrdersModal.tsx` (integração com API real)
- `src/components/OrderPartsModal.tsx` (ligar com encomendas)

---


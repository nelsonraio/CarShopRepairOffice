# Plano de Implementação - Sistema de Encomendas (Prioridade 1)

## 🎯 Objetivo
Implementar um sistema completo e funcional de encomendas de peças com persistência em base de dados e interface funcional.

---

## 📝 Fase 1: Modificações no Schema Prisma

### Passo 1.1: Adicionar Modelos ao `schema.prisma`

```prisma
/// Encomendas de peças aos fornecedores
model encomendas_pecas {
  id                    BigInt    @id @unique(map: "id") @default(autoincrement()) @db.UnsignedBigInt
  numero_encomenda      String    @unique(map: "numero_encomenda") @db.VarChar(20)
  fornecedor_id         Int
  data_encomenda        DateTime  @db.Date
  data_entrega_estimada DateTime? @db.Date
  data_entrega_real     DateTime? @db.Date
  estado                String    @default("pendente") @db.VarChar(20)
  custo_total           Decimal   @db.Decimal(10, 2)
  notas                 String?   @db.Text
  criado_em             DateTime? @default(now()) @db.Timestamp(0)
  atualizado_em         DateTime? @default(now()) @db.Timestamp(0)
  criado_por            Int?
  
  fornecedor            fornecedores           @relation(fields: [fornecedor_id], references: [id])
  itens                 itens_encomenda_peca[]

  @@index([fornecedor_id])
  @@index([estado])
}

/// Items individuais de uma encomenda
model itens_encomenda_peca {
  id                      BigInt    @id @unique(map: "id") @default(autoincrement()) @db.UnsignedBigInt
  encomenda_id            BigInt
  peca_id                 BigInt
  quantidade_encomendada  Int
  quantidade_recebida     Int       @default(0)
  preco_unitario          Decimal   @db.Decimal(10, 2)
  preco_total             Decimal   @db.Decimal(10, 2)
  estado                  String    @default("pendente") @db.VarChar(20)
  ordem_trabalho_item_id  BigInt?
  notas                   String?   @db.Text
  criado_em               DateTime? @default(now()) @db.Timestamp(0)

  encomenda               encomendas_pecas      @relation(fields: [encomenda_id], references: [id], onDelete: Cascade)
  peca                    pecas                 @relation(fields: [peca_id], references: [id])

  @@index([encomenda_id])
  @@index([peca_id])
  @@index([estado])
}

// Adicionar ao modelo pecas:
model pecas {
  // ... campos existentes ...
  
  // Adicionar relação
  itens_encomenda       itens_encomenda_peca[]
}

// Adicionar ao modelo fornecedores:
model fornecedores {
  // ... campos existentes ...
  
  // Adicionar relação
  encomendas_pecas      encomendas_pecas[]
}
```

---

## 🔌 Fase 2: Criar APIs

### Passo 2.1: Criar `src/app/api/encomendas/route.ts`

**Funcionalidades**:
- GET: Listar encomendas com filtros
- POST: Criar nova encomenda
- PATCH: Actualizar estado

**Filtros desejados**:
- fornecedor_id
- estado
- data_inicio e data_fim
- apenas_atrasadas

### Passo 2.2: Criar `src/app/api/encomendas/[id]/route.ts`

**Funcionalidades**:
- GET: Detalhe da encomenda com itens
- PATCH: Actualizar encomenda
- DELETE: Cancelar encomenda

### Passo 2.3: Criar `src/app/api/encomendas/[id]/receber/route.ts`

**Funcionalidades**:
- POST: Registar recebimento de encomenda
- Actualizar automatic os stocks
- Registar transacções em `transacoes_pecas`

### Passo 2.4: Criar `src/app/api/encomendas/sugerir/route.ts`

**Funcionalidades**:
- POST: Sugerir encomenda baseado em peças baixas
- Calcular quantidades ideais
- Retornar fornecedor recomendado

---

## 🎨 Fase 3: Componentes UI

### Passo 3.1: Criar `src/components/EncomendaModal.tsx`

**View**: Modal para criar/editar encomendas
- Seleção de fornecedor
- Listagem de peças disponíveis
- Selecção de quantidade
- Data entrega estimada
- Cálculo automático de custos

### Passo 3.2: Criar `src/components/EncomendaTable.tsx`

**View**: Tabela mostrando todas as encomendas
- Número encomenda
- Fornecedor
- Status com badge de cor
- Data entrega estimada
- Dias atraso (se aplicável)
- Ações: Ver detalhe, Receber, Cancelar

### Passo 3.3: Atualizar `src/components/OrdersModal.tsx`

**Modificações**:
- Remover dados MOCK
- Integrar com API real `/api/encomendas`
- Actualizar em tempo real
- Manter funcionalidades existentes

---

## 📄 Fase 4: Página de Encomendas

### Passo 4.1: Criar `src/app/encomendas/page.tsx`

**Funcionalidades**:
- Listagem de encomendas com tabela
- Filtros por fornecedor, estado, data
- Botão "Nova Encomenda"
- Botão "Sugerir Encomenda" (baseado em stock baixo)
- Visualizador de detalhe em modal

**States**:
- Carregamento de dados
- Erro
- Vazio
- Expandir detalhe de itens

---

## 📊 Fase 5: Integrações

### Passo 5.1: Atualizar `transacoes_pecas`

Cuando uma encomenda é recebida:
- Criar entrada em `transacoes_pecas` com tipo='entrada_encomenda'
- Actualizar `quantidade_stock` em `pecas`
- Registar de qual encomenda veio o stock

### Passo 5.2: Alerts/Notificações

Criar campo em `configuracoes_sistema`:
- `alerta_encomenda_atraso` (dias)
- `alerta_stock_minimo` (booleano)
- `auto_sugerir_encomenda` (booleano)

---

## 🏗️ Estrutura de API Detalhada

### GET /api/encomendas
```typescript
Query params:
- fornecedor_id?: number
- estado?: 'pendente' | 'em_transito' | 'recebido' | 'cancelado'
- data_inicio?: ISO date
- data_fim?: ISO date
- apenas_atrasadas?: boolean
- limit?: number (default 50)
- offset?: number (default 0)

Response:
{
  data: [
    {
      id: bigint,
      numero_encomenda: string,
      fornecedor: { id, nome },
      data_encomenda: date,
      data_entrega_estimada: date,
      data_entrega_real: date,
      estado: string,
      custo_total: decimal,
      dias_atraso: number,
      itens_count: number,
      itens: [
        {
          id: bigint,
          peca: { id, nome, referencia },
          quantidade_encomendada: int,
          quantidade_recebida: int,
          preco_unitario: decimal,
          estado: string
        }
      ]
    }
  ],
  total: number,
  pagina: number
}
```

### POST /api/encomendas
```typescript
Body:
{
  fornecedor_id: number,
  data_entrega_estimada: ISO date,
  itens: [
    {
      peca_id: bigint,
      quantidade: int,
      preco_unitario: decimal
    }
  ],
  notas?: string
}

Response:
{
  id: bigint,
  numero_encomenda: string,
  ... (mesma estrutura GET)
}
```

### PATCH /api/encomendas/[id]
```typescript
Body:
{
  estado?: string,
  data_entrega_estimada?: date,
  notas?: string
}
```

### POST /api/encomendas/[id]/receber
```typescript
Body:
{
  data_entrega_real: ISO date,
  itens_recebidos: [
    {
      item_id: bigint,
      quantidade: int
    }
  ]
}

Side effects:
- Actualizar quantidade_stock em pecas
- Criar transacao em transacoes_pecas
- Actualizar estado da encomenda para 'recebido'
- Se houver discrepância, gerar alerta
```

---

## 🧪 Testes Básicos

1. **Criar Encomenda**
   - POST com 2-3 items
   - Verificar numero_encomenda foi gerado
   - Verificar custo_total foi calculado

2. **Listar via Filtros**
   - GET sem filtros
   - GET com fornecedor_id
   - GET com apenas_atrasadas=true

3. **Atualizar Estado**
   - PATCH estado para 'em_transito'
   - Verificar que se propaga

4. **Receber Encomenda**
   - POST receber com items
   - Verificar stock actualizado
   - Verificar transacao criada

---

## 📅 Timeline Estimada

- **Prisma Schema**: 30 min
- **APIs**: 2-3 hours
- **Componentes UI**: 1.5-2 hours
- **Página**: 1 hour
- **Testes/Debugging**: 1-2 hours

**Total**: ~6-8 hours de desenvolvimento

---

## ✅ Checklist de Implementação

- [ ] Schema Prisma actualizado
- [ ] Migrations executadas
- [ ] API GET encomendas implementada
- [ ] API POST encomenda implementada
- [ ] API PATCH status implementada
- [ ] API receber encomenda implementada
- [ ] EncomendaModal criado
- [ ] EncomendaTable criado
- [ ] OrdersModal integrado com API
- [ ] Página /encomendas criada
- [ ] Tratamento de erros
- [ ] Validações de entrada
- [ ] Testes manuais completos
- [ ] Performance testada com 100+ encomendas

---


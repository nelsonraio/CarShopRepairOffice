import { mysqlTable, mysqlSchema, primaryKey, unique, serial, int, date, decimal, varchar, text, timestamp, datetime, foreignKey, time, index, bigint, json, mysqlEnum, tinyint } from "drizzle-orm/mysql-core"
import type { AnyMySqlColumn } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const pagamentos = mysqlTable("__pagamentos", {
	id: serial().notNull(),
	faturaId: int("fatura_id").notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataPagamento: date("data_pagamento", { mode: 'string' }),
	valor: decimal({ precision: 10, scale: 2 }).notNull(),
	metodoPagamento: varchar("metodo_pagamento", { length: 50 }).notNull(),
	referencia: varchar({ length: 100 }),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "__pagamentos_id"}),
	unique("id").on(table.id),
]);

export const pecasOrdemTrabalho = mysqlTable("__pecas_ordem_trabalho", {
	id: serial().notNull(),
	ordemTrabalhoId: int("ordem_trabalho_id").notNull(),
	pecaId: int("peca_id").notNull(),
	quantidadeUtilizada: decimal("quantidade_utilizada", { precision: 8, scale: 2 }).notNull(),
	custoUnitario: decimal("custo_unitario", { precision: 10, scale: 2 }).notNull(),
	custoTotal: decimal("custo_total", { precision: 10, scale: 2 }).notNull(),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "__pecas_ordem_trabalho_id"}),
	unique("id").on(table.id),
]);

export const prismaMigrations = mysqlTable("_prisma_migrations", {
	id: varchar({ length: 36 }).notNull(),
	checksum: varchar({ length: 64 }).notNull(),
	finishedAt: datetime("finished_at", { mode: 'string', fsp: 3 }),
	migrationName: varchar("migration_name", { length: 255 }).notNull(),
	logs: text("logs"),
	rolledBackAt: datetime("rolled_back_at", { mode: 'string', fsp: 3 }),
	startedAt: datetime("started_at", { mode: 'string', fsp: 3 }).default(sql`(CURRENT_TIMESTAMP(3))`).notNull(),
	appliedStepsCount: int("applied_steps_count", { unsigned: true }).default(0).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "_prisma_migrations_id"}),
]);

export const agendamentos = mysqlTable("agendamentos", {
	id: serial().notNull(),
	clienteId: int("cliente_id").references(() => clientes.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	mecanicoId: int("mecanico_id"),
	matricula: varchar({ length: 50 }),
	titulo: varchar({ length: 255 }).notNull(),
	descricao: text("descricao"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataAgendamento: date("data_agendamento", { mode: 'string' }).notNull(),
	horaInicio: time("hora_inicio").notNull(),
	estado: varchar({ length: 20 }).default('agendado'),
	prioridade: varchar({ length: 10 }).default('normal'),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	marca: varchar({ length: 150 }),
	modelo: varchar({ length: 150 }),
	ano: int(),
	contactoNome: varchar("contacto_nome", { length: 100 }),
	contactoTelefone: varchar("contacto_telefone", { length: 20 }),
	contactoEmail: varchar("contacto_email", { length: 255 }),
	criadoPor: varchar("criado_por", { length: 50 }),
	atualizadoPor: varchar("atualizado_por", { length: 50 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "agendamentos_id"}),
	unique("id").on(table.id),
]);

export const alertasSistema = mysqlTable("alertas_sistema", {
	id: serial().notNull(),
	tipo: varchar({ length: 50 }).notNull(),
	titulo: varchar({ length: 255 }).notNull(),
	descricao: text("descricao"),
	severidade: varchar({ length: 20 }).default('normal'),
	referenciaId: bigint("referencia_id", { mode: "number", unsigned: true }),
	referenciaTipo: varchar("referencia_tipo", { length: 50 }),
	lido: tinyint().default(0),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	lidoEm: timestamp("lido_em", { mode: 'string' }),
},
(table) => [
	index("criado_em").on(table.criadoEm),
	index("lido").on(table.lido),
	index("severidade").on(table.severidade),
	index("tipo").on(table.tipo),
	primaryKey({ columns: [table.id], name: "alertas_sistema_id"}),
	unique("id").on(table.id),
]);

export const cartoesKanban = mysqlTable("cartoes_kanban", {
	id: serial().notNull(),
	colunaId: int("coluna_id").notNull(),
	ordemTrabalhoId: int("ordem_trabalho_id"),
	titulo: varchar({ length: 255 }).notNull(),
	descricao: text("descricao"),
	prioridade: varchar({ length: 10 }).default('normal'),
	atribuidoA: int("atribuido_a"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataLimite: date("data_limite", { mode: 'string' }),
	etiquetas: text("etiquetas"),
	posicao: int().notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
	atualizadoPor: int("atualizado_por"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "cartoes_kanban_id"}),
	unique("id").on(table.id),
]);

export const categoriasPeca = mysqlTable("categorias_peca", {
	id: serial().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	descricao: text("descricao"),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "categorias_peca_id"}),
	unique("categorias_peca_id").on(table.id),
	unique("categorias_peca_nome").on(table.nome),
]);

export const categoriasServico = mysqlTable("categorias_servico", {
	id: serial().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	descricao: text("descricao"),
	duracaoEstimada: time("duracao_estimada"),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "categorias_servico_id"}),
	unique("id").on(table.id),
]);

export const clientes = mysqlTable("clientes", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }),
	telefone: varchar({ length: 20 }).notNull(),
	nif: varchar({ length: 20 }),
	endereco: text("endereco"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataRegisto: date("data_registo", { mode: 'string' }).default(sql`(curdate())`),
	totalGasto: decimal("total_gasto", { precision: 10, scale: 2 }).default('0.00'),
	visitas: int().default(0),
	notas: text("notas"),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	perfilId: int("perfil_id").references(() => perfisClientes.id, { onDelete: "set null", onUpdate: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "clientes_id"}),
]);

export const colunasKanban = mysqlTable("colunas_kanban", {
	id: serial().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	descricao: text("descricao"),
	posicao: int().notNull(),
	cor: varchar({ length: 7 }),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "colunas_kanban_id"}),
	unique("id").on(table.id),
]);

export const configuracoesSistema = mysqlTable("configuracoes_sistema", {
	id: serial().notNull(),
	chaveConfiguracao: varchar("chave_configuracao", { length: 100 }).notNull(),
	valorConfiguracao: text("valor_configuracao"),
	tipoConfiguracao: varchar("tipo_configuracao", { length: 20 }).default('string'),
	descricao: text("descricao"),
	sistema: tinyint().default(0),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	atualizadoPor: int("atualizado_por"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "configuracoes_sistema_id"}),
	unique("id").on(table.id),
	unique("chave_configuracao").on(table.chaveConfiguracao),
]);

export const encomendasPecas = mysqlTable("encomendas_pecas", {
	id: serial().notNull(),
	numeroEncomenda: varchar("numero_encomenda", { length: 20 }).notNull(),
	fornecedorId: int("fornecedor_id").notNull().references(() => fornecedores.id, { onDelete: "cascade" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataEncomenda: date("data_encomenda", { mode: 'string' }).notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataEntregaEstimada: date("data_entrega_estimada", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataEntregaReal: date("data_entrega_real", { mode: 'string' }),
	estado: varchar({ length: 20 }).default('pendente'),
	custoTotal: decimal("custo_total", { precision: 10, scale: 2 }),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
},
(table) => [
	index("estado").on(table.estado),
	index("fornecedor_id").on(table.fornecedorId),
	primaryKey({ columns: [table.id], name: "encomendas_pecas_id"}),
	unique("id").on(table.id),
	unique("numero_encomenda").on(table.numeroEncomenda),
]);

export const faturas = mysqlTable("faturas", {
	id: serial().notNull(),
	numeroFatura: varchar("numero_fatura", { length: 20 }).notNull(),
	clienteId: int("cliente_id").notNull(),
	ordemTrabalhoId: int("ordem_trabalho_id"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataEmissao: date("data_emissao", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataVencimento: date("data_vencimento", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataPagamento: date("data_pagamento", { mode: 'string' }),
	estado: varchar({ length: 20 }).default('pendente'),
	subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
	valorImposto: decimal("valor_imposto", { precision: 10, scale: 2 }).default('0.00'),
	valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default('0.00'),
	valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
	valorPago: decimal("valor_pago", { precision: 10, scale: 2 }).default('0.00'),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
	reciboToconlineId: varchar("recibo_toconline_id", { length: 50 }),
	toconlineCustomerId: varchar("toconline_customer_id", { length: 50 }),
	toconlineId: varchar("toconline_id", { length: 50 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "faturas_id"}),
	unique("id").on(table.id),
	unique("numero_fatura").on(table.numeroFatura),
]);

export const fornecedores = mysqlTable("fornecedores", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	pessoaContato: varchar("pessoa_contato", { length: 100 }),
	email: varchar({ length: 255 }),
	telefone: varchar({ length: 20 }),
	endereco: text("endereco"),
	nif: varchar({ length: 20 }),
	termosPagamento: varchar("termos_pagamento", { length: 50 }),
	ativo: tinyint().default(1),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "fornecedores_id"}),
]);

export const historicoCartaoKanban = mysqlTable("historico_cartao_kanban", {
	id: serial().notNull(),
	cartaoId: int("cartao_id").notNull(),
	colunaOrigemId: int("coluna_origem_id"),
	colunaDestinoId: int("coluna_destino_id").notNull(),
	movidoPor: int("movido_por"),
	movidoEm: timestamp("movido_em", { mode: 'string' }).defaultNow(),
	notas: text("notas"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "historico_cartao_kanban_id"}),
	unique("id").on(table.id),
]);

export const itensEncomendaPeca = mysqlTable("itens_encomenda_peca", {
	id: serial().notNull(),
	encomendaId: bigint("encomenda_id", { mode: "number", unsigned: true }).notNull().references(() => encomendasPecas.id, { onDelete: "cascade" } ),
	pecaId: bigint("peca_id", { mode: "number", unsigned: true }).notNull().references(() => pecas.id),
	quantidadeEncomendada: int("quantidade_encomendada").notNull(),
	quantidadeRecebida: int("quantidade_recebida").default(0),
	precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }),
	precoTotal: decimal("preco_total", { precision: 10, scale: 2 }),
	estado: varchar({ length: 20 }).default('pendente'),
	ordemTrabalhoItemId: bigint("ordem_trabalho_item_id", { mode: "number", unsigned: true }),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	index("encomenda_id").on(table.encomendaId),
	index("estado").on(table.estado),
	index("peca_id").on(table.pecaId),
	primaryKey({ columns: [table.id], name: "itens_encomenda_peca_id"}),
	unique("id").on(table.id),
]);

export const itensFatura = mysqlTable("itens_fatura", {
	id: serial().notNull(),
	faturaId: int("fatura_id").notNull(),
	itemOrdemTrabalhoId: int("item_ordem_trabalho_id"),
	descricao: text("descricao").notNull(),
	quantidade: decimal({ precision: 8, scale: 2 }).default('1.00'),
	precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
	valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default('0.00'),
	valorImposto: decimal("valor_imposto", { precision: 10, scale: 2 }).default('0.00'),
	valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "itens_fatura_id"}),
	unique("id").on(table.id),
]);

export const itensOrcamento = mysqlTable("itens_orcamento", {
	id: serial().notNull(),
	orcamentoId: bigint("orcamento_id", { mode: "number", unsigned: true }).notNull().references(() => orcamentos.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	tipoItem: varchar("tipo_item", { length: 20 }).notNull(),
	servicoId: int("servico_id"),
	pecaId: int("peca_id"),
	descricao: text("descricao").notNull(),
	quantidade: decimal({ precision: 8, scale: 2 }).default('1.00'),
	precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
	percentualDesconto: decimal("percentual_desconto", { precision: 5, scale: 2 }).default('0.00'),
	valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default('0.00'),
	percentualImposto: decimal("percentual_imposto", { precision: 5, scale: 2 }).default('23.00'),
	valorImposto: decimal("valor_imposto", { precision: 10, scale: 2 }).default('0.00'),
	valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "itens_orcamento_id"}),
	unique("id").on(table.id),
]);

export const itensOrdemTrabalho = mysqlTable("itens_ordem_trabalho", {
	id: serial().notNull(),
	ordemTrabalhoId: bigint("ordem_trabalho_id", { mode: "number", unsigned: true }).references(() => ordensTrabalho.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	tipoItem: varchar("tipo_item", { length: 20 }).notNull(),
	servicoId: int("servico_id"),
	pecaId: int("peca_id"),
	descricao: text("descricao").notNull(),
	quantidade: decimal({ precision: 8, scale: 2 }).default('1.00'),
	precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }).notNull(),
	horasTrabalho: decimal("horas_trabalho", { precision: 6, scale: 2 }),
	tarifaHoraria: decimal("tarifa_horaria", { precision: 8, scale: 2 }),
	percentualDesconto: decimal("percentual_desconto", { precision: 5, scale: 2 }).default('0.00'),
	valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }).default('0.00'),
	percentualImposto: decimal("percentual_imposto", { precision: 5, scale: 2 }).default('23.00'),
	valorImposto: decimal("valor_imposto", { precision: 10, scale: 2 }).default('0.00'),
	valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	aguardaPeca: tinyint("aguarda_peca").default(0),
},
(table) => [
	primaryKey({ columns: [table.id], name: "itens_ordem_trabalho_id"}),
	unique("id").on(table.id),
]);

export const keystart = mysqlTable("keystart", {
	id: int().autoincrement().notNull(),
	chave: varchar({ length: 255 }).notNull(),
	ativo: tinyint().default(1).notNull(),
	atualizadoEm: datetime("atualizado_em", { mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`),
},
(table) => [
	primaryKey({ columns: [table.id], name: "keystart_id"}),
]);

export const logAuditoria = mysqlTable("log_auditoria", {
	id: serial().notNull(),
	utilizadorId: int("utilizador_id"),
	acao: varchar({ length: 100 }).notNull(),
	nomeTabela: varchar("nome_tabela", { length: 50 }),
	idRegisto: int("id_registo"),
	valoresAntigos: json("valores_antigos"),
	valoresNovos: json("valores_novos"),
	enderecoIp: varchar("endereco_ip", { length: 100 }),
	agenteUtilizador: text("agente_utilizador"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "log_auditoria_id"}),
	unique("id").on(table.id),
]);

export const marcas = mysqlTable("marcas", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	paisOrigem: varchar("pais_origem", { length: 50 }),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "marcas_id"}),
	unique("nome_marca").on(table.nome),
]);

export const mecanicos = mysqlTable("mecanicos", {
	id: int().autoincrement().notNull(),
	utilizadorId: int("utilizador_id"),
	nome: varchar({ length: 100 }).notNull(),
	especialidade: varchar({ length: 100 }),
	telefone: varchar({ length: 20 }),
	email: varchar({ length: 255 }),
	tarifaHoraria: decimal("tarifa_horaria", { precision: 8, scale: 2 }),
	ativo: tinyint().default(1),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataContratacao: date("data_contratacao", { mode: 'string' }),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "mecanicos_id"}),
]);

export const modelos = mysqlTable("modelos", {
	id: int().autoincrement().notNull(),
	marcaId: int("marca_id").notNull().references(() => marcas.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	nome: varchar({ length: 100 }).notNull(),
	tipoVeiculo: varchar("tipo_veiculo", { length: 50 }),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "modelos_id"}),
]);

export const orcamentos = mysqlTable("orcamentos", {
	id: serial().notNull(),
	refOrcamento: varchar("ref_orcamento", { length: 20 }).notNull(),
	clienteId: int("cliente_id").notNull().references(() => clientes.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	veiculoId: bigint("veiculo_id", { mode: "number", unsigned: true }).notNull().references(() => veiculos.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	preparadoPor: int("preparado_por"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataEmissao: date("data_emissao", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataExpiracao: date("data_expiracao", { mode: 'string' }),
	estado: varchar({ length: 20 }).default('pendente'),
	totalPecas: decimal("total_pecas", { precision: 10, scale: 2 }).default('0.00'),
	totalMaoObra: decimal("total_mao_obra", { precision: 10, scale: 2 }).default('0.00'),
	totalDesconto: decimal("total_desconto", { precision: 10, scale: 2 }).default('0.00'),
	totalImposto: decimal("total_imposto", { precision: 10, scale: 2 }).default('0.00'),
	totalGeral: decimal("total_geral", { precision: 10, scale: 2 }).notNull(),
	notas: text("notas"),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataAprovacao: date("data_aprovacao", { mode: 'string' }),
	aprovadoPor: int("aprovado_por"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	kms: int(),
	contactoNome: varchar("contacto_nome", { length: 100 }),
	contactoTelefone: varchar("contacto_telefone", { length: 20 }),
	contactoEmail: varchar("contacto_email", { length: 255 }),
},
(table) => [
	primaryKey({ columns: [table.id], name: "orcamentos_id"}),
	unique("id").on(table.id),
	unique("numero_orcamento").on(table.refOrcamento),
]);

export const ordensTrabalho = mysqlTable("ordens_trabalho", {
	id: serial().notNull(),
	refOrdemTrabalho: varchar("ref_ordem_trabalho", { length: 20 }).notNull(),
	clienteId: int("cliente_id").notNull().references(() => clientes.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	veiculoId: bigint("veiculo_id", { mode: "number", unsigned: true }).notNull().references(() => veiculos.id, { onDelete: "restrict", onUpdate: "cascade" } ),
	mecanicoId: int("mecanico_id").references(() => mecanicos.id, { onDelete: "set null", onUpdate: "cascade" } ),
	orcamentoId: bigint("orcamento_id", { mode: "number", unsigned: true }).references(() => orcamentos.id, { onDelete: "set null", onUpdate: "cascade" } ),
	agendamentoId: bigint("agendamento_id", { mode: "number", unsigned: true }).references(() => agendamentos.id, { onDelete: "set null", onUpdate: "cascade" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataInicio: date("data_inicio", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataConclusao: date("data_conclusao", { mode: 'string' }),
	estado: varchar({ length: 20 }).default('em_andamento'),
	quilometragemServico: int("quilometragem_servico"),
	descricaoProblema: text("descricao_problema"),
	trabalhoRealizado: text("trabalho_realizado"),
	recomendacoes: text("recomendacoes"),
	totalPecas: decimal("total_pecas", { precision: 10, scale: 2 }).default('0.00'),
	totalMaoObra: decimal("total_mao_obra", { precision: 10, scale: 2 }).default('0.00'),
	totalDesconto: decimal("total_desconto", { precision: 10, scale: 2 }).default('0.00'),
	totalImposto: decimal("total_imposto", { precision: 10, scale: 2 }).default('0.00'),
	totalGeral: decimal("total_geral", { precision: 10, scale: 2 }).notNull(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
	atualizadoPor: int("atualizado_por"),
	prioridade: varchar({ length: 20 }).default('normal'),
	contactoNome: varchar("contacto_nome", { length: 100 }),
	contactoTelefone: varchar("contacto_telefone", { length: 20 }),
	contactoEmail: varchar("contacto_email", { length: 255 }),
	kms: int(),
	faturaId: bigint("fatura_id", { mode: "number" }),
},
(table) => [
	index("ordens_trabalho_cliente_id_idx").on(table.clienteId),
	index("ordens_trabalho_mecanico_id_idx").on(table.mecanicoId),
	index("ordens_trabalho_orcamento_id_idx").on(table.orcamentoId),
	index("ordens_trabalho_veiculo_id_idx").on(table.veiculoId),
	index("ordens_trabalho_agendamento_id_idx").on(table.agendamentoId),
	primaryKey({ columns: [table.id], name: "ordens_trabalho_id"}),
	unique("id").on(table.id),
	unique("numero_ordem_trabalho").on(table.refOrdemTrabalho),
]);

export const pecas = mysqlTable("pecas", {
	id: serial().notNull(),
	referencia: varchar({ length: 50 }).notNull(),
	nome: varchar({ length: 255 }).notNull(),
	descricao: text("descricao"),
	fornecedorId: int("fornecedor_id"),
	custoUnitario: decimal("custo_unitario", { precision: 10, scale: 2 }).notNull(),
	precoVenda: decimal("preco_venda", { precision: 10, scale: 2 }).notNull(),
	quantidadeStock: int("quantidade_stock").default(0),
	nivelStockMinimo: int("nivel_stock_minimo").default(0),
	nivelStockMaximo: int("nivel_stock_maximo"),
	localizacao: varchar({ length: 100 }),
	veiculosCompativeis: text("veiculos_compativeis"),
	ativo: tinyint().default(1),
	notas: text("notas"),
	margemLucro: decimal("margem_lucro", { precision: 5, scale: 2 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
	categoriaId: bigint("categoria_id", { mode: "number", unsigned: true }).notNull().references(() => categoriasPeca.id, { onDelete: "restrict", onUpdate: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.id], name: "pecas_id"}),
	unique("id").on(table.id),
	unique("referencia").on(table.referencia),
]);

export const perfisClientes = mysqlTable("perfis_clientes", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 50 }).notNull(),
	descricao: text("descricao"),
	perclucro: decimal({ precision: 5, scale: 2 }).default('0.00').notNull(),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "perfis_clientes_id"}),
	unique("nome_perfil").on(table.nome),
]);

export const servicos = mysqlTable("servicos", {
	id: serial().notNull(),
	categoriaId: int("categoria_id"),
	nome: varchar({ length: 255 }).notNull(),
	descricao: text("descricao"),
	precoBase: decimal("preco_base", { precision: 10, scale: 2 }),
	duracaoEstimada: varchar("duracao_estimada", { length: 8 }),
	requerPecas: tinyint("requer_pecas").default(0),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "servicos_id"}),
	unique("id").on(table.id),
]);

export const transacoesPecas = mysqlTable("transacoes_pecas", {
	id: serial().notNull(),
	pecaId: int("peca_id").notNull(),
	tipoTransacao: varchar("tipo_transacao", { length: 20 }).notNull(),
	quantidade: int().notNull(),
	custoUnitario: decimal("custo_unitario", { precision: 10, scale: 2 }),
	custoTotal: decimal("custo_total", { precision: 10, scale: 2 }),
	documentoReferencia: varchar("documento_referencia", { length: 50 }),
	fornecedorId: int("fornecedor_id"),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	criadoPor: int("criado_por"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "transacoes_pecas_id"}),
	unique("id").on(table.id),
]);

export const utilizadores = mysqlTable("utilizadores", {
	id: int().autoincrement().notNull(),
	nomeUtilizador: varchar("nome_utilizador", { length: 50 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	hashPalavraPasse: varchar("hash_palavra_passe", { length: 255 }).notNull(),
	nomeCompleto: varchar("nome_completo", { length: 100 }).notNull(),
	papel: mysqlEnum(['admin','gestor','mecanico','rececionista']).notNull(),
	ativo: tinyint().default(1),
	ultimoLogin: timestamp("ultimo_login", { mode: 'string' }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "utilizadores_id"}),
	unique("nome_utilizador").on(table.nomeUtilizador),
	unique("email").on(table.email),
]);

export const veiculos = mysqlTable("veiculos", {
	id: serial().notNull(),
	clienteId: int("cliente_id").references(() => clientes.id, { onDelete: "set null", onUpdate: "cascade" } ),
	marca: varchar({ length: 50 }).notNull(),
	modelo: varchar({ length: 50 }).notNull(),
	matricula: varchar({ length: 20 }).notNull(),
	ano: int(),
	numeroChassis: varchar("numero_chassis", { length: 17 }),
	tipoMotor: varchar("tipo_motor", { length: 50 }),
	tipoCombustivel: varchar("tipo_combustivel", { length: 20 }),
	estado: varchar({ length: 20 }).default('disponivel'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	ultimaIntervencao: date("ultima_intervencao", { mode: 'string' }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	proximaRevisao: date("proxima_revisao", { mode: 'string' }),
	companhiaSeguros: varchar("companhia_seguros", { length: 100 }),
	apoliceSeguro: varchar("apolice_seguro", { length: 50 }),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	validadeSeguro: date("validade_seguro", { mode: 'string' }),
	notas: text("notas"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "veiculos_id"}),
	unique("id").on(table.id),
	unique("matricula").on(table.matricula),
	unique("numero_chassis").on(table.numeroChassis),
]);

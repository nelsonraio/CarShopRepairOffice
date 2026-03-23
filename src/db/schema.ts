export * from '../../drizzle/migrations/schema';
export const fornecedores = mysqlTable("fornecedores", {
	id: int("id").autoincrement().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	nif: varchar({ length: 20 }),
	email: varchar({ length: 255 }),
	telefone: varchar({ length: 20 }),
	endereco: text(),
	notas: text(),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "fornecedores_id" })
	]
);

export const pecas = mysqlTable("pecas", {
	id: int("id").autoincrement().notNull(),
	nome: varchar({ length: 255 }).notNull(),
	referencia: varchar({ length: 100 }).notNull(),
	categoria_id: int("categoria_id"),
	quantidade_stock: int("quantidade_stock").default(0),
	nivel_stock_minimo: int("nivel_stock_minimo").default(0),
	preco_venda: decimal("preco_venda", { precision: 10, scale: 2 }).default("0.00"),
	custo_unitario: decimal("custo_unitario", { precision: 10, scale: 2 }).default("0.00"),
	descricao: text(),
	ativo: tinyint().default(1),
	fornecedor_id: int("fornecedor_id"),
	margem_lucro: decimal("margem_lucro", { precision: 5, scale: 2 }),
	veiculos_compativeis: text(),
	notas: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "pecas_id" }),
		unique("referencia_peca").on(table.referencia)
	]
);
export const veiculos = mysqlTable("veiculos", {
	id: int().autoincrement().notNull(),
	clienteId: int("cliente_id"),
	marca: varchar({ length: 150 }),
	modelo: varchar({ length: 150 }),
	matricula: varchar({ length: 50 }),
	ano: int(),
	estado: varchar({ length: 20 }),
	ultimaIntervencao: date("ultima_intervencao", { mode: 'string' }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "veiculos_id" })
	]
);

export const ordens_trabalho = mysqlTable("ordens_trabalho", {
	id: int().autoincrement().notNull(),
	clienteId: int("cliente_id"),
	veiculoId: int("veiculo_id"),
	mecanicoId: int("mecanico_id"),
	descricaoProblema: text(),
	trabalhoRealizado: text(),
	totalGeral: decimal("total_geral", { precision: 10, scale: 2 }),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "ordens_trabalho_id" })
	]
);
export const perfisClientes = mysqlTable("perfis_clientes", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 50 }).notNull(),
	descricao: text(),
	perclucro: decimal({ precision: 5, scale: 2 }).default("0.00"),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "perfis_clientes_id" }),
		unique("nome_perfil").on(table.nome),
	]
);
import { mysqlTable, mysqlSchema, primaryKey, unique, serial, int, date, decimal, varchar, text, timestamp, datetime, foreignKey, time, index, bigint, json, mysqlEnum, tinyint } from "drizzle-orm/mysql-core"
import type { AnyMySqlColumn } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const itensOrdemTrabalho = mysqlTable("itens_ordem_trabalho", {
	id: serial().notNull(),
	ordemTrabalhoId: int("ordem_trabalho_id").notNull(),
	tipoItem: varchar("tipo_item", { length: 20 }).notNull(), // 'peca' ou 'servico'
	servicoId: int("servico_id"),
	pecaId: int("peca_id"),
	descricao: varchar("descricao", { length: 255 }),
	quantidade: decimal("quantidade", { precision: 8, scale: 2 }),
	precoUnitario: decimal("preco_unitario", { precision: 10, scale: 2 }),
	valorDesconto: decimal("valor_desconto", { precision: 10, scale: 2 }),
	valorImposto: decimal("valor_imposto", { precision: 10, scale: 2 }),
	valorTotal: decimal("valor_total", { precision: 10, scale: 2 }),
	notas: text(),
	aguardaPeca: tinyint("aguarda_peca").default(0),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
	(table) => [
		primaryKey({ columns: [table.id], name: "itens_ordem_trabalho_id" }),
		unique("id").on(table.id),
	]
);

export const pagamentos = mysqlTable("__pagamentos", {
	id: serial().notNull(),
	faturaId: int("fatura_id").notNull(),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	dataPagamento: date("data_pagamento", { mode: 'string' }),
	valor: decimal({ precision: 10, scale: 2 }).notNull(),
	metodoPagamento: varchar("metodo_pagamento", { length: 50 }).notNull(),
	referencia: varchar({ length: 100 }),
	notas: text(),
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
	notas: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "__pecas_ordem_trabalho_id"}),
	unique("id").on(table.id),
]);

export const servicos = mysqlTable("servicos", {
	id: serial().notNull(),
	categoriaId: int("categoria_id"),
	nome: varchar({ length: 255 }).notNull(),
	descricao: text(),
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

export const agendamentos = mysqlTable("agendamentos", {
	id: serial().notNull(),
	clienteId: int("cliente_id"),
	mecanicoId: int("mecanico_id"),
	matricula: varchar({ length: 50 }),
	titulo: varchar({ length: 255 }).notNull(),
	descricao: text(),
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

export const clientes = mysqlTable("clientes", {
	id: int().autoincrement().notNull(),
	nome: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 255 }),
	telefone: varchar({ length: 20 }).notNull(),
	nif: varchar({ length: 20 }),
	endereco: text(),
	dataRegisto: date("data_registo", { mode: 'string' }),
	totalGasto: decimal("total_gasto", { precision: 10, scale: 2 }),
	visitas: int(),
	notas: text(),
	ativo: tinyint().default(1),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	perfilId: int("perfil_id"),
},
(table) => [
	primaryKey({ columns: [table.id], name: "clientes_id"}),
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
	dataContratacao: date("data_contratacao", { mode: 'string' }),
	notas: text(),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "mecanicos_id"}),
]);

export const orcamentos = mysqlTable("orcamentos", {
	id: int("id").autoincrement().notNull(),
	ref_orcamento: varchar({ length: 20 }).notNull(),
	clienteId: int("cliente_id").notNull(),
	veiculoId: int("veiculo_id").notNull(),
	preparadoPor: int("preparado_por"),
	dataEmissao: date("data_emissao", { mode: 'string' }),
	dataExpiracao: date("data_expiracao", { mode: 'string' }),
	estado: varchar({ length: 20 }).default('pendente'),
	totalPecas: decimal("total_pecas", { precision: 10, scale: 2 }).default('0.00'),
	totalMaoObra: decimal("total_mao_obra", { precision: 10, scale: 2 }).default('0.00'),
	totalDesconto: decimal("total_desconto", { precision: 10, scale: 2 }).default('0.00'),
	totalImposto: decimal("total_imposto", { precision: 10, scale: 2 }).default('0.00'),
	totalGeral: decimal("total_geral", { precision: 10, scale: 2 }).notNull(),
	notas: text(),
	dataAprovacao: date("data_aprovacao", { mode: 'string' }),
	aprovadoPor: int("aprovado_por"),
	criadoEm: timestamp("criado_em", { mode: 'string' }).defaultNow(),
	atualizadoEm: timestamp("atualizado_em", { mode: 'string' }).defaultNow(),
	kms: int("kms"),
	contactoNome: varchar("contacto_nome", { length: 100 }),
	contactoTelefone: varchar("contacto_telefone", { length: 20 }),
	contactoEmail: varchar("contacto_email", { length: 255 })
},
(table) => [
	primaryKey({ columns: [table.id], name: "orcamentos_id" }),
	unique("id").on(table.id),
	unique("numero_orcamento").on(table.ref_orcamento),
]);

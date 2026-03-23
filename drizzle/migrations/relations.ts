import { relations } from "drizzle-orm/relations";
import { clientes, agendamentos, perfisClientes, fornecedores, encomendasPecas, itensEncomendaPeca, pecas, orcamentos, itensOrcamento, ordensTrabalho, itensOrdemTrabalho, marcas, modelos, veiculos, mecanicos, categoriasPeca } from "./schema";

export const agendamentosRelations = relations(agendamentos, ({one, many}) => ({
	cliente: one(clientes, {
		fields: [agendamentos.clienteId],
		references: [clientes.id]
	}),
	ordensTrabalhos: many(ordensTrabalho),
}));

export const clientesRelations = relations(clientes, ({one, many}) => ({
	agendamentos: many(agendamentos),
	perfisCliente: one(perfisClientes, {
		fields: [clientes.perfilId],
		references: [perfisClientes.id]
	}),
	orcamentos: many(orcamentos),
	ordensTrabalhos: many(ordensTrabalho),
	veiculos: many(veiculos),
}));

export const perfisClientesRelations = relations(perfisClientes, ({many}) => ({
	clientes: many(clientes),
}));

export const encomendasPecasRelations = relations(encomendasPecas, ({one, many}) => ({
	fornecedore: one(fornecedores, {
		fields: [encomendasPecas.fornecedorId],
		references: [fornecedores.id]
	}),
	itensEncomendaPecas: many(itensEncomendaPeca),
}));

export const fornecedoresRelations = relations(fornecedores, ({many}) => ({
	encomendasPecas: many(encomendasPecas),
}));

export const itensEncomendaPecaRelations = relations(itensEncomendaPeca, ({one}) => ({
	encomendasPeca: one(encomendasPecas, {
		fields: [itensEncomendaPeca.encomendaId],
		references: [encomendasPecas.id]
	}),
	peca: one(pecas, {
		fields: [itensEncomendaPeca.pecaId],
		references: [pecas.id]
	}),
}));

export const pecasRelations = relations(pecas, ({one, many}) => ({
	itensEncomendaPecas: many(itensEncomendaPeca),
	categoriasPeca: one(categoriasPeca, {
		fields: [pecas.categoriaId],
		references: [categoriasPeca.id]
	}),
}));

export const itensOrcamentoRelations = relations(itensOrcamento, ({one}) => ({
	orcamento: one(orcamentos, {
		fields: [itensOrcamento.orcamentoId],
		references: [orcamentos.id]
	}),
}));

export const orcamentosRelations = relations(orcamentos, ({one, many}) => ({
	itensOrcamentos: many(itensOrcamento),
	cliente: one(clientes, {
		fields: [orcamentos.clienteId],
		references: [clientes.id]
	}),
	veiculo: one(veiculos, {
		fields: [orcamentos.veiculoId],
		references: [veiculos.id]
	}),
	ordensTrabalhos: many(ordensTrabalho),
}));

export const itensOrdemTrabalhoRelations = relations(itensOrdemTrabalho, ({one}) => ({
	ordensTrabalho: one(ordensTrabalho, {
		fields: [itensOrdemTrabalho.ordemTrabalhoId],
		references: [ordensTrabalho.id]
	}),
}));

export const ordensTrabalhoRelations = relations(ordensTrabalho, ({one, many}) => ({
	itensOrdemTrabalhos: many(itensOrdemTrabalho),
	agendamento: one(agendamentos, {
		fields: [ordensTrabalho.agendamentoId],
		references: [agendamentos.id]
	}),
	cliente: one(clientes, {
		fields: [ordensTrabalho.clienteId],
		references: [clientes.id]
	}),
	mecanico: one(mecanicos, {
		fields: [ordensTrabalho.mecanicoId],
		references: [mecanicos.id]
	}),
	orcamento: one(orcamentos, {
		fields: [ordensTrabalho.orcamentoId],
		references: [orcamentos.id]
	}),
	veiculo: one(veiculos, {
		fields: [ordensTrabalho.veiculoId],
		references: [veiculos.id]
	}),
}));

export const modelosRelations = relations(modelos, ({one}) => ({
	marca: one(marcas, {
		fields: [modelos.marcaId],
		references: [marcas.id]
	}),
}));

export const marcasRelations = relations(marcas, ({many}) => ({
	modelos: many(modelos),
}));

export const veiculosRelations = relations(veiculos, ({one, many}) => ({
	orcamentos: many(orcamentos),
	ordensTrabalhos: many(ordensTrabalho),
	cliente: one(clientes, {
		fields: [veiculos.clienteId],
		references: [clientes.id]
	}),
}));

export const mecanicosRelations = relations(mecanicos, ({many}) => ({
	ordensTrabalhos: many(ordensTrabalho),
}));

export const categoriasPecaRelations = relations(categoriasPeca, ({many}) => ({
	pecas: many(pecas),
}));
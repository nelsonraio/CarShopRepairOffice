-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `__pagamentos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`fatura_id` int NOT NULL,
	`data_pagamento` date,
	`valor` decimal(10,2) NOT NULL,
	`metodo_pagamento` varchar(50) NOT NULL,
	`referencia` varchar(100),
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	CONSTRAINT `__pagamentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `__pecas_ordem_trabalho` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ordem_trabalho_id` int NOT NULL,
	`peca_id` int NOT NULL,
	`quantidade_utilizada` decimal(8,2) NOT NULL,
	`custo_unitario` decimal(10,2) NOT NULL,
	`custo_total` decimal(10,2) NOT NULL,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `__pecas_ordem_trabalho_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `_prisma_migrations` (
	`id` varchar(36) NOT NULL,
	`checksum` varchar(64) NOT NULL,
	`finished_at` datetime(3),
	`migration_name` varchar(255) NOT NULL,
	`logs` text,
	`rolled_back_at` datetime(3),
	`started_at` datetime(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
	`applied_steps_count` int unsigned NOT NULL DEFAULT 0,
	CONSTRAINT `_prisma_migrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agendamentos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`cliente_id` int,
	`mecanico_id` int,
	`matricula` varchar(50),
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`data_agendamento` date NOT NULL,
	`hora_inicio` time NOT NULL,
	`estado` varchar(20) DEFAULT 'agendado',
	`prioridade` varchar(10) DEFAULT 'normal',
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`marca` varchar(150),
	`modelo` varchar(150),
	`ano` int,
	`contacto_nome` varchar(100),
	`contacto_telefone` varchar(20),
	`contacto_email` varchar(255),
	`criado_por` varchar(50),
	`atualizado_por` varchar(50),
	CONSTRAINT `agendamentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `alertas_sistema` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`tipo` varchar(50) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`severidade` varchar(20) DEFAULT 'normal',
	`referencia_id` bigint unsigned,
	`referencia_tipo` varchar(50),
	`lido` tinyint(1) DEFAULT 0,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`lido_em` timestamp,
	CONSTRAINT `alertas_sistema_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `cartoes_kanban` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`coluna_id` int NOT NULL,
	`ordem_trabalho_id` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`prioridade` varchar(10) DEFAULT 'normal',
	`atribuido_a` int,
	`data_limite` date,
	`etiquetas` text,
	`posicao` int NOT NULL,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	`atualizado_por` int,
	CONSTRAINT `cartoes_kanban_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `categorias_peca` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `categorias_peca_id` PRIMARY KEY(`id`),
	CONSTRAINT `categorias_peca_id` UNIQUE(`id`),
	CONSTRAINT `categorias_peca_nome` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `categorias_servico` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`duracao_estimada` time,
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `categorias_servico_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`email` varchar(255),
	`telefone` varchar(20) NOT NULL,
	`nif` varchar(20),
	`endereco` text,
	`data_registo` date DEFAULT (curdate()),
	`total_gasto` decimal(10,2) DEFAULT '0.00',
	`visitas` int DEFAULT 0,
	`notas` text,
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`perfil_id` int,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `colunas_kanban` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`posicao` int NOT NULL,
	`cor` varchar(7),
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `colunas_kanban_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes_sistema` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chave_configuracao` varchar(100) NOT NULL,
	`valor_configuracao` text,
	`tipo_configuracao` varchar(20) DEFAULT 'string',
	`descricao` text,
	`sistema` tinyint(1) DEFAULT 0,
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_por` int,
	CONSTRAINT `configuracoes_sistema_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `chave_configuracao` UNIQUE(`chave_configuracao`)
);
--> statement-breakpoint
CREATE TABLE `encomendas_pecas` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`numero_encomenda` varchar(20) NOT NULL,
	`fornecedor_id` int NOT NULL,
	`data_encomenda` date NOT NULL,
	`data_entrega_estimada` date,
	`data_entrega_real` date,
	`estado` varchar(20) DEFAULT 'pendente',
	`custo_total` decimal(10,2),
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	CONSTRAINT `encomendas_pecas_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `numero_encomenda` UNIQUE(`numero_encomenda`)
);
--> statement-breakpoint
CREATE TABLE `faturas` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`numero_fatura` varchar(20) NOT NULL,
	`cliente_id` int NOT NULL,
	`ordem_trabalho_id` int,
	`data_emissao` date,
	`data_vencimento` date,
	`data_pagamento` date,
	`estado` varchar(20) DEFAULT 'pendente',
	`subtotal` decimal(10,2) NOT NULL,
	`valor_imposto` decimal(10,2) DEFAULT '0.00',
	`valor_desconto` decimal(10,2) DEFAULT '0.00',
	`valor_total` decimal(10,2) NOT NULL,
	`valor_pago` decimal(10,2) DEFAULT '0.00',
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	`recibo_toconline_id` varchar(50),
	`toconline_customer_id` varchar(50),
	`toconline_id` varchar(50),
	CONSTRAINT `faturas_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `numero_fatura` UNIQUE(`numero_fatura`)
);
--> statement-breakpoint
CREATE TABLE `fornecedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`pessoa_contato` varchar(100),
	`email` varchar(255),
	`telefone` varchar(20),
	`endereco` text,
	`nif` varchar(20),
	`termos_pagamento` varchar(50),
	`ativo` tinyint(1) DEFAULT 1,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	CONSTRAINT `fornecedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_cartao_kanban` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`cartao_id` int NOT NULL,
	`coluna_origem_id` int,
	`coluna_destino_id` int NOT NULL,
	`movido_por` int,
	`movido_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`notas` text,
	CONSTRAINT `historico_cartao_kanban_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_encomenda_peca` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`encomenda_id` bigint unsigned NOT NULL,
	`peca_id` bigint unsigned NOT NULL,
	`quantidade_encomendada` int NOT NULL,
	`quantidade_recebida` int DEFAULT 0,
	`preco_unitario` decimal(10,2),
	`preco_total` decimal(10,2),
	`estado` varchar(20) DEFAULT 'pendente',
	`ordem_trabalho_item_id` bigint unsigned,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `itens_encomenda_peca_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_fatura` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`fatura_id` int NOT NULL,
	`item_ordem_trabalho_id` int,
	`descricao` text NOT NULL,
	`quantidade` decimal(8,2) DEFAULT '1.00',
	`preco_unitario` decimal(10,2) NOT NULL,
	`valor_desconto` decimal(10,2) DEFAULT '0.00',
	`valor_imposto` decimal(10,2) DEFAULT '0.00',
	`valor_total` decimal(10,2) NOT NULL,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `itens_fatura_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_orcamento` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`orcamento_id` bigint unsigned NOT NULL,
	`tipo_item` varchar(20) NOT NULL,
	`servico_id` int,
	`peca_id` int,
	`descricao` text NOT NULL,
	`quantidade` decimal(8,2) DEFAULT '1.00',
	`preco_unitario` decimal(10,2) NOT NULL,
	`percentual_desconto` decimal(5,2) DEFAULT '0.00',
	`valor_desconto` decimal(10,2) DEFAULT '0.00',
	`percentual_imposto` decimal(5,2) DEFAULT '23.00',
	`valor_imposto` decimal(10,2) DEFAULT '0.00',
	`valor_total` decimal(10,2) NOT NULL,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `itens_orcamento_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_ordem_trabalho` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ordem_trabalho_id` bigint unsigned,
	`tipo_item` varchar(20) NOT NULL,
	`servico_id` int,
	`peca_id` int,
	`descricao` text NOT NULL,
	`quantidade` decimal(8,2) DEFAULT '1.00',
	`preco_unitario` decimal(10,2) NOT NULL,
	`horas_trabalho` decimal(6,2),
	`tarifa_horaria` decimal(8,2),
	`percentual_desconto` decimal(5,2) DEFAULT '0.00',
	`valor_desconto` decimal(10,2) DEFAULT '0.00',
	`percentual_imposto` decimal(5,2) DEFAULT '23.00',
	`valor_imposto` decimal(10,2) DEFAULT '0.00',
	`valor_total` decimal(10,2) NOT NULL,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`aguarda_peca` tinyint(1) DEFAULT 0,
	CONSTRAINT `itens_ordem_trabalho_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `keystart` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chave` varchar(255) NOT NULL,
	`ativo` tinyint(1) NOT NULL DEFAULT 1,
	`atualizado_em` datetime DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `keystart_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `log_auditoria` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`utilizador_id` int,
	`acao` varchar(100) NOT NULL,
	`nome_tabela` varchar(50),
	`id_registo` int,
	`valores_antigos` json,
	`valores_novos` json,
	`endereco_ip` varchar(100),
	`agente_utilizador` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `log_auditoria_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `marcas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`pais_origem` varchar(50),
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `marcas_id` PRIMARY KEY(`id`),
	CONSTRAINT `nome_marca` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `mecanicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`utilizador_id` int,
	`nome` varchar(100) NOT NULL,
	`especialidade` varchar(100),
	`telefone` varchar(20),
	`email` varchar(255),
	`tarifa_horaria` decimal(8,2),
	`ativo` tinyint(1) DEFAULT 1,
	`data_contratacao` date,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `mecanicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `modelos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`marca_id` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`tipo_veiculo` varchar(50),
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `modelos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orcamentos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ref_orcamento` varchar(20) NOT NULL,
	`cliente_id` int NOT NULL,
	`veiculo_id` bigint unsigned NOT NULL,
	`preparado_por` int,
	`data_emissao` date,
	`data_expiracao` date,
	`estado` varchar(20) DEFAULT 'pendente',
	`total_pecas` decimal(10,2) DEFAULT '0.00',
	`total_mao_obra` decimal(10,2) DEFAULT '0.00',
	`total_desconto` decimal(10,2) DEFAULT '0.00',
	`total_imposto` decimal(10,2) DEFAULT '0.00',
	`total_geral` decimal(10,2) NOT NULL,
	`notas` text,
	`data_aprovacao` date,
	`aprovado_por` int,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`kms` int,
	`contacto_nome` varchar(100),
	`contacto_telefone` varchar(20),
	`contacto_email` varchar(255),
	CONSTRAINT `orcamentos_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `numero_orcamento` UNIQUE(`ref_orcamento`)
);
--> statement-breakpoint
CREATE TABLE `ordens_trabalho` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`ref_ordem_trabalho` varchar(20) NOT NULL,
	`cliente_id` int NOT NULL,
	`veiculo_id` bigint unsigned NOT NULL,
	`mecanico_id` int,
	`orcamento_id` bigint unsigned,
	`agendamento_id` bigint unsigned,
	`data_inicio` date,
	`data_conclusao` date,
	`estado` varchar(20) DEFAULT 'em_andamento',
	`quilometragem_servico` int,
	`descricao_problema` text,
	`trabalho_realizado` text,
	`recomendacoes` text,
	`total_pecas` decimal(10,2) DEFAULT '0.00',
	`total_mao_obra` decimal(10,2) DEFAULT '0.00',
	`total_desconto` decimal(10,2) DEFAULT '0.00',
	`total_imposto` decimal(10,2) DEFAULT '0.00',
	`total_geral` decimal(10,2) NOT NULL,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	`atualizado_por` int,
	`prioridade` varchar(20) DEFAULT 'normal',
	`contacto_nome` varchar(100),
	`contacto_telefone` varchar(20),
	`contacto_email` varchar(255),
	`kms` int,
	`fatura_id` bigint,
	CONSTRAINT `ordens_trabalho_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `numero_ordem_trabalho` UNIQUE(`ref_ordem_trabalho`)
);
--> statement-breakpoint
CREATE TABLE `pecas` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`referencia` varchar(50) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`fornecedor_id` int,
	`custo_unitario` decimal(10,2) NOT NULL,
	`preco_venda` decimal(10,2) NOT NULL,
	`quantidade_stock` int DEFAULT 0,
	`nivel_stock_minimo` int DEFAULT 0,
	`nivel_stock_maximo` int,
	`localizacao` varchar(100),
	`veiculos_compativeis` text,
	`ativo` tinyint(1) DEFAULT 1,
	`notas` text,
	`margem_lucro` decimal(5,2),
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	`categoria_id` bigint unsigned NOT NULL,
	CONSTRAINT `pecas_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `referencia` UNIQUE(`referencia`)
);
--> statement-breakpoint
CREATE TABLE `perfis_clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(50) NOT NULL,
	`descricao` text,
	`perclucro` decimal(5,2) NOT NULL DEFAULT '0.00',
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `perfis_clientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `nome_perfil` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `servicos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`categoria_id` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`preco_base` decimal(10,2),
	`duracao_estimada` varchar(8),
	`requer_pecas` tinyint(1) DEFAULT 0,
	`ativo` tinyint(1) DEFAULT 1,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `servicos_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `transacoes_pecas` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`peca_id` int NOT NULL,
	`tipo_transacao` varchar(20) NOT NULL,
	`quantidade` int NOT NULL,
	`custo_unitario` decimal(10,2),
	`custo_total` decimal(10,2),
	`documento_referencia` varchar(50),
	`fornecedor_id` int,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`criado_por` int,
	CONSTRAINT `transacoes_pecas_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`)
);
--> statement-breakpoint
CREATE TABLE `utilizadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_utilizador` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`hash_palavra_passe` varchar(255) NOT NULL,
	`nome_completo` varchar(100) NOT NULL,
	`papel` enum('admin','gestor','mecanico','rececionista') NOT NULL,
	`ativo` tinyint(1) DEFAULT 1,
	`ultimo_login` timestamp,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `utilizadores_id` PRIMARY KEY(`id`),
	CONSTRAINT `nome_utilizador` UNIQUE(`nome_utilizador`),
	CONSTRAINT `email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `veiculos` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`cliente_id` int,
	`marca` varchar(50) NOT NULL,
	`modelo` varchar(50) NOT NULL,
	`matricula` varchar(20) NOT NULL,
	`ano` int,
	`numero_chassis` varchar(17),
	`tipo_motor` varchar(50),
	`tipo_combustivel` varchar(20),
	`estado` varchar(20) DEFAULT 'disponivel',
	`ultima_intervencao` date,
	`proxima_revisao` date,
	`companhia_seguros` varchar(100),
	`apolice_seguro` varchar(50),
	`validade_seguro` date,
	`notas` text,
	`criado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	`atualizado_em` timestamp DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT `veiculos_id` PRIMARY KEY(`id`),
	CONSTRAINT `id` UNIQUE(`id`),
	CONSTRAINT `matricula` UNIQUE(`matricula`),
	CONSTRAINT `numero_chassis` UNIQUE(`numero_chassis`)
);
--> statement-breakpoint
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis_clientes`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `encomendas_pecas` ADD CONSTRAINT `encomendas_pecas_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_encomenda_peca` ADD CONSTRAINT `itens_encomenda_peca_ibfk_1` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas_pecas`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_encomenda_peca` ADD CONSTRAINT `itens_encomenda_peca_ibfk_2` FOREIGN KEY (`peca_id`) REFERENCES `pecas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_orcamento` ADD CONSTRAINT `itens_orcamento_orcamento_id_fkey` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `itens_ordem_trabalho` ADD CONSTRAINT `itens_ordem_trabalho_ordem_trabalho_id_fkey` FOREIGN KEY (`ordem_trabalho_id`) REFERENCES `ordens_trabalho`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `modelos` ADD CONSTRAINT `modelos_marca_id_fkey` FOREIGN KEY (`marca_id`) REFERENCES `marcas`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_veiculo_id_fkey` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_agendamento_id_fkey` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_mecanico_id_fkey` FOREIGN KEY (`mecanico_id`) REFERENCES `mecanicos`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_orcamento_id_fkey` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_veiculo_id_fkey` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `pecas` ADD CONSTRAINT `pecas_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_peca`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `criado_em` ON `alertas_sistema` (`criado_em`);--> statement-breakpoint
CREATE INDEX `lido` ON `alertas_sistema` (`lido`);--> statement-breakpoint
CREATE INDEX `severidade` ON `alertas_sistema` (`severidade`);--> statement-breakpoint
CREATE INDEX `tipo` ON `alertas_sistema` (`tipo`);--> statement-breakpoint
CREATE INDEX `estado` ON `encomendas_pecas` (`estado`);--> statement-breakpoint
CREATE INDEX `fornecedor_id` ON `encomendas_pecas` (`fornecedor_id`);--> statement-breakpoint
CREATE INDEX `encomenda_id` ON `itens_encomenda_peca` (`encomenda_id`);--> statement-breakpoint
CREATE INDEX `estado` ON `itens_encomenda_peca` (`estado`);--> statement-breakpoint
CREATE INDEX `peca_id` ON `itens_encomenda_peca` (`peca_id`);--> statement-breakpoint
CREATE INDEX `ordens_trabalho_cliente_id_idx` ON `ordens_trabalho` (`cliente_id`);--> statement-breakpoint
CREATE INDEX `ordens_trabalho_mecanico_id_idx` ON `ordens_trabalho` (`mecanico_id`);--> statement-breakpoint
CREATE INDEX `ordens_trabalho_orcamento_id_idx` ON `ordens_trabalho` (`orcamento_id`);--> statement-breakpoint
CREATE INDEX `ordens_trabalho_veiculo_id_idx` ON `ordens_trabalho` (`veiculo_id`);--> statement-breakpoint
CREATE INDEX `ordens_trabalho_agendamento_id_idx` ON `ordens_trabalho` (`agendamento_id`);
*/
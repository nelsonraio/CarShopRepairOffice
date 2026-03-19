-- --------------------------------------------------------
-- Anfitrião:                    127.0.0.1
-- Versão do servidor:           8.4.3 - MySQL Community Server - GPL
-- SO do servidor:               Win64
-- HeidiSQL Versão:              12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- A despejar estrutura para tabela carrepairshopgest.agendamentos
CREATE TABLE IF NOT EXISTS `agendamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int DEFAULT NULL,
  `mecanico_id` int DEFAULT NULL,
  `matricula` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `data_agendamento` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'agendado',
  `prioridade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `marca` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modelo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ano` int DEFAULT NULL,
  `contacto_nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `criado_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `atualizado_por` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `agendamentos_cliente_id_fkey` (`cliente_id`),
  CONSTRAINT `agendamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.agendamentos: ~0 rows (aproximadamente)
DELETE FROM `agendamentos`;

-- A despejar estrutura para tabela carrepairshopgest.alertas_sistema
CREATE TABLE IF NOT EXISTS `alertas_sistema` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `severidade` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `referencia_id` bigint unsigned DEFAULT NULL,
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lido` tinyint(1) DEFAULT '0',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lido_em` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `criado_em` (`criado_em`),
  KEY `lido` (`lido`),
  KEY `severidade` (`severidade`),
  KEY `tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.alertas_sistema: ~0 rows (aproximadamente)
DELETE FROM `alertas_sistema`;

-- A despejar estrutura para tabela carrepairshopgest.cartoes_kanban
CREATE TABLE IF NOT EXISTS `cartoes_kanban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `coluna_id` int NOT NULL,
  `ordem_trabalho_id` int DEFAULT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `prioridade` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `atribuido_a` int DEFAULT NULL,
  `data_limite` date DEFAULT NULL,
  `etiquetas` text COLLATE utf8mb4_unicode_ci,
  `posicao` int NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.cartoes_kanban: ~0 rows (aproximadamente)
DELETE FROM `cartoes_kanban`;

-- A despejar estrutura para tabela carrepairshopgest.categorias_peca
CREATE TABLE IF NOT EXISTS `categorias_peca` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorias_peca_id` (`id`),
  UNIQUE KEY `categorias_peca_nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.categorias_peca: ~18 rows (aproximadamente)
DELETE FROM `categorias_peca`;
INSERT INTO `categorias_peca` (`id`, `nome`, `descricao`, `ativo`, `criado_em`) VALUES
	(1, 'Suspensão', 'Amortecedores, molas, braços, buchas, pivôs, etc.', 1, '2026-03-14 17:27:55'),
	(2, 'Direção', 'Caixa de direção, terminais, braços, etc.', 1, '2026-03-14 17:27:55'),
	(3, 'Transmissão', 'Veio de transmissão, juntas homocinéticas, embraiagens, etc.', 1, '2026-03-14 17:27:55'),
	(4, 'Motor', 'Peças do motor, velas, sensores, etc.', 1, '2026-03-14 17:27:55'),
	(5, 'Travagem', 'Pastilhas, discos, cilindros, óleo de travões.', 1, '2026-03-14 17:27:56'),
	(6, 'Eléctrica', 'Alternadores, baterias, componentes eléctricos.', 1, '2026-03-14 17:27:56'),
	(7, 'Arrefecimento', 'Termóstatos, radiadores, bombas de água, etc.', 1, '2026-03-14 17:27:56'),
	(8, 'Embraiagem', 'Disco, prato de pressão, atuador, rolamento de embraiagem.', 1, '2026-03-14 17:27:56'),
	(9, 'Escape', 'Escapes, catalisadores, silenciadores.', 1, '2026-03-14 17:27:56'),
	(10, 'Filtros', 'Filtros de óleo, ar, combustível, habitáculo, etc.', 1, '2026-03-14 17:27:56'),
	(11, 'Correias', 'Correias de distribuição, acessórios, polias.', 1, '2026-03-14 17:27:56'),
	(12, 'Rolamentos', 'Rolamentos de roda, polias, etc.', 1, '2026-03-14 17:27:56'),
	(13, 'Bomba', 'Bombas de combustível, água, óleo, etc.', 1, '2026-03-14 17:27:56'),
	(14, 'Ignição', 'Velas, cabos, bobinas e componentes de ignição.', 1, '2026-03-14 17:27:56'),
	(15, 'Lubrificantes/Fluidos', 'Óleos, fluidos de travões, direção, transmissão.', 1, '2026-03-14 17:27:56'),
	(16, 'Pneus/Rodas', 'Pneus, jantes, tampões, parafusos.', 1, '2026-03-14 17:27:56'),
	(17, 'Iluminação', 'Lâmpadas, faróis, lanternas, piscas.', 1, '2026-03-14 17:27:56'),
	(18, 'Carroçaria/Acabamento', 'Retrovisores, puxadores, frisos, pára-choques.', 1, '2026-03-14 17:27:56');

-- A despejar estrutura para tabela carrepairshopgest.categorias_servico
CREATE TABLE IF NOT EXISTS `categorias_servico` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `duracao_estimada` time DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.categorias_servico: ~0 rows (aproximadamente)
DELETE FROM `categorias_servico`;

-- A despejar estrutura para tabela carrepairshopgest.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nif` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco` text COLLATE utf8mb4_unicode_ci,
  `data_registo` date DEFAULT (curdate()),
  `total_gasto` decimal(10,2) DEFAULT '0.00',
  `visitas` int DEFAULT '0',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `perfil_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `clientes_perfil_id_fkey` (`perfil_id`),
  CONSTRAINT `clientes_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis_clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.clientes: ~4 rows (aproximadamente)
DELETE FROM `clientes`;
INSERT INTO `clientes` (`id`, `nome`, `email`, `telefone`, `nif`, `endereco`, `data_registo`, `total_gasto`, `visitas`, `notas`, `ativo`, `criado_em`, `atualizado_em`, `perfil_id`) VALUES
	(5, 'Cliente Genérico TVDE Interno', '', '', NULL, '', '2026-03-14', 0.00, 0, NULL, 1, '2026-03-14 17:37:37', '2026-03-14 17:37:37', 2),
	(6, 'Cliente Genérico TVDE Externo', '', '', NULL, '', '2026-03-14', 0.00, 0, NULL, 1, '2026-03-14 17:37:50', '2026-03-14 17:37:50', 3),
	(7, 'Cliente Genérico Particular', NULL, '', NULL, NULL, '2026-03-14', 0.00, 0, NULL, 1, '2026-03-14 17:38:13', '2026-03-14 17:38:13', NULL),
	(8, 'Cliente Genérico Empresa', '', '', '', '', '2026-03-14', 0.00, 0, NULL, 1, '2026-03-14 17:38:32', '2026-03-14 17:38:32', 4);

-- A despejar estrutura para tabela carrepairshopgest.colunas_kanban
CREATE TABLE IF NOT EXISTS `colunas_kanban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `posicao` int NOT NULL,
  `cor` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.colunas_kanban: ~0 rows (aproximadamente)
DELETE FROM `colunas_kanban`;

-- A despejar estrutura para tabela carrepairshopgest.configuracoes_sistema
CREATE TABLE IF NOT EXISTS `configuracoes_sistema` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `chave_configuracao` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_configuracao` text COLLATE utf8mb4_unicode_ci,
  `tipo_configuracao` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'string',
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `sistema` tinyint(1) DEFAULT '0',
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `chave_configuracao` (`chave_configuracao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.configuracoes_sistema: ~0 rows (aproximadamente)
DELETE FROM `configuracoes_sistema`;

-- A despejar estrutura para tabela carrepairshopgest.encomendas_pecas
CREATE TABLE IF NOT EXISTS `encomendas_pecas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero_encomenda` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fornecedor_id` int NOT NULL,
  `data_encomenda` date NOT NULL,
  `data_entrega_estimada` date DEFAULT NULL,
  `data_entrega_real` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `custo_total` decimal(10,2) DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_encomenda` (`numero_encomenda`),
  KEY `estado` (`estado`),
  KEY `fornecedor_id` (`fornecedor_id`),
  CONSTRAINT `encomendas_pecas_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.encomendas_pecas: ~0 rows (aproximadamente)
DELETE FROM `encomendas_pecas`;

-- A despejar estrutura para tabela carrepairshopgest.faturas
CREATE TABLE IF NOT EXISTS `faturas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `numero_fatura` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `ordem_trabalho_id` int DEFAULT NULL,
  `data_emissao` date DEFAULT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_pagamento` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `subtotal` decimal(10,2) NOT NULL,
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `valor_pago` decimal(10,2) DEFAULT '0.00',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `recibo_toconline_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toconline_customer_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `toconline_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_fatura` (`numero_fatura`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.faturas: ~0 rows (aproximadamente)
DELETE FROM `faturas`;

-- A despejar estrutura para tabela carrepairshopgest.fornecedores
CREATE TABLE IF NOT EXISTS `fornecedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pessoa_contato` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco` text COLLATE utf8mb4_unicode_ci,
  `nif` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `termos_pagamento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.fornecedores: ~6 rows (aproximadamente)
DELETE FROM `fornecedores`;
INSERT INTO `fornecedores` (`id`, `nome`, `pessoa_contato`, `email`, `telefone`, `endereco`, `nif`, `termos_pagamento`, `ativo`, `notas`, `criado_em`, `atualizado_em`, `criado_por`) VALUES
	(15, 'Sofrapa', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-03-17 21:30:47', '2026-03-17 21:30:47', NULL),
	(16, 'AutoCab', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-03-17 21:30:47', '2026-03-17 21:30:47', NULL),
	(17, 'Nors', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-03-17 21:30:47', '2026-03-17 21:30:47', NULL),
	(18, 'MCoutinho', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-03-17 21:30:47', '2026-03-17 21:30:47', NULL),
	(19, 'Barripeças', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-03-17 21:30:47', '2026-03-17 21:30:47', NULL),
	(20, 'RPZ', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-03-17 21:30:47', '2026-03-17 21:30:47', NULL);

-- A despejar estrutura para tabela carrepairshopgest.historico_cartao_kanban
CREATE TABLE IF NOT EXISTS `historico_cartao_kanban` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cartao_id` int NOT NULL,
  `coluna_origem_id` int DEFAULT NULL,
  `coluna_destino_id` int NOT NULL,
  `movido_por` int DEFAULT NULL,
  `movido_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.historico_cartao_kanban: ~0 rows (aproximadamente)
DELETE FROM `historico_cartao_kanban`;

-- A despejar estrutura para tabela carrepairshopgest.itens_encomenda_peca
CREATE TABLE IF NOT EXISTS `itens_encomenda_peca` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `encomenda_id` bigint unsigned NOT NULL,
  `peca_id` bigint unsigned NOT NULL,
  `quantidade_encomendada` int NOT NULL,
  `quantidade_recebida` int DEFAULT '0',
  `preco_unitario` decimal(10,2) DEFAULT NULL,
  `preco_total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `ordem_trabalho_item_id` bigint unsigned DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `encomenda_id` (`encomenda_id`),
  KEY `estado` (`estado`),
  KEY `peca_id` (`peca_id`),
  CONSTRAINT `itens_encomenda_peca_ibfk_1` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas_pecas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `itens_encomenda_peca_ibfk_2` FOREIGN KEY (`peca_id`) REFERENCES `pecas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.itens_encomenda_peca: ~0 rows (aproximadamente)
DELETE FROM `itens_encomenda_peca`;

-- A despejar estrutura para tabela carrepairshopgest.itens_fatura
CREATE TABLE IF NOT EXISTS `itens_fatura` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fatura_id` int NOT NULL,
  `item_ordem_trabalho_id` int DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(8,2) DEFAULT '1.00',
  `preco_unitario` decimal(10,2) NOT NULL,
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.itens_fatura: ~0 rows (aproximadamente)
DELETE FROM `itens_fatura`;

-- A despejar estrutura para tabela carrepairshopgest.itens_orcamento
CREATE TABLE IF NOT EXISTS `itens_orcamento` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `orcamento_id` bigint unsigned NOT NULL,
  `tipo_item` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `servico_id` int DEFAULT NULL,
  `peca_id` int DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(8,2) DEFAULT '1.00',
  `preco_unitario` decimal(10,2) NOT NULL,
  `percentual_desconto` decimal(5,2) DEFAULT '0.00',
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `percentual_imposto` decimal(5,2) DEFAULT '23.00',
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `itens_orcamento_orcamento_id_fkey` (`orcamento_id`),
  CONSTRAINT `itens_orcamento_orcamento_id_fkey` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.itens_orcamento: ~0 rows (aproximadamente)
DELETE FROM `itens_orcamento`;

-- A despejar estrutura para tabela carrepairshopgest.itens_ordem_trabalho
CREATE TABLE IF NOT EXISTS `itens_ordem_trabalho` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ordem_trabalho_id` bigint unsigned DEFAULT NULL,
  `tipo_item` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `servico_id` int DEFAULT NULL,
  `peca_id` int DEFAULT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` decimal(8,2) DEFAULT '1.00',
  `preco_unitario` decimal(10,2) NOT NULL,
  `horas_trabalho` decimal(6,2) DEFAULT NULL,
  `tarifa_horaria` decimal(8,2) DEFAULT NULL,
  `percentual_desconto` decimal(5,2) DEFAULT '0.00',
  `valor_desconto` decimal(10,2) DEFAULT '0.00',
  `percentual_imposto` decimal(5,2) DEFAULT '23.00',
  `valor_imposto` decimal(10,2) DEFAULT '0.00',
  `valor_total` decimal(10,2) NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `aguarda_peca` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `itens_ordem_trabalho_ordem_trabalho_id_fkey` (`ordem_trabalho_id`),
  CONSTRAINT `itens_ordem_trabalho_ordem_trabalho_id_fkey` FOREIGN KEY (`ordem_trabalho_id`) REFERENCES `ordens_trabalho` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.itens_ordem_trabalho: ~0 rows (aproximadamente)
DELETE FROM `itens_ordem_trabalho`;

-- A despejar estrutura para tabela carrepairshopgest.keystart
CREATE TABLE IF NOT EXISTS `keystart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `chave` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `atualizado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.keystart: ~0 rows (aproximadamente)
DELETE FROM `keystart`;

-- A despejar estrutura para tabela carrepairshopgest.log_auditoria
CREATE TABLE IF NOT EXISTS `log_auditoria` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `utilizador_id` int DEFAULT NULL,
  `acao` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_tabela` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_registo` int DEFAULT NULL,
  `valores_antigos` json DEFAULT NULL,
  `valores_novos` json DEFAULT NULL,
  `endereco_ip` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_utilizador` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=205 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.log_auditoria: ~0 rows (aproximadamente)
DELETE FROM `log_auditoria`;

-- A despejar estrutura para tabela carrepairshopgest.marcas
CREATE TABLE IF NOT EXISTS `marcas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pais_origem` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_marca` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.marcas: ~23 rows (aproximadamente)
DELETE FROM `marcas`;
INSERT INTO `marcas` (`id`, `nome`, `pais_origem`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 'Audi', 'Alemanha', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(2, 'BMW', 'Alemanha', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(3, 'Mercedes-Benz', 'Alemanha', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(4, 'Volkswagen', 'Alemanha', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(5, 'Ford', 'Estados Unidos', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(6, 'Toyota', 'Japão', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(7, 'Honda', 'Japão', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(8, 'Nissan', 'Japão', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(9, 'Peugeot', 'França', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(10, 'Renault', 'França', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(11, 'Citroën', 'França', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(12, 'Fiat', 'Itália', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(13, 'Opel', 'Alemanha', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(14, 'Seat', 'Espanha', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(15, 'Skoda', 'República Checa', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(16, 'Volvo', 'Suécia', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(17, 'Mazda', 'Japão', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(18, 'Kia', 'Coreia do Sul', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(19, 'Hyundai', 'Coreia do Sul', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(20, 'Tesla', 'Estados Unidos', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(21, 'Porsche', 'Alemanha', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(22, 'Land Rover', 'Reino Unido', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(23, 'Jeep', 'Estados Unidos', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01');

-- A despejar estrutura para tabela carrepairshopgest.mecanicos
CREATE TABLE IF NOT EXISTS `mecanicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utilizador_id` int DEFAULT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `especialidade` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tarifa_horaria` decimal(8,2) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_contratacao` date DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.mecanicos: ~3 rows (aproximadamente)
DELETE FROM `mecanicos`;
INSERT INTO `mecanicos` (`id`, `utilizador_id`, `nome`, `especialidade`, `telefone`, `email`, `tarifa_horaria`, `ativo`, `data_contratacao`, `notas`, `criado_em`, `atualizado_em`) VALUES
	(3, NULL, 'Albano Abrantes', 'Trabalhos mais complexos e demorados (elétricos, torneiro)', NULL, NULL, NULL, 1, NULL, NULL, '2026-03-17 21:33:08', '2026-03-17 21:33:08'),
	(4, NULL, 'Bruno Abrantes', 'Ajudante e Trabalhos rápidos (Revisão, pastilhas, discos,...)', NULL, NULL, NULL, 1, NULL, NULL, '2026-03-17 21:33:08', '2026-03-17 21:33:08'),
	(5, NULL, 'José Coelho', 'Trabalhos complexos rápidos (Kit de distribuição, embraiagem,...)', NULL, NULL, NULL, 1, NULL, NULL, '2026-03-17 21:33:08', '2026-03-17 21:33:08');

-- A despejar estrutura para tabela carrepairshopgest.modelos
CREATE TABLE IF NOT EXISTS `modelos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `marca_id` int NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_veiculo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `modelos_marca_id_fkey` (`marca_id`),
  CONSTRAINT `modelos_marca_id_fkey` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.modelos: ~216 rows (aproximadamente)
DELETE FROM `modelos`;
INSERT INTO `modelos` (`id`, `marca_id`, `nome`, `tipo_veiculo`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 1, 'A1', 'Hatchback', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(2, 1, 'A3', 'Hatchback', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(3, 1, 'A4', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(4, 1, 'A5', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(5, 1, 'A6', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(6, 1, 'A7', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(7, 1, 'A8', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(8, 1, 'Q3', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(9, 1, 'Q5', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(10, 1, 'Q7', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(11, 1, 'Q8', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(12, 1, 'TT', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(13, 1, 'R8', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(14, 2, '1 Series', 'Hatchback', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(15, 2, '2 Series', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(16, 2, '3 Series', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(17, 2, '4 Series', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(18, 2, '5 Series', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(19, 2, '6 Series', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(20, 2, '7 Series', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(21, 2, '8 Series', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(22, 2, 'X1', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(23, 2, 'X2', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(24, 2, 'X3', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(25, 2, 'X4', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(26, 2, 'X5', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(27, 2, 'X6', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(28, 2, 'X7', 'SUV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(29, 2, 'Z4', 'Roadster', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(30, 2, 'i3', 'Hatchback', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(31, 2, 'i8', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(32, 3, 'A-Class', 'Hatchback', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(33, 3, 'B-Class', 'MPV', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(34, 3, 'C-Class', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(35, 3, 'E-Class', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(36, 3, 'S-Class', 'Sedan', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(37, 3, 'CLA', 'Coupe', 1, '2026-03-14 17:28:00', '2026-03-14 17:28:00'),
	(38, 3, 'CLS', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(39, 3, 'GLA', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(40, 3, 'GLB', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(41, 3, 'GLC', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(42, 3, 'GLE', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(43, 3, 'GLS', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(44, 3, 'G-Class', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(45, 3, 'SL', 'Roadster', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(46, 3, 'SLC', 'Roadster', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(47, 4, 'Polo', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(48, 4, 'Golf', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(49, 4, 'Jetta', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(50, 4, 'Passat', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(51, 4, 'Arteon', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(52, 4, 'Tiguan', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(53, 4, 'Touareg', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(54, 4, 'T-Roc', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(55, 4, 'Taos', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(56, 4, 'ID.3', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(57, 4, 'ID.4', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(58, 4, 'Scirocco', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(59, 4, 'Beetle', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(60, 5, 'Fiesta', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(61, 5, 'Focus', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(62, 5, 'Mondeo', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(63, 5, 'Mustang', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(64, 5, 'Explorer', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(65, 5, 'Kuga', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(66, 5, 'Puma', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(67, 5, 'Ranger', 'Pickup', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(68, 5, 'Transit', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(69, 5, 'F-150', 'Pickup', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(70, 6, 'Yaris', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(71, 6, 'Corolla', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(72, 6, 'Camry', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(73, 6, 'Prius', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(74, 6, 'RAV4', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(75, 6, 'C-HR', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(76, 6, 'Highlander', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(77, 6, 'Land Cruiser', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(78, 6, 'Hilux', 'Pickup', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(79, 6, 'Proace', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(80, 6, 'Supra', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(81, 7, 'Jazz', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(82, 7, 'Civic', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(83, 7, 'Accord', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(84, 7, 'HR-V', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(85, 7, 'CR-V', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(86, 7, 'Pilot', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(87, 7, 'City', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(88, 7, 'NSX', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(89, 8, 'Micra', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(90, 8, 'Pulsar', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(91, 8, 'Qashqai', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(92, 8, 'X-Trail', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(93, 8, 'Juke', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(94, 8, 'Navara', 'Pickup', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(95, 8, 'Leaf', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(96, 8, '370Z', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(97, 8, 'GT-R', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(98, 9, '108', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(99, 9, '208', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(100, 9, '308', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(101, 9, '508', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(102, 9, '2008', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(103, 9, '3008', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(104, 9, '5008', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(105, 9, 'Partner', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(106, 9, 'Expert', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(107, 9, 'Boxer', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(108, 10, 'Twingo', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(109, 10, 'Clio', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(110, 10, 'Megane', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(111, 10, 'Talisman', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(112, 10, 'Captur', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(113, 10, 'Kadjar', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(114, 10, 'Koleos', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(115, 10, 'Master', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(116, 10, 'Trafic', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(117, 10, 'Zoe', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(118, 11, 'C1', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(119, 11, 'C3', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(120, 11, 'C4', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(121, 11, 'C5', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(122, 11, 'C3 Aircross', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(123, 11, 'C5 Aircross', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(124, 11, 'Berlingo', 'MPV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(125, 11, 'Jumpy', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(126, 11, 'Jumper', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(127, 12, '500', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(128, 12, 'Panda', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(129, 12, 'Tipo', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(130, 12, '500X', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(131, 12, '500L', 'MPV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(132, 12, 'Ducato', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(133, 12, 'Fiorino', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(134, 12, 'Talento', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(135, 13, 'Corsa', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(136, 13, 'Astra', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(137, 13, 'Insignia', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(138, 13, 'Crossland', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(139, 13, 'Grandland', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(140, 13, 'Mokka', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(141, 13, 'Vivaro', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(142, 13, 'Movano', 'Van', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(143, 14, 'Ibiza', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(144, 14, 'Leon', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(145, 14, 'Arona', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(146, 14, 'Ateca', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(147, 14, 'Tarraco', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(148, 14, 'Alhambra', 'MPV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(149, 15, 'Fabia', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(150, 15, 'Scala', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(151, 15, 'Octavia', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(152, 15, 'Superb', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(153, 15, 'Kamiq', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(154, 15, 'Karoq', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(155, 15, 'Kodiaq', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(156, 15, 'Enyaq', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(157, 16, 'S60', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(158, 16, 'S90', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(159, 16, 'V60', 'Wagon', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(160, 16, 'V90', 'Wagon', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(161, 16, 'XC40', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(162, 16, 'XC60', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(163, 16, 'XC90', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(164, 16, 'C40', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(165, 17, 'Mazda2', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(166, 17, 'Mazda3', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(167, 17, 'Mazda6', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(168, 17, 'CX-3', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(169, 17, 'CX-30', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(170, 17, 'CX-5', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(171, 17, 'CX-9', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(172, 17, 'MX-5', 'Roadster', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(173, 18, 'Picanto', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(174, 18, 'Rio', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(175, 18, 'Ceed', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(176, 18, 'Optima', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(177, 18, 'Stinger', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(178, 18, 'Sportage', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(179, 18, 'Sorento', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(180, 18, 'Carnival', 'MPV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(181, 18, 'EV6', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(182, 19, 'i10', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(183, 19, 'i20', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(184, 19, 'i30', 'Hatchback', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(185, 19, 'Elantra', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(186, 19, 'Sonata', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(187, 19, 'Kona', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(188, 19, 'Tucson', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(189, 19, 'Santa Fe', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(190, 19, 'Palisade', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(191, 19, 'Ioniq 5', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(192, 20, 'Model 3', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(193, 20, 'Model S', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(194, 20, 'Model X', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(195, 20, 'Model Y', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(196, 20, 'Cybertruck', 'Pickup', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(197, 21, '718 Boxster', 'Roadster', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(198, 21, '718 Cayman', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(199, 21, '911', 'Coupe', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(200, 21, 'Panamera', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(201, 21, 'Macan', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(202, 21, 'Cayenne', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(203, 21, 'Taycan', 'Sedan', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(204, 22, 'Defender', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(205, 22, 'Discovery', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(206, 22, 'Discovery Sport', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(207, 22, 'Range Rover', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(208, 22, 'Range Rover Sport', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(209, 22, 'Range Rover Velar', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(210, 22, 'Range Rover Evoque', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(211, 23, 'Renegade', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(212, 23, 'Compass', 'SUV', 1, '2026-03-14 17:28:01', '2026-03-14 17:28:01'),
	(213, 23, 'Cherokee', 'SUV', 1, '2026-03-14 17:28:02', '2026-03-14 17:28:02'),
	(214, 23, 'Grand Cherokee', 'SUV', 1, '2026-03-14 17:28:02', '2026-03-14 17:28:02'),
	(215, 23, 'Wrangler', 'SUV', 1, '2026-03-14 17:28:02', '2026-03-14 17:28:02'),
	(216, 23, 'Gladiator', 'Pickup', 1, '2026-03-14 17:28:02', '2026-03-14 17:28:02');

-- A despejar estrutura para tabela carrepairshopgest.orcamentos
CREATE TABLE IF NOT EXISTS `orcamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ref_orcamento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `veiculo_id` bigint unsigned NOT NULL,
  `preparado_por` int DEFAULT NULL,
  `data_emissao` date DEFAULT NULL,
  `data_expiracao` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'pendente',
  `total_pecas` decimal(10,2) DEFAULT '0.00',
  `total_mao_obra` decimal(10,2) DEFAULT '0.00',
  `total_desconto` decimal(10,2) DEFAULT '0.00',
  `total_imposto` decimal(10,2) DEFAULT '0.00',
  `total_geral` decimal(10,2) NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `data_aprovacao` date DEFAULT NULL,
  `aprovado_por` int DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `kms` int DEFAULT NULL,
  `contacto_nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_orcamento` (`ref_orcamento`),
  KEY `orcamentos_cliente_id_fkey` (`cliente_id`),
  KEY `orcamentos_veiculo_id_fkey` (`veiculo_id`),
  CONSTRAINT `orcamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `orcamentos_veiculo_id_fkey` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.orcamentos: ~0 rows (aproximadamente)
DELETE FROM `orcamentos`;

-- A despejar estrutura para tabela carrepairshopgest.ordens_trabalho
CREATE TABLE IF NOT EXISTS `ordens_trabalho` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ref_ordem_trabalho` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `veiculo_id` bigint unsigned NOT NULL,
  `mecanico_id` int DEFAULT NULL,
  `orcamento_id` bigint unsigned DEFAULT NULL,
  `agendamento_id` bigint unsigned DEFAULT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_conclusao` date DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'em_andamento',
  `quilometragem_servico` int DEFAULT NULL,
  `descricao_problema` text COLLATE utf8mb4_unicode_ci,
  `trabalho_realizado` text COLLATE utf8mb4_unicode_ci,
  `recomendacoes` text COLLATE utf8mb4_unicode_ci,
  `total_pecas` decimal(10,2) DEFAULT '0.00',
  `total_mao_obra` decimal(10,2) DEFAULT '0.00',
  `total_desconto` decimal(10,2) DEFAULT '0.00',
  `total_imposto` decimal(10,2) DEFAULT '0.00',
  `total_geral` decimal(10,2) NOT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL,
  `prioridade` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `contacto_nome` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kms` int DEFAULT NULL,
  `fatura_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `numero_ordem_trabalho` (`ref_ordem_trabalho`),
  KEY `ordens_trabalho_cliente_id_idx` (`cliente_id`),
  KEY `ordens_trabalho_mecanico_id_idx` (`mecanico_id`),
  KEY `ordens_trabalho_orcamento_id_idx` (`orcamento_id`),
  KEY `ordens_trabalho_veiculo_id_idx` (`veiculo_id`),
  KEY `ordens_trabalho_agendamento_id_idx` (`agendamento_id`),
  CONSTRAINT `ordens_trabalho_agendamento_id_fkey` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_trabalho_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `ordens_trabalho_mecanico_id_fkey` FOREIGN KEY (`mecanico_id`) REFERENCES `mecanicos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_trabalho_orcamento_id_fkey` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ordens_trabalho_veiculo_id_fkey` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.ordens_trabalho: ~0 rows (aproximadamente)
DELETE FROM `ordens_trabalho`;

-- A despejar estrutura para tabela carrepairshopgest.pecas
CREATE TABLE IF NOT EXISTS `pecas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `referencia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `fornecedor_id` int DEFAULT NULL,
  `custo_unitario` decimal(10,2) NOT NULL,
  `preco_venda` decimal(10,2) NOT NULL,
  `quantidade_stock` int DEFAULT '0',
  `nivel_stock_minimo` int DEFAULT '0',
  `nivel_stock_maximo` int DEFAULT NULL,
  `localizacao` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `veiculos_compativeis` text COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) DEFAULT '1',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `margem_lucro` decimal(5,2) DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `categoria_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `referencia` (`referencia`),
  KEY `pecas_categoria_id_fkey` (`categoria_id`),
  CONSTRAINT `pecas_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_peca` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.pecas: ~62 rows (aproximadamente)
DELETE FROM `pecas`;
INSERT INTO `pecas` (`id`, `referencia`, `nome`, `descricao`, `fornecedor_id`, `custo_unitario`, `preco_venda`, `quantidade_stock`, `nivel_stock_minimo`, `nivel_stock_maximo`, `localizacao`, `veiculos_compativeis`, `ativo`, `notas`, `margem_lucro`, `criado_em`, `atualizado_em`, `criado_por`, `categoria_id`) VALUES
	(7, 'FMK425', 'MAXILAS', NULL, NULL, 46.00, 46.00, 2, 0, NULL, NULL, NULL, 1, 'Citroën C3 1; Citroen C2 JM; Citroën C3 Pluriel; 1007 Hatchback; Citroen C2 Enterprise', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(8, 'DBP1217', 'PASTILHAS F', NULL, NULL, 19.50, 19.50, 3, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(9, 'PA-013AF', 'PASTILHAS F', NULL, NULL, 13.10, 13.10, 4, 0, NULL, NULL, NULL, 1, 'Renault Clio 3; Renault Clio 4; Duster SUV; Renault Kangoo Express FW; Renault Captur J5; Renault Megane 4; Nissan Micra K12; Modus / Grand Modus (F; JP); Dacia Duster 2; Renault Grand Kangoo; Nissan Note e11; Megane 4 Grandtour; Renault Clio IV Grandtour; Lodgy (JS ); Dacia Logan MCV KS; Renault Clio 3 Grandtour; Nissan Micra k13; Dacia Logan MCV 2; Dacia Dokker Carrinha; Zoe (BFM )', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(10, 'P14603', 'PASTILHAS F', NULL, NULL, 20.70, 20.70, 2, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(11, '2570201', 'PASTILHAS F', NULL, NULL, 18.00, 18.00, 1, 0, NULL, NULL, NULL, 1, 'Renault Clio 4; Dacia Sandero 2; Renault Twingo 3; Renault Clio IV Grandtour; Dacia Logan MCV 2; Smart Fortwo 453 Coupe; Smart Forfour 453; LOGAN 2; CLIO 4 Kasten; Smart Fortwo 3 Cabrio; Renault Sandero Stepway 2; CLIO IV Stasjonsvogn (KH ); Mercedes W463 Cabrio; Symbol / Thalia III (L8); Logan II; Logan II MCV', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(12, 'P14403.00', 'PASTILHAS F', NULL, NULL, 15.00, 15.00, 1, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(13, 'PA-0722AF', 'PASTILHAS F', NULL, NULL, 15.00, 15.00, 3, 0, NULL, NULL, NULL, 1, 'Renault Megane 4; Megane 4 Grandtour; Megane IV Sedan', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(14, '2355406', 'PASTILHAS T', NULL, NULL, 20.00, 20.00, 1, 0, NULL, NULL, NULL, 1, 'Renault Clio 3; Peugeot 208 I Hatchback; Renault Clio 4; Renault Megane 3; Citroen C3 II; Scénic 2; Renault Scenic 3; Renault Twingo 2; Renault Megane 3 Grandtour; Megane 2; Citroen C3 SX; Renault Grand Scenic 3; Citroen C4 Cactus; Renault Megane 4; Modus / Grand Modus (F; JP); Renault Megane 2 Cabrio; Renault Megane 2 Carrinha; Renault Megane 3 Coupe; Renault Scenic 1; Renault Scénic IV', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(15, 'CBP06092', 'PASTILHAS T', NULL, NULL, 25.00, 25.00, 1, 0, NULL, NULL, NULL, 1, 'BMW F11; BMW F10; BMW F25; BMW G30; BMW G31; BMW G01; BMW X4 F26; BMW G11; BMW Z4 E89; X5 (G05); X4 (G02; F98); BMW 6 Gran Turismo G32; X6 (G06; F96); iX3 (G08); BMW i8 i12; i8 Roadster I15', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(16, 'RE-WB-11476', 'ROLAMENTO RODA', NULL, NULL, 16.00, 16.00, 2, 0, NULL, NULL, NULL, 1, 'Renault Clio 3; Scénic 2; Renault Twingo 2; Megane 2; Renault Captur J5; Renault Megane 2 Cabrio; Renault Megane 2 Carrinha; Renault Grand Scénic II; Lodgy (JS ); Renault Clio 3 Grandtour; MEGANE 2 Stufenheck (LM0/1); Dacia Dokker Carrinha; Dacia Dokker Express; Renault Megane II Combi; Wind Cabrio; Megane II Van / Hatchback (KM0/2 ); Dokker Van; DOKKER Pick-up', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 16),
	(17, 'OS9341', 'RETENTOR COMBOTA', NULL, NULL, 13.00, 13.00, 1, 0, NULL, NULL, NULL, 1, 'Renault Clio 3; Clio 2; Nissan Qashqai J10; Renault Clio 4; Nissan Qashqai J11; Renault Megane 3; Mercedes W176; Duster SUV; Scénic 2; Renault Scenic 3; Renault Twingo 2; Renault Megane 3 Grandtour; Renault Kangoo kc01; Megane 2; Dacia Sandero 2; Renault Kangoo Express FW; Renault Captur J5; Nissan Juke f15; Classe B (W246; W242); Renault Grand Scenic 3', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 4),
	(18, 'OS5310', 'RETENTOR COMBOTA', NULL, NULL, 5.70, 5.70, 1, 0, NULL, NULL, NULL, 1, 'Renault Clio 3; Clio 2; Renault Megane 3; Duster SUV; Scénic 2; Renault Scenic 3; Renault Twingo 2; Renault Megane 3 Grandtour; Renault Kangoo kc01; Megane 2; Renault Kangoo Express FW; Clio 1; Modus / Grand Modus (F; JP); Renault Megane 1; Renault Kangoo Express; Renault Laguna 2; Renault Megane 2 Cabrio; Renault Megane 2 Carrinha; Renault Megane 3 Coupe; Dacia Sandero sd', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 4),
	(19, 'ATE020536', 'BOMBITOS', NULL, NULL, 40.00, 40.00, 2, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 5),
	(20, '20036702B', 'RETENTOR CAMBOTA', NULL, NULL, 9.70, 9.70, 1, 0, NULL, NULL, NULL, 1, 'Golf 7; Polo 6R; Golf 6; Audi A4 B8 Avant; Audi A3 8P; Touran 1t1 1t2; Tiguan 5n; Audi A3 8P1; Passat B6 Variant; VW T5 Van; Audi A6 C7 Avant; Audi A6 4f; Octavia 5e5; Audi Q5 8r; Audi A3 8V Sportback; VW T5 Transporter; Seat Leon 1P; Octavia 1z5; Passat 3g5; Passat 365', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 4),
	(21, 'PA1487', 'BOMBA D\'ÁGUA', NULL, NULL, 48.00, 48.00, 1, 0, NULL, NULL, NULL, 1, 'Clio V Hatchback (BF); Renault Megane 4; Renault Scénic IV; Megane 4 Grandtour; Renault Grand Scenic 4; Captur II; Renault Talisman Grandtour; Renault Talisman Sedan; Jogger I MPV; Juke II (F16); Arkana I (LCM ); Express Van; Austral (RHN); Kangoo III MPV; Kangoo III Box Body / MPV; Duster (HM ); Logan III Sedan (DJF); Kaptur (HA); Townstar MPV (XFK); Townstar Van (XFK)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 13),
	(22, '5W30 PETRONAS', 'ÓLEO 5L', NULL, NULL, 34.00, 34.00, 4, 0, NULL, NULL, NULL, 1, 'Peugeot 206 2A/C; Renault Clio 3; Clio 2; Nissan Qashqai J10; Peugeot 207 WA; Peugeot 208 I Hatchback; Mercedes W204; Mercedes W211; Renault Clio 4; Mercedes W203; Citroën C3 1; Nissan Qashqai J11; Fiat 500 312; Fiat Ducato 250; Fiat Panda 169; Mercedes W169; Peugeot 307 3/AC; Volvo V50 545; Peugeot 3008 0U; Mercedes W212', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 15),
	(23, '5W30 ELF', 'ÓLEO 5L', NULL, NULL, 36.80, 36.80, 10, 0, NULL, NULL, NULL, 1, 'Opel Corsa D; Mercedes W204; Mercedes W211; Mercedes W203; Opel Zafira B; Mercedes W169; Opel Corsa C; Mercedes W212; Mercedes W245; Mercedes W176; Mercedes S204; Insignia A Sports Tourer G09; Opel Astra H; Mercedes Sprinter w906; Mercedes Vito W639; Opel Meriva x03; Opel Astra J; Mercedes ML W164; Mercedes Vito Mixto W639; Mercedes W205', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 15),
	(24, '75W80', 'ÓLEO 5L (Caixa Velocidades)', NULL, NULL, 12.00, 12.00, 1, 0, NULL, NULL, NULL, 1, 'Peugeot 206 2A/C; Nissan Qashqai J10; Peugeot 207 WA; Citroën C3 1; Nissan Qashqai J11; Fiat Ducato 250; Peugeot 307 3/AC; Peugeot 3008 0U; Citroen C3 II; Peugeot 206 cc 2d; Peugeot 308 I; Peugeot Partner Tepee; Citroen Xsara Picasso; Peugeot 307 SW; Peugeot 407 Sedan; Peugeot 406 Sedan; Peugeot 207 SW; Citroen C4 Picasso mk1; Peugeot Boxer 250 Van; Peugeot 207 cc', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 15),
	(25, 'WL7506', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 3, 0, NULL, NULL, NULL, 1, 'Renault Clio 4; Nissan Qashqai J11; Renault Megane 3; Duster SUV; Renault Scenic 3; Renault Megane 3 Grandtour; Dacia Sandero 2; Renault Kangoo Express FW; Renault Captur J5; Nissan Juke f15; Clio V Hatchback (BF); Renault Grand Scenic 3; Mercedes W177; Renault Twingo 3; Renault Megane 4; Dacia Duster 2; Kadjar (HA; HL ); Renault Megane 3 Coupe; Renault Grand Kangoo; Nissan X-Trail T32', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(26, 'WL7555', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 3, 0, NULL, NULL, NULL, 1, 'Peugeot 208 I Hatchback; Peugeot 3008 SUV; Peugeot 308 SW II; Peugeot 308 II; Citroen C3 SX; Peugeot 2008 Carrinha; Expert III Van (V); Citroen C4 Cactus; Ford Focus IV HN; Corsa F Hatchback; C5 Aircross; Peugeot 5008 II; Ford Ecosport mk2; 208 II Hatchback (UB; UP; UW; UJ ); Jumpy III Van (V); Ford Transit Connect MK2; Opel Crossland X P17; Ford Focus 4 Turnier; 2008 II (U ); Grandland X (A18)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(27, 'OX1237D', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 2, 0, NULL, NULL, NULL, 1, 'Peugeot 208 I Hatchback; Peugeot 3008 SUV; Peugeot 308 SW II; Peugeot 308 II; Citroen C3 SX; Peugeot 2008 Carrinha; Expert III Van (V); Citroen C4 Cactus; Ford Focus IV HN; Corsa F Hatchback; C5 Aircross; Peugeot 5008 II; Ford Ecosport mk2; 208 II Hatchback (UB; UP; UW; UJ ); Jumpy III Van (V); Ford Transit Connect MK2; Opel Crossland X P17; Ford Focus 4 Turnier; 2008 II (U ); Grandland X (A18)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(28, 'ADM52119', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 3, 0, NULL, NULL, NULL, 1, 'Ford Fiesta Mk6; Peugeot 206 2A/C; Peugeot 207 WA; Peugeot 208 I Hatchback; Ford Fiesta Mk5; Citroën C3 1; Ford Focus Mk2; Mini Cooper R56; Peugeot 307 3/AC; Volvo V50 545; Peugeot 3008 0U; Citroen C3 II; Peugeot 206 cc 2d; Peugeot 308 I; Peugeot Partner Tepee; Citroen Xsara Picasso; Peugeot 308 SW II; Peugeot 308 II; Ford Focus DYB Hatchback; Peugeot 307 SW', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(29, 'FO-ECO130', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 2, 0, NULL, NULL, NULL, 1, 'BMW E90; BMW E91; BMW F20; BMW F11; BMW F10; BMW F31; Mini Cooper R56; BMW F30; BMW E92; BMW F25; BMW X1 E84; BMW F36; Mini Countryman R60; Toyota Avensis T27 Carrinha; BMW F15; BMW E93; BMW F21; Toyota Verso AR2; BMW F34; RAV4 IV SUV (XA40)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(30, 'ADV182125', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 4, 0, NULL, NULL, NULL, 1, 'Golf 7; Audi A4 B8 Avant; Tiguan 5n; Audi A6 C7 Avant; Octavia 5e5; Audi Q5 8r; Audi A3 8V Sportback; Passat 3g5; Audi A4 B8; Golf 7 Variant; Audi A5 8ta; Audi A4 B9 Avant; Audi A5 8t3; VW Tiguan 2 AD1; Seat Leon 5f; VW Sharan 7n; Audi Q3 8u; Scirocco 3; Audi A6 C7 4g; Seat Leon ST 5F8', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(31, 'ADB112107', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 1, 0, NULL, NULL, NULL, 1, 'BMW E90; BMW E91; BMW F20; BMW F11; BMW F10; BMW F31; Mini Cooper R56; BMW F30; BMW E92; BMW F25; BMW X1 E84; BMW F36; Mini Countryman R60; Toyota Avensis T27 Carrinha; BMW F15; BMW E93; BMW F21; Toyota Verso AR2; BMW F34; RAV4 IV SUV (XA40)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(32, 'FT5266', 'FILTRO DE ÓLEO', NULL, NULL, 5.00, 5.00, 1, 0, NULL, NULL, NULL, 1, 'Peugeot 206 2A/C; Renault Clio 3; Clio 2; Nissan Qashqai J10; Peugeot 208 I Hatchback; Audi A3 8V Sportback; Peugeot 307 3/AC; Peugeot 3008 0U; Renault Megane 3; Citroen C3 II; Duster SUV; Peugeot 206 cc 2d; Scénic 2; Peugeot 3008 SUV; Peugeot Partner Tepee; Renault Scenic 3; Citroen Xsara Picasso; Peugeot 308 SW II; Peugeot 308 II; Ford Focus DYB Hatchback', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(33, 'FA5919ECO', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 1, 0, NULL, NULL, NULL, 1, 'Fiat 500 312; Fiat Panda 169; Fiat Grande Punto 199; Alfa Romeo Giulietta 940; Fiat Panda 312; Alfa Romeo Mito 955; BRAVO 2 (198); Fiat Punto EVO; Alfa Romeo 159 Sportwagon; Fiat 500 Cabrio; Suzuki Swift fz nz; KA Hatchback (RU8); Fiat Punto 199; Alfa Romeo 159 939; Fiat 500 L; Saab 9-3 Sedan; Doblo II Van / Carrinha (263); Suzuki sx4 ey gy; Saab 9-3 Carrinha; Fiat Tipo 356', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(34, 'FA6813ECO', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 1, 0, NULL, NULL, NULL, 1, 'Nissan Qashqai J11; Dacia Sandero 2; Renault Kangoo Express FW; Clio V Hatchback (BF); Mercedes W177; Renault Megane 4; Dacia Duster 2; Kadjar (HA; HL ); Renault Grand Kangoo; Megane 4 Grandtour; Lodgy (JS ); Dacia Logan MCV 2; Sandero III (BJI); Captur II; Dacia Dokker Carrinha; CLA Coupe (C118); Classe B (W247); Mercedes Citan Van; Dacia Dokker Express; CLA Shooting Brake (X118)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(35, 'FT6088', 'FILTRO DE ÓLEO', NULL, NULL, 5.00, 5.00, 1, 0, NULL, NULL, NULL, 1, 'Renault Clio 4; Nissan Qashqai J11; Renault Megane 3; Mercedes W176; Duster SUV; Renault Scenic 3; Renault Megane 3 Grandtour; Dacia Sandero 2; Renault Kangoo Express FW; Renault Captur J5; Nissan Juke f15; Classe B (W246; W242); Renault Grand Scenic 3; Renault Megane 4; Dacia Duster 2; Kadjar (HA; HL ); Renault Megane 3 Coupe; Renault Grand Kangoo; Mercedes C117; Renault Scénic IV', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(36, 'DP1110.11.0373', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 5, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(37, 'DP1110.11.0147', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 5, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(38, 'WL7283', 'FILTRO DE ÓLEO', NULL, NULL, 6.65, 6.65, 1, 0, NULL, NULL, NULL, 1, 'BMW E46; BMW E39; BMW E46 Touring; BMW E53; BMW E39 Touring; BMW E38; Range Rover 3 (L322); Opel Omega B Sedan; Opel Omega B Caravan; D10 Sedan (E39); D10 Touring (E39).', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(39, 'FA-0600S', 'FILTRO DE AR', NULL, NULL, 6.65, 6.65, 2, 0, NULL, NULL, NULL, 1, 'Peugeot 208 I Hatchback; Peugeot 3008 SUV; Peugeot 308 SW II; Peugeot 308 II; Citroen C3 SX; Peugeot 2008 Carrinha; Expert III Van (V); Citroen C4 Cactus; Corsa F Hatchback; C5 Aircross; Peugeot 5008 II; 208 II Hatchback (UB; UP; UW; UJ ); Jumpy III Van (V); Opel Crossland X P17; 2008 II (U ); Grandland X (A18); Citroen C3 Aircross 2; Partner k9; Berlingo Van (K9); Citroën Berlingo K9', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(40, 'WA9770', 'FILTRO DE AR', NULL, NULL, 12.95, 12.95, 1, 0, NULL, NULL, NULL, 1, 'Renault Clio 4; Duster SUV; Dacia Sandero 2; Renault Captur J5; Renault Clio IV Grandtour; Lodgy (JS ); Dacia Logan MCV 2; Dacia Dokker Carrinha; Dacia Dokker Express; LOGAN 2; CLIO 4 Kasten; Dacia Duster Van; Renault Sandero Stepway 2; Duster (HS ); CLIO IV Stasjonsvogn (KH ); Logan II; Logan II MCV; Dokker Van; DOKKER Pick-up', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(41, 'DP1110.10.0548', 'FILTRO DE AR', NULL, NULL, 10.00, 10.00, 2, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(42, 'ADBP220129', 'FILTRO DE AR', NULL, NULL, 12.00, 12.00, 2, 0, NULL, NULL, NULL, 1, 'Clio V Hatchback (BF); Sandero III (BJI); Captur II; Jogger I MPV; Juke II (F16); Duster III (P1310); Colt VII (VB); Logan III Sedan (DJF); Taliant Sedan; ASX II', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(43, 'WA9993', 'FILTRO DE AR', NULL, NULL, 12.00, 12.00, 3, 0, NULL, NULL, NULL, 1, 'Clio V Hatchback (BF); Sandero III (BJI); Captur II; Jogger I MPV; Juke II (F16); Duster III (P1310); Colt VII (VB); Logan III Sedan (DJF); Kaptur (HA); ASX II', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(44, 'FK206', 'FILTRO DE COMBUSTIVEL', NULL, NULL, 14.20, 14.20, 1, 0, NULL, NULL, NULL, 1, 'Peugeot 407 Sedan; Peugeot 407 SW; C5 III Carrinha (RW); Citroën C5 Sedan; Peugeot 407 Coupe; Citroen C6 Sedan; 407 SW Van / Carrinha (6E )', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(45, 'PC8418', 'FILTRO DO HABITÁCULO', NULL, NULL, 12.95, 12.95, 1, 0, NULL, NULL, NULL, 1, 'Nissan Qashqai J11; Renault Megane 4; Kadjar (HA; HL ); Nissan X-Trail T32; Renault Scénic IV; Megane 4 Grandtour; Renault Espace 5; Renault Grand Scenic 4; Renault Talisman Grandtour; Renault Talisman Sedan; Renault Koleos 2; Megane IV Sedan; Express Van; Grand Kangoo III MPV; Classe T MPV (W420); Kangoo III MPV; Kangoo III Box Body / MPV; Citan II Van (420); Citan II Tourer (W420); Townstar MPV (XFK)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(46, 'WF8520', 'FILTRO DO COMBUSTÍVEL', NULL, NULL, 19.00, 19.00, 1, 0, NULL, NULL, NULL, 1, 'Renault Megane 4; Renault Scénic IV; Megane 4 Grandtour; Renault Espace 5; Renault Grand Scenic 4; Renault Talisman Grandtour; Renault Talisman Sedan; Megane IV Sedan', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(47, 'WF8522', 'FILTRO DO COMBUSTÍVEL', NULL, NULL, 23.00, 23.00, 1, 0, NULL, NULL, NULL, 1, 'Astra K Sports Tourer (B16); Opel Astra K B16; Astra Mk7 (K) (B16); Astra K Van / Carrinha (B16); Astra K Van / Hatchback (B16)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(48, 'FT6036', 'FILTRO DO COMBUSTÍVEL', NULL, NULL, 12.00, 12.00, 1, 0, NULL, NULL, NULL, 1, 'Peugeot 206 2A/C; Renault Clio 3; Clio 2; Peugeot 207 WA; Peugeot 208 I Hatchback; Citroën C3 1; Peugeot 307 3/AC; Renault Megane 3; Citroen C3 II; Twingo c06; Peugeot 206 cc 2d; Scénic 2; Renault Trafic FL; Peugeot 308 I; Peugeot 3008 SUV; Peugeot Partner Tepee; Renault Scenic 3; Citroen Xsara Picasso; Peugeot 308 SW II; Peugeot 308 II', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(49, 'ADBP230010', 'FILTRO DO COMBUSTÍVEL', NULL, NULL, 13.00, 13.00, 3, 0, NULL, NULL, NULL, 1, 'Peugeot 208 I Hatchback; Peugeot 3008 SUV; Peugeot 308 SW II; Peugeot 308 II; Citroen C3 SX; Peugeot 2008 Carrinha; Citroen C4 Cactus; Corsa F Hatchback; C5 Aircross; Peugeot 5008 II; 208 II Hatchback (UB; UP; UW; UJ ); Opel Crossland X P17; 2008 II (U ); Grandland X (A18); Citroen C3 Aircross 2; Partner k9; Berlingo Van (K9); Citroën Berlingo K9; DS7 Crossback; Rifter', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(50, 'ADR162309', 'FILTRO DE COMBUSTIVEL', NULL, NULL, 18.00, 18.00, 1, 0, NULL, NULL, NULL, 1, 'Renault Megane 4; Renault Scénic IV; Megane 4 Grandtour; Renault Espace 5; Renault Grand Scenic 4; Renault Talisman Grandtour; Renault Talisman Sedan; Megane IV Sedan', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(51, 'FC-ECO097', 'FILTRO DO COMBUSTÍVEL', NULL, NULL, 10.00, 10.00, 3, 0, NULL, NULL, NULL, 1, 'Renault Clio 4; Duster SUV; Dacia Sandero 2; Renault Kangoo Express FW; Renault Captur J5; Dacia Duster 2; Renault Laguna 3; Renault Grand Kangoo; Renault Laguna 3 Grandtour; Renault Clio IV Grandtour; Lodgy (JS ); Dacia Logan MCV 2; Nissan Micra 5; Dacia Dokker Carrinha; Nissan Note E12; NV200 / Evalia Minibus (M20); Nissan NV200 Van; Mercedes Citan Van; Renault Laguna 3 Coupe; Dacia Dokker Express', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 10),
	(52, '91121', 'VELA DE IGNIÇÃO', NULL, NULL, 12.00, 12.00, 2, 0, NULL, NULL, NULL, 1, 'Renault Clio 4; Nissan Qashqai J11; Renault Megane 3; Duster SUV; Renault Scenic 3; Renault Megane 3 Grandtour; Dacia Sandero 2; Renault Kangoo Express FW; Renault Captur J5; Renault Grand Scenic 3; Renault Twingo 3; Renault Megane 4; Dacia Duster 2; Kadjar (HA; HL ); Renault Megane 3 Coupe; Renault Grand Kangoo; Renault Scénic IV; Megane 4 Grandtour; Renault Clio IV Grandtour; Lodgy (JS )', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 14),
	(53, 'ZKR7A-0', 'VELA DE IGNIÇÃO', NULL, NULL, 9.00, 9.00, 4, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 14),
	(54, '64136', 'LÂMPADA PISCA', NULL, NULL, 6.00, 6.00, 6, 0, NULL, NULL, NULL, 1, 'Golf 4; Golf 7; Golf 5; Polo 6R; BMW E90; Audi A4 B8 Avant; BMW E91; Audi A3 8P; Touran 1t1 1t2; Tiguan 5n; BMW F11; Audi A3 8P1; Passat B6 Variant; BMW F10; Renault Clio 4; Audi A6 4f; Octavia 5e5; BMW F31; Opel Zafira B; BMW E61', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(55, '7528', 'LÂMPADA PISCA', NULL, NULL, 2.00, 2.00, 9, 0, NULL, NULL, NULL, 1, 'Ford Fiesta Mk6; Peugeot 206 2A/C; Renault Clio 3; Clio 2; Opel Corsa D; Nissan Qashqai J10; VW T5 Van; Renault Clio 4; Ford Fiesta Mk5; Seat Ibiza 6L; Octavia 5e5; Citroën C3 1; VW T4 Transporter; Ford Focus Mk2; VW T5 Transporter; Fiat Ducato 250; Fiat Panda 169; Audi A3 8L; Volvo V50 545; Opel Corsa C', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(56, '368.299', 'LÂMPADA PISCA', NULL, NULL, 0.80, 0.80, 12, 0, NULL, NULL, NULL, 1, '', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(57, '7506', 'LÂMPADA PISCA', NULL, NULL, 0.80, 0.80, 10, 0, NULL, NULL, NULL, 1, 'Golf 4; Golf 5; Polo 6R; BMW E46; BMW E90; Polo 9N; BMW E91; Ford Fiesta Mk6; Peugeot 206 2A/C; Renault Clio 3; BMW E60; Clio 2; Audi A3 8P; Opel Corsa D; BMW E87; Nissan Qashqai J10; Peugeot 207 WA; BMW E39; Touran 1t1 1t2; Tiguan 5n', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(58, '2557100000', 'LÂMPADA H7', NULL, NULL, 6.46, 6.46, 9, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(59, '64193', 'LÂMPADA H4', NULL, NULL, 6.46, 6.46, 11, 0, NULL, NULL, NULL, 1, 'Polo 6R; Ford Fiesta Mk6; Peugeot 206 2A/C; Clio 2; VW T5 Van; Ford Fiesta Mk5; Seat Ibiza 6L; VW T4 Transporter; Mini Cooper R56; VW T5 Transporter; Fiat Panda 169; Audi A3 8L; Golf 3; Toyota Yaris II Hatchback; Mercedes W124; Twingo c06; Seat Ibiza 6J; Mercedes W201; Fiat Grande Punto 199; Renault Trafic FL', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(60, '702103001', 'BOTÕES JANELA', NULL, NULL, 15.00, 15.00, 1, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(61, '750298', 'BORNE POSITIVO', NULL, NULL, 2.00, 2.00, 3, 0, NULL, NULL, NULL, 1, 'Terminal de bateria universal. Aplicação: Qualquer veículo ligeiro.', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(62, '750296', 'BORNE NEGATIVO', NULL, NULL, 2.00, 2.00, 1, 0, NULL, NULL, NULL, 1, 'Terminal de bateria universal. Aplicação: Qualquer veículo ligeiro.', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 6),
	(63, '7PK1035', 'CORREIA DE ACESSÓRIOS', NULL, NULL, 9.00, 9.00, 3, 0, NULL, NULL, NULL, 1, 'Renault Clio 3; Renault Twingo 2; Modus / Grand Modus (F; JP); BMW E38; Renault Clio 3 Grandtour; BMW E31; Twingo II Van / Hatchback (CNO ); Renault Clio 3 Van; Wind Cabrio; Nissan Pathfinder R52; QX60 SUV; Murano III (Z52); Altima l33; Teana III (J33; L33); JX SUV; Quest IV (RE52); Elgrand III (E52)', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 11),
	(64, '6PK1153', 'CORREIA DE ACESSÓRIOS', NULL, NULL, 9.00, 9.00, 1, 0, NULL, NULL, NULL, 1, 'BMW F20; Peugeot 208 I Hatchback; BMW F31; BMW F30; Peugeot 307 3/AC; Golf 3; Renault Trafic FL; Peugeot 3008 SUV; Peugeot 308 SW II; Peugeot 308 II; Peugeot 307 SW; Citroen C3 SX; Dacia Sandero 2; Peugeot 2008 Carrinha; Citroën C4 Mk1; Toyota Auris E15; Expert III Van (V); Citroen C4 Cactus; BMW F36; Renault Megane 1', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 11),
	(65, '6PK2155', 'CORREIA DE ACESSÓRIOS', NULL, NULL, 10.00, 10.00, 1, 0, NULL, NULL, NULL, 1, 'Mercedes W204; Mercedes W212; Mercedes W124; Mercedes S204; Mercedes W202; SLK R170; Mercedes S212; Mercedes W210; ML W163; GLK X204; Mercedes w221; Mercedes C207; CLK C208; Mercedes S124 (W124); Ssangyong Rexton II; Mercedes C204; Mercedes C218; Subaru Forester SJ; Subaru XV 2; Mercedes S210', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 11),
	(66, '6PK1165', 'CORREIA DE ACESSÓRIOS', NULL, NULL, 10.00, 10.00, 1, 0, NULL, NULL, NULL, 1, 'BMW F20; BMW F31; Fiat Ducato 250; BMW F30; Peugeot 406 Sedan; Peugeot Boxer 250 Van; Citroen Jumper 250 Van; Ducato III Camião de plataforma / Chassis (250; 290); Citroen Berlingo MF; Clio 1; Peugeot 306 N5; BMW F36; Berlingo First Van; Peugeot 406 Coupe; BMW F21; Peugeot Partner Van; BMW F34; Peugeot Partner Combispace 5F; Fiat Ducato 250 Minibus; Citroen Xsara N1', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 11),
	(67, '6PK1200', 'CORREIA DE ACESSÓRIOS', NULL, NULL, 10.00, 10.00, 1, 0, NULL, NULL, NULL, 1, '	Peugeot 206 2A/C; Renault Clio 3; Clio 2; Nissan Qashqai J10; Renault Clio 4; Peugeot 307 3/AC; Renault Megane 3; Mercedes W176; Duster SUV; Peugeot 206 cc 2d; Scénic 2; Volvo XC60 I; Renault Scenic 3; Volvo v70 bw; Citroen Xsara Picasso; Peugeot 307 SW; Renault Twingo 2; Renault Megane 3 Grandtour; Peugeot 406 Sedan; Renault Kangoo kc01', 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 11),
	(68, 'UNIVERSAL', 'ANTIC. AZUL 5L', NULL, NULL, 6.50, 6.50, 2, 0, NULL, NULL, NULL, 1, NULL, 0.00, '2026-03-14 17:33:36', '2026-03-14 17:33:36', NULL, 15);

-- A despejar estrutura para tabela carrepairshopgest.perfis_clientes
CREATE TABLE IF NOT EXISTS `perfis_clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `perclucro` decimal(5,2) NOT NULL DEFAULT '0.00',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_perfil` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.perfis_clientes: ~4 rows (aproximadamente)
DELETE FROM `perfis_clientes`;
INSERT INTO `perfis_clientes` (`id`, `nome`, `descricao`, `perclucro`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 'Normal', NULL, 55.00, 1, '2026-03-14 17:35:26', '2026-03-14 17:35:26'),
	(2, 'TVDE Interno', NULL, 55.00, 1, '2026-03-14 17:35:39', '2026-03-14 17:35:39'),
	(3, 'TVDE Externo', NULL, 55.00, 1, '2026-03-14 17:35:50', '2026-03-14 17:35:50'),
	(4, 'Empresa', NULL, 55.00, 1, '2026-03-14 17:36:00', '2026-03-14 17:36:00');

-- A despejar estrutura para tabela carrepairshopgest.servicos
CREATE TABLE IF NOT EXISTS `servicos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `preco_base` decimal(10,2) DEFAULT NULL,
  `duracao_estimada` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requer_pecas` tinyint(1) DEFAULT '0',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.servicos: ~0 rows (aproximadamente)
DELETE FROM `servicos`;

-- A despejar estrutura para tabela carrepairshopgest.transacoes_pecas
CREATE TABLE IF NOT EXISTS `transacoes_pecas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `peca_id` int NOT NULL,
  `tipo_transacao` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade` int NOT NULL,
  `custo_unitario` decimal(10,2) DEFAULT NULL,
  `custo_total` decimal(10,2) DEFAULT NULL,
  `documento_referencia` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fornecedor_id` int DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.transacoes_pecas: ~0 rows (aproximadamente)
DELETE FROM `transacoes_pecas`;

-- A despejar estrutura para tabela carrepairshopgest.utilizadores
CREATE TABLE IF NOT EXISTS `utilizadores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome_utilizador` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash_palavra_passe` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_completo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `papel` enum('admin','gestor','mecanico','rececionista') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `ultimo_login` timestamp NULL DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_utilizador` (`nome_utilizador`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.utilizadores: ~1 rows (aproximadamente)
DELETE FROM `utilizadores`;
INSERT INTO `utilizadores` (`id`, `nome_utilizador`, `email`, `hash_palavra_passe`, `nome_completo`, `papel`, `ativo`, `ultimo_login`, `criado_em`, `atualizado_em`) VALUES
	(1, 'admin', 'admin@mqauto.pt', '$2b$10$I1oDntO7bky264ZMiGsdROa3rE8nV4j.On7MqqUr6Je7XSXY2jnN2', 'Administrador', 'admin', 1, '2026-03-16 22:06:13', '2026-03-14 17:28:06', '2026-03-14 17:28:06');

-- A despejar estrutura para tabela carrepairshopgest.veiculos
CREATE TABLE IF NOT EXISTS `veiculos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int DEFAULT NULL,
  `marca` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matricula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ano` int DEFAULT NULL,
  `numero_chassis` varchar(17) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_motor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_combustivel` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'disponivel',
  `ultima_intervencao` date DEFAULT NULL,
  `proxima_revisao` date DEFAULT NULL,
  `companhia_seguros` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apolice_seguro` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validade_seguro` date DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `numero_chassis` (`numero_chassis`),
  KEY `veiculos_cliente_id_fkey` (`cliente_id`),
  CONSTRAINT `veiculos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.veiculos: ~72 rows (aproximadamente)
DELETE FROM `veiculos`;
INSERT INTO `veiculos` (`id`, `cliente_id`, `marca`, `modelo`, `matricula`, `ano`, `numero_chassis`, `tipo_motor`, `tipo_combustivel`, `estado`, `ultima_intervencao`, `proxima_revisao`, `companhia_seguros`, `apolice_seguro`, `validade_seguro`, `notas`, `criado_em`, `atualizado_em`) VALUES
	(29, 5, 'Renault', 'Megane', 'BD-70-VX', 2019, 'VF1RFB00763456763', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(30, 5, 'Peugeot', '308', 'BF-98-PB', 2019, 'VF3LBYHYPKS276708', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(31, 5, 'Renault', 'Clio', 'BE-87-NH', 2019, 'VF1R9800363219696', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(32, 5, 'Renault', 'Megane', 'BG-86-HB', 2019, 'VF1RFB00762879431', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(33, 5, 'Renault', 'Clio', 'BG-87-VM', 2019, 'VF1R9800263785459', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(34, 5, 'Renault', 'Clio', '53-ZD-24', 2019, 'VF1R9800063818930', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(35, 5, 'Volkswagen', 'Golf', 'BI-45-BT', 2019, 'WVWZZZAUZKP534884', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(36, 5, 'Peugeot', '308', 'AX-76-AN', 2020, 'VF3LCYHYPLS083087', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(37, 5, 'Dacia', 'Logan', 'AZ-09-JU', 2019, 'UU1K5220762050070', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(38, 5, 'Renault', 'Clio', '73-ZM-43', 2019, 'VF1R9800263818847', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(39, 5, 'Dacia', 'Logan', 'BL-25-IA', 2019, 'UU1K5220563104038', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(40, 5, 'Renault', 'Clio', '72-ZM-13', 2019, 'VF1R9800063819043', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(41, 5, 'Fiat', '500L', 'BM-79-LR', 2019, 'ZFA19900005527061', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(42, 5, 'Seat', 'Leon ST', '36-ZR-08', 2019, 'VSSZZZ5FZLR054754', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(43, 5, 'Fiat', 'Tipo', '75-XH-21', 2019, 'ZFA35600006M78465', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(44, 5, 'Renault', 'Clio', 'BB-32-DA', 2019, 'VF1R9800663277950', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(45, 5, 'Volkswagen', 'Golf', '44-ZI-46', 2019, 'WVWZZZAUZLP507616', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(46, 5, 'Volkswagen', 'Golf', 'BG-65-HM', 2020, 'WWWZZZAUZLP548838', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(47, 5, 'Renault', 'Megane', 'BN-51-GA', 2021, 'VF1RFB00567128850', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(48, 5, 'Dacia', 'Lodgy', 'AV-56-HT', 2022, 'UU1J9220969200302', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(49, 5, 'Peugeot', '308', 'BM-72-VN', 2021, 'VF3LCYHZJLS237502', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(50, 5, 'Renault', 'Clio', 'BJ-50-EI', 2019, 'VF1R9800X63902916', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(51, 5, 'Peugeot', '308', 'BC-07-GZ', 2019, 'VF3LCYHYPKS478197', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(52, 5, 'Renault', 'Clio', 'BB-18-DA', 2019, 'VF1R9800363277937', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(53, 5, 'Dacia', 'Lodgy', 'AX-72-EP', 2019, 'UU1J9220X63314117', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(54, 5, 'Fiat', 'Panda', '07-XT-03', 2025, 'ZFA31200003096648', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(55, 5, 'BYD', 'Atto 3', 'BR-65-VM', 2025, 'LGXCE4CB6P2214544', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(56, 5, 'BYD', 'Atto 3', 'BR-59-VM', 2025, 'LGXCE4CB0P2210294', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(57, 5, 'BYD', 'Atto 3', 'BR-73-VM', 2025, 'LGXCE4CB2P2215206', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(58, 5, 'Seat', 'Leon ST', 'AD-72-PP', 2020, 'VSSZZZSFZLR084440', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(59, 5, 'Dacia', 'Lodgy', 'AL-86-BP', 2021, 'UU1J9220068356461', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(60, 5, 'Seat', 'Leon ST', '71-ZG-97', 2019, 'VSSZZZ5FZLR018879', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(61, 5, 'Opel', 'Astra Sports Tourer', 'BF-34-MO', 2021, 'W0VBD8EV0M8018365', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(62, 5, 'Seat', 'Leon ST', 'AC-15-JS', 2020, 'VSSZZZ5FZLR107283', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(63, 5, 'Dacia', 'Sandero', 'BD-72-XR', 2021, 'UU1DJF00665799200', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(64, 5, 'Hyundai', 'Bayon', 'BD-87-TN', 2023, 'NLHBN81GAPZ351379', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(65, 5, 'Dacia', 'Sandero', 'BF-85-QG', 2021, 'UU1DJF00468083992', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(66, 5, 'Fiat', 'Panda', '28-XT-23', 2019, 'ZFA31200003C60811', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(67, 5, 'Renault', 'Megane', 'AE-64-ON', 2020, 'VF1RFB00965246931', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(68, 5, 'Dacia', 'Lodgy', 'AV-44-NL', 2020, 'UU1J9220266439451', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(69, 5, 'Renault', 'Megane', 'AD-29-NB', 2020, 'VF1RFB00965712194', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(70, 5, 'Fiat', 'Panda', 'AD-80-JH', 2020, 'ZFA31200003E09778', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(71, 5, 'Renault', 'Clio', '86-ZG-19', 2019, 'VF1R9800963203373', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(72, 5, 'Renault', 'Captur', 'BV-14-XN', 2022, 'VF1RJB00169265559', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(73, 5, 'Dacia', 'Lodgy', 'BQ-22-TN', 2021, 'UU1J9220368348564', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(74, 5, 'Renault', 'Megane', 'AC-30-IF', 2020, 'VF1RFB00165712318', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(75, 5, 'Dacia', 'Lodgy', 'AU-06-HJ', 2022, 'UU1J9220168861523', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(76, 5, 'Renault', 'Megane', 'AJ-62-DA', 2021, 'VF1RFB00567732351', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(77, 5, 'Peugeot', '5008', 'BX-26-DT', 2020, 'VF3MCYHZJKS506250', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(78, 5, 'Renault', 'Megane', 'AD-38-JJ', 2020, 'VF1RFB00864860066', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(79, 5, 'Ford', 'Focus', 'AB-88-TR', 2020, 'WF0PXXGCHPKP06186', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(80, 5, 'Fiat', 'Tipo', '82-ZA-63', 2019, 'ZFA35600006L23801', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(81, 5, 'Peugeot', '2008', 'BR-86-RG', 2022, 'VR3UDYHZSMJ931327', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(82, 5, 'Dacia', 'Lodgy', 'AN-28-QT', 2022, 'UU1J9220968750055', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(83, 5, 'Renault', 'Megane', 'AB-80-PP', 2020, 'VF1RFB00265677076', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(84, 5, 'Renault', 'Megane', 'AJ-60-EI', 2021, 'VF1RFB00867770303', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(85, 5, 'Renault', 'Megane', 'AU-82-XQ', 2022, 'VF1RFB00170280215', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(86, 5, 'Peugeot', '308', 'AB-36-ZO', 2020, 'VF3LCYHZPLS169398', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(87, 5, 'Fiat', 'Panda', '28-XT-02', 2019, 'ZFA31200003C95843', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(88, 5, 'Renault', 'Megane', 'AG-62-BQ', 2021, 'VF1RFB00464860145', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(89, 5, 'Renault', 'Clio', 'BA-42-ZC', 2020, 'VF1R9800764532504', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(90, 5, 'Renault', 'Clio', 'AZ-78-JV', 2020, 'VF1R9800164532529', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(91, 5, 'Renault', 'Clio', 'BF-16-BP', 2020, 'VF1R9800564532470', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(92, 5, 'Renault', 'Clio', 'BB-97-EX', 2020, 'VF1R9800064532473', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(93, 5, 'Renault', 'Clio', 'BA-16-ZX', 2020, 'VF1R9800664532493', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(94, 5, 'Renault', 'Megane', 'AG-60-BP', 2021, 'VF1RFB00X64860148', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(95, 5, 'Renault', 'Megane', 'BZ-42-UV', 2021, 'VF1RFB00666787171', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(96, 5, 'Renault', 'Clio', 'BF-62-BO', 2020, 'VF1R9800264532538', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(97, 5, 'Renault', 'Megane', 'AV-41-DU', 2022, 'VF1RFB00X69827993', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(98, 5, 'Renault', 'Clio', 'BD-69-AS', 2020, 'VF1R9800X65074001', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(99, 5, 'Renault', 'Clio', 'BE-66-US', 2020, 'VF1R9800065074010', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50'),
	(100, 5, 'Dacia', 'Lodgy', 'CE-80-BL', 2022, 'UU1J9220768359177', '', '', 'disponivel', NULL, NULL, NULL, NULL, NULL, '', '2026-03-14 17:45:50', '2026-03-14 17:45:50');

-- A despejar estrutura para tabela carrepairshopgest._prisma_migrations
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest._prisma_migrations: ~4 rows (aproximadamente)
DELETE FROM `_prisma_migrations`;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('4f438081-1daa-43e9-930f-a4724868fb71', '6db9069b8f321e5eca749a7b568329cad856ab2f8c0d6d7bf5682e9f0fbdaeef', '2026-03-14 17:27:25.046', '20260314113754_perfil_id_clientes', NULL, NULL, '2026-03-14 17:27:24.892', 1),
	('4fd14622-a760-4be5-910d-a60c349e364f', '13501556272036a38f3300970c05e8a6170548e959a512a532f208b49dbaadfb', '2026-03-14 17:41:45.896', '20260314174145_remove_nif_unique', NULL, NULL, '2026-03-14 17:41:45.860', 1),
	('bb4b9c58-e4a0-48d6-9198-539b225ac2a0', 'ae8e3f342d94476986898943122d1acb7e54907c61032545615a02cfc3c1ec57', '2026-03-14 17:27:24.890', '20260304233815_dev', NULL, NULL, '2026-03-14 17:27:22.787', 1),
	('d936fc81-37d0-4c02-ac86-6889b4b1e935', 'b58adfd1b3f3eb09edcf19a5f69f64a5199510aa4167a088cf96a37dc8adc1f1', '2026-03-14 17:29:34.373', '20260314172934_fix_categoria_id_pecas', NULL, NULL, '2026-03-14 17:29:34.275', 1);

-- A despejar estrutura para tabela carrepairshopgest.__pagamentos
CREATE TABLE IF NOT EXISTS `__pagamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `fatura_id` int NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `metodo_pagamento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.__pagamentos: ~0 rows (aproximadamente)
DELETE FROM `__pagamentos`;

-- A despejar estrutura para tabela carrepairshopgest.__pecas_ordem_trabalho
CREATE TABLE IF NOT EXISTS `__pecas_ordem_trabalho` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ordem_trabalho_id` int NOT NULL,
  `peca_id` int NOT NULL,
  `quantidade_utilizada` decimal(8,2) NOT NULL,
  `custo_unitario` decimal(10,2) NOT NULL,
  `custo_total` decimal(10,2) NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.__pecas_ordem_trabalho: ~0 rows (aproximadamente)
DELETE FROM `__pecas_ordem_trabalho`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

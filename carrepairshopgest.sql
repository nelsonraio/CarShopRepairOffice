-- --------------------------------------------------------
-- Anfitrião:                    127.0.0.1
-- Versão do servidor:           8.0.41 - MySQL Community Server - GPL
-- SO do servidor:               Win64
-- HeidiSQL Versão:              12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- A despejar estrutura da base de dados para carrepairshopgest
CREATE DATABASE IF NOT EXISTS `carrepairshopgest` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `carrepairshopgest`;

-- A despejar estrutura para tabela carrepairshopgest.agendamentos
CREATE TABLE IF NOT EXISTS `agendamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int NOT NULL,
  `mecanico_id` int DEFAULT NULL,
  `matricula` varchar(50) DEFAULT NULL,
  `titulo` varchar(255) NOT NULL,
  `descricao` text,
  `data_agendamento` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `estado` varchar(20) DEFAULT 'agendado',
  `prioridade` varchar(10) DEFAULT 'normal',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `criado_por` int DEFAULT NULL,
  `atualizado_por` int DEFAULT NULL,
  `marca` varchar(150) DEFAULT NULL,
  `modelo` varchar(150) DEFAULT NULL,
  `ano` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `agendamentos_cliente_id_fkey` (`cliente_id`),
  CONSTRAINT `agendamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `agendamentos_chk_1` CHECK ((`estado` in (_utf8mb4'agendado',_utf8mb4'confirmado',_utf8mb4'em_andamento',_utf8mb4'concluido',_utf8mb4'cancelado',_utf8mb4'nao_compareceu'))),
  CONSTRAINT `agendamentos_chk_2` CHECK ((`prioridade` in (_utf8mb4'baixa',_utf8mb4'normal',_utf8mb4'alta',_utf8mb4'urgente')))
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.agendamentos: ~1 rows (aproximadamente)
DELETE FROM `agendamentos`;
INSERT INTO `agendamentos` (`id`, `cliente_id`, `mecanico_id`, `matricula`, `titulo`, `descricao`, `data_agendamento`, `hora_inicio`, `estado`, `prioridade`, `criado_em`, `atualizado_em`, `criado_por`, `atualizado_por`, `marca`, `modelo`, `ano`) VALUES
	(50, 34, NULL, '99-UU-UU', 'Revisão Geral - Cliente Genérico TVDE Interno', 'Revisão Geral', '2026-02-13', '10:10:00', 'agendado', 'normal', '2026-02-12 10:08:04', '2026-02-12 10:08:04', NULL, NULL, 'Renault', 'Clio', 1976);

-- A despejar estrutura para tabela carrepairshopgest.cartoes_kanban
CREATE TABLE IF NOT EXISTS `cartoes_kanban` (
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
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `cartoes_kanban_chk_1` CHECK ((`prioridade` in (_utf8mb4'baixa',_utf8mb4'normal',_utf8mb4'alta',_utf8mb4'urgente')))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.cartoes_kanban: ~6 rows (aproximadamente)
DELETE FROM `cartoes_kanban`;
INSERT INTO `cartoes_kanban` (`id`, `coluna_id`, `ordem_trabalho_id`, `titulo`, `descricao`, `prioridade`, `atribuido_a`, `data_limite`, `etiquetas`, `posicao`, `criado_em`, `atualizado_em`, `criado_por`, `atualizado_por`) VALUES
	(1, 2, NULL, 'Revisão VW Golf', 'Revisão de 120.000km. Verificar correia de distribuição.', 'normal', 2, '2026-02-01', '["revisao", "mecanica"]', 1, '2026-01-31 19:21:33', '2026-01-31 19:21:33', NULL, NULL),
	(2, 2, NULL, 'Inspeção BMW X5', 'Preparação para inspeção periódica.', 'alta', 3, '2026-02-02', '["inspecao"]', 2, '2026-01-31 19:21:33', '2026-01-31 19:21:33', NULL, NULL),
	(3, 3, NULL, 'Reparação Fiat Punto', 'Diagnóstico de barulho no motor. Cliente relata som metálico em baixas rotações.', 'urgente', 1, '2026-01-31', '["diagnostico", "motor"]', 1, '2026-01-31 19:21:33', '2026-01-31 19:21:33', NULL, NULL),
	(4, 4, NULL, 'Substituição Amortecedores C4', 'Aguardando entrega dos amortecedores traseiros.', 'normal', 2, '2026-02-05', '["suspensao", "pecas"]', 1, '2026-01-31 19:21:33', '2026-01-31 19:21:33', NULL, NULL),
	(5, 1, NULL, 'Orçamento Pintura Mazda', 'Cliente solicitou orçamento para pintura do parachoques traseiro.', 'baixa', NULL, NULL, '["orcamento", "pintura"]', 1, '2026-01-31 19:21:33', '2026-01-31 19:21:33', NULL, NULL),
	(6, 5, 12, 'Inspeção Garantia Toyota', 'Verificação de rotina terminada. Pronto para entrega.', 'normal', 1, '2024-10-30', '["garantia"]', 1, '2026-01-31 19:21:33', '2026-01-31 19:21:33', NULL, NULL);

-- A despejar estrutura para tabela carrepairshopgest.categorias_servico
CREATE TABLE IF NOT EXISTS `categorias_servico` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `duracao_estimada` time DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.categorias_servico: ~4 rows (aproximadamente)
DELETE FROM `categorias_servico`;
INSERT INTO `categorias_servico` (`id`, `nome`, `descricao`, `duracao_estimada`, `ativo`, `criado_em`) VALUES
	(1, 'Manutenção', 'Manutenção preventiva e corretiva', '00:02:00', 1, '2026-01-31 19:26:59'),
	(2, 'Reparação', 'Reparações mecânicas e elétricas', '00:04:00', 1, '2026-01-31 19:26:59'),
	(3, 'Inspeção', 'Inspeções e diagnósticos', '00:01:00', 1, '2026-01-31 19:26:59'),
	(4, 'Substituição', 'Substituição de peças e componentes', '00:03:00', 1, '2026-01-31 19:26:59');

-- A despejar estrutura para tabela carrepairshopgest.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(20) NOT NULL,
  `nif` varchar(20) DEFAULT NULL,
  `endereco` text,
  `perfil` enum('Normal','TVDE Interno','TVDE Externo','Empresa') DEFAULT 'Normal',
  `data_registo` date DEFAULT (curdate()),
  `total_gasto` decimal(10,2) DEFAULT '0.00',
  `visitas` int DEFAULT '0',
  `notas` text,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nif` (`nif`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.clientes: ~12 rows (aproximadamente)
DELETE FROM `clientes`;
INSERT INTO `clientes` (`id`, `nome`, `email`, `telefone`, `nif`, `endereco`, `perfil`, `data_registo`, `total_gasto`, `visitas`, `notas`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 'Joaquim das Couves', 'couves@coiso.pt', '961376093', '200292722', 'qwerqwer', 'TVDE Interno', '2026-02-10', 0.00, 0, NULL, 1, '2026-02-10 20:22:34', '2026-02-10 23:47:50'),
	(23, 'Ze da esquina', 'ze@dali.pt', '9121212121', '2222222222', 'morada do ze', 'TVDE Externo', '2026-02-10', 0.00, 0, NULL, 1, '2026-02-10 20:57:16', '2026-02-10 23:47:44'),
	(26, 'teste 22', 'teste@teste.pt', '9613734342', '123123', 'rua do caneco mais grande 2', 'TVDE Externo', '2026-02-11', 0.00, 0, NULL, 1, '2026-02-11 00:33:05', '2026-02-11 14:59:50'),
	(27, 'terte', NULL, '', NULL, NULL, 'Normal', '2026-02-11', 0.00, 0, NULL, 0, '2026-02-11 17:10:06', '2026-02-12 01:13:04'),
	(28, 'tertert', 'nel@fghf.pt', '345345', '1231234455', 'defadfasdf', 'Normal', '2026-02-11', 0.00, 0, NULL, 0, '2026-02-11 17:28:42', '2026-02-12 01:13:00'),
	(29, 'erterte ertertttte', NULL, '', NULL, NULL, 'Normal', '2026-02-11', 0.00, 0, NULL, 0, '2026-02-11 22:37:58', '2026-02-12 01:12:56'),
	(32, 'Nelson Raio', '234@gmail.com', '961376093', '12312312313', 'rua do caneco', 'TVDE Externo', '2026-02-11', 0.00, 0, NULL, 1, '2026-02-11 22:55:22', '2026-02-11 22:55:22'),
	(34, 'Cliente Genérico TVDE Interno', '', '97123123', '', '', 'TVDE Interno', '2026-02-12', 0.00, 0, NULL, 1, '2026-02-12 08:36:47', '2026-02-12 08:36:47'),
	(36, 'teste 22222', 'nelson@gmail.com', '961376093', '33333333', 'teste', 'TVDE Interno', '2026-02-12', 0.00, 0, NULL, 1, '2026-02-12 10:48:10', '2026-02-12 10:48:10'),
	(37, 'Cliente Genérico Normal', NULL, '', NULL, NULL, 'Normal', '2026-02-12', 0.00, 0, NULL, 1, '2026-02-12 18:41:00', '2026-02-12 18:41:00'),
	(38, 'manuel das couves', NULL, '', NULL, NULL, 'Normal', '2026-02-12', 0.00, 0, NULL, 1, '2026-02-12 18:42:02', '2026-02-12 18:42:02'),
	(39, 'manuel das couves', NULL, '', NULL, NULL, 'Normal', '2026-02-12', 0.00, 0, NULL, 1, '2026-02-12 18:44:20', '2026-02-12 18:44:20');

-- A despejar estrutura para tabela carrepairshopgest.colunas_kanban
CREATE TABLE IF NOT EXISTS `colunas_kanban` (
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

-- A despejar dados para tabela carrepairshopgest.colunas_kanban: ~6 rows (aproximadamente)
DELETE FROM `colunas_kanban`;
INSERT INTO `colunas_kanban` (`id`, `nome`, `descricao`, `posicao`, `cor`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 'A Agendar', 'Serviços aguardando agendamento', 1, '#ef4444', 1, '2026-01-31 18:55:48', '2026-01-31 18:55:48'),
	(2, 'Agendado', 'Serviços agendados', 2, '#f97316', 1, '2026-01-31 18:55:48', '2026-01-31 18:55:48'),
	(3, 'Em Andamento', 'Serviços em execução', 3, '#eab308', 1, '2026-01-31 18:55:48', '2026-01-31 18:55:48'),
	(4, 'Aguardando Peças', 'Serviços aguardando peças', 4, '#22c55e', 1, '2026-01-31 18:55:48', '2026-01-31 18:55:48'),
	(5, 'Pronto', 'Serviços concluídos', 5, '#3b82f6', 1, '2026-01-31 18:55:48', '2026-01-31 18:55:48'),
	(6, 'Entregue', 'Veículos entregues aos clientes', 6, '#8b5cf6', 1, '2026-01-31 18:55:48', '2026-01-31 18:55:48');

-- A despejar estrutura para tabela carrepairshopgest.configuracoes_sistema
CREATE TABLE IF NOT EXISTS `configuracoes_sistema` (
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

-- A despejar dados para tabela carrepairshopgest.configuracoes_sistema: ~6 rows (aproximadamente)
DELETE FROM `configuracoes_sistema`;
INSERT INTO `configuracoes_sistema` (`id`, `chave_configuracao`, `valor_configuracao`, `tipo_configuracao`, `descricao`, `sistema`, `atualizado_em`, `atualizado_por`) VALUES
	(19, 'nome_empresa', 'MQAuto', 'string', 'Nome da empresa', 1, '2026-01-31 18:55:01', NULL),
	(20, 'endereco_empresa', 'Rua das Oficinas, 123, Porto', 'string', 'Endereço da empresa', 1, '2026-01-31 18:55:01', NULL),
	(21, 'telefone_empresa', '351 222 333 444', 'string', 'Telefone da empresa', 1, '2026-01-31 18:55:01', NULL),
	(22, 'email_empresa', 'info@mqauto.pt', 'string', 'Email da empresa', 1, '2026-01-31 18:55:01', NULL),
	(23, 'taxa_imposto', '23.00', 'number', 'Percentagem padrão da taxa de imposto', 1, '2026-01-31 18:55:01', NULL),
	(24, 'moeda', 'EUR', 'string', 'Moeda padrão', 1, '2026-01-31 18:55:01', NULL);

-- A despejar estrutura para tabela carrepairshopgest.faturas
CREATE TABLE IF NOT EXISTS `faturas` (
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

-- A despejar dados para tabela carrepairshopgest.faturas: ~12 rows (aproximadamente)
DELETE FROM `faturas`;
INSERT INTO `faturas` (`id`, `numero_fatura`, `cliente_id`, `ordem_trabalho_id`, `data_emissao`, `data_vencimento`, `data_pagamento`, `estado`, `subtotal`, `valor_imposto`, `valor_desconto`, `valor_total`, `valor_pago`, `notas`, `criado_em`, `atualizado_em`, `criado_por`) VALUES
	(1, 'FAT-2024-001', 1, 1, '2024-10-15', '2024-11-15', NULL, 'paga', 120.00, 27.60, 0.00, 147.60, 147.60, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(2, 'FAT-2024-002', 1, 2, '2024-11-02', '2024-12-02', NULL, 'paga', 85.00, 19.55, 0.00, 104.55, 104.55, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(3, 'FAT-2024-003', 2, 3, '2024-10-28', '2024-11-28', NULL, 'paga', 95.00, 21.85, 0.00, 116.85, 116.85, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(4, 'FAT-2024-004', 3, 4, '2024-09-15', '2024-10-15', NULL, 'paga', 180.00, 41.40, 0.00, 221.40, 221.40, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(5, 'FAT-2024-005', 4, 5, '2024-08-10', '2024-09-10', NULL, 'paga', 120.00, 27.60, 0.00, 147.60, 147.60, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(6, 'FAT-2024-006', 5, 6, '2024-11-05', '2024-12-05', NULL, 'paga', 75.00, 17.25, 0.00, 92.25, 92.25, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(7, 'FAT-2024-007', 5, 7, '2024-10-20', '2024-11-20', NULL, 'paga', 350.00, 80.50, 0.00, 430.50, 430.50, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(8, 'FAT-2024-008', 5, 8, '2024-09-12', '2024-10-12', NULL, 'paga', 45.00, 10.35, 0.00, 55.35, 55.35, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(9, 'FAT-2024-009', 6, 9, '2024-10-18', '2024-11-18', NULL, 'paga', 65.00, 14.95, 0.00, 79.95, 79.95, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(10, 'FAT-2024-010', 7, 10, '2024-09-25', '2024-10-25', NULL, 'paga', 95.00, 21.85, 0.00, 116.85, 116.85, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(11, 'FAT-2024-011', 7, 11, '2024-11-08', '2024-12-08', NULL, 'paga', 140.00, 32.20, 0.00, 172.20, 172.20, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL),
	(12, 'FAT-2024-012', 8, 12, '2024-10-30', '2024-11-30', NULL, 'pendente', 0.00, 0.00, 0.00, 0.00, 0.00, NULL, '2026-01-31 19:29:31', '2026-01-31 19:29:31', NULL);

-- A despejar estrutura para tabela carrepairshopgest.fornecedores
CREATE TABLE IF NOT EXISTS `fornecedores` (
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

-- A despejar dados para tabela carrepairshopgest.fornecedores: ~5 rows (aproximadamente)
DELETE FROM `fornecedores`;
INSERT INTO `fornecedores` (`id`, `nome`, `pessoa_contato`, `email`, `telefone`, `endereco`, `nif`, `termos_pagamento`, `ativo`, `notas`, `criado_em`, `atualizado_em`, `criado_por`) VALUES
	(1, 'Bosch Portugal', NULL, NULL, NULL, NULL, '500123456', NULL, 1, NULL, '2026-01-31 18:55:59', '2026-01-31 18:55:59', NULL),
	(2, 'AutoParts SA', NULL, NULL, NULL, NULL, '500789012', NULL, 1, NULL, '2026-01-31 18:55:59', '2026-01-31 18:55:59', NULL),
	(3, 'LubriNorte', NULL, NULL, NULL, NULL, '500345678', NULL, 1, NULL, '2026-01-31 18:55:59', '2026-01-31 18:55:59', NULL),
	(4, 'NGK Spark Plugs', NULL, NULL, NULL, NULL, '500901234', NULL, 1, NULL, '2026-01-31 18:55:59', '2026-01-31 18:55:59', NULL),
	(5, 'Valeo Service', NULL, NULL, NULL, NULL, '500567890', NULL, 1, NULL, '2026-01-31 18:55:59', '2026-01-31 18:55:59', NULL);

-- A despejar estrutura para tabela carrepairshopgest.historico_cartao_kanban
CREATE TABLE IF NOT EXISTS `historico_cartao_kanban` (
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

-- A despejar dados para tabela carrepairshopgest.historico_cartao_kanban: ~8 rows (aproximadamente)
DELETE FROM `historico_cartao_kanban`;
INSERT INTO `historico_cartao_kanban` (`id`, `cartao_id`, `coluna_origem_id`, `coluna_destino_id`, `movido_por`, `movido_em`, `notas`) VALUES
	(1, 1, NULL, 1, 1, '2026-01-31 19:33:54', 'Cartão criado na coluna A Agendar'),
	(2, 1, 1, 3, 1, '2026-01-31 19:33:54', 'Movido para Em Andamento'),
	(3, 1, 3, 5, 1, '2026-01-31 19:33:54', 'Serviço concluído, movido para Pronto'),
	(4, 2, NULL, 2, 1, '2026-01-31 19:33:54', 'Cartão criado na coluna Agendado'),
	(5, 2, 2, 3, 1, '2026-01-31 19:33:54', 'Movido para Em Andamento'),
	(6, 3, NULL, 2, 1, '2026-01-31 19:33:54', 'Cartão criado na coluna Agendado'),
	(7, 4, NULL, 2, 1, '2026-01-31 19:33:54', 'Cartão criado na coluna Agendado'),
	(8, 5, NULL, 1, 1, '2026-01-31 19:33:54', 'Cartão criado na coluna A Agendar');

-- A despejar estrutura para tabela carrepairshopgest.itens_fatura
CREATE TABLE IF NOT EXISTS `itens_fatura` (
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

-- A despejar dados para tabela carrepairshopgest.itens_fatura: ~12 rows (aproximadamente)
DELETE FROM `itens_fatura`;
INSERT INTO `itens_fatura` (`id`, `fatura_id`, `item_ordem_trabalho_id`, `descricao`, `quantidade`, `preco_unitario`, `valor_desconto`, `valor_imposto`, `valor_total`, `criado_em`) VALUES
	(1, 1, NULL, 'Mudança Óleo + Filtros', 1.00, 120.00, 0.00, 27.60, 147.60, '2026-01-31 19:35:51'),
	(2, 2, NULL, 'Inspeção Periódica', 1.00, 85.00, 0.00, 19.55, 104.55, '2026-01-31 19:35:51'),
	(3, 3, NULL, 'Substituição Pastilhas Travão', 1.00, 95.00, 0.00, 21.85, 116.85, '2026-01-31 19:35:51'),
	(4, 4, NULL, 'Revisão Geral', 1.00, 180.00, 0.00, 41.40, 221.40, '2026-01-31 19:35:51'),
	(5, 5, NULL, 'Substituição Bateria', 1.00, 120.00, 0.00, 27.60, 147.60, '2026-01-31 19:35:51'),
	(6, 6, NULL, 'Mudança Óleo', 1.00, 75.00, 0.00, 17.25, 92.25, '2026-01-31 19:35:51'),
	(7, 7, NULL, 'Reparação Sistema Elétrico', 1.00, 350.00, 0.00, 80.50, 430.50, '2026-01-31 19:35:51'),
	(8, 8, NULL, 'Substituição Escovas Limpa-Vidros', 1.00, 45.00, 0.00, 10.35, 55.35, '2026-01-31 19:35:51'),
	(9, 9, NULL, 'Inspeção Pós-Compra', 1.00, 65.00, 0.00, 14.95, 79.95, '2026-01-31 19:35:51'),
	(10, 10, NULL, 'Substituição Filtros', 1.00, 95.00, 0.00, 21.85, 116.85, '2026-01-31 19:35:51'),
	(11, 11, NULL, 'Revisão 40.000km', 1.00, 140.00, 0.00, 32.20, 172.20, '2026-01-31 19:35:51'),
	(12, 12, NULL, 'Inspeção Garantia', 1.00, 0.00, 0.00, 0.00, 0.00, '2026-01-31 19:35:51');

-- A despejar estrutura para tabela carrepairshopgest.itens_orcamento
CREATE TABLE IF NOT EXISTS `itens_orcamento` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `orcamento_id` bigint NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.itens_orcamento: ~0 rows (aproximadamente)
DELETE FROM `itens_orcamento`;
INSERT INTO `itens_orcamento` (`id`, `orcamento_id`, `tipo_item`, `servico_id`, `peca_id`, `descricao`, `quantidade`, `preco_unitario`, `percentual_desconto`, `valor_desconto`, `percentual_imposto`, `valor_imposto`, `valor_total`, `notas`, `criado_em`) VALUES
	(33, 36, 'servico', NULL, NULL, 'teste', 1.00, 19.99, 0.00, 0.00, 23.00, 0.00, 19.99, NULL, '2026-02-14 01:48:57');

-- A despejar estrutura para tabela carrepairshopgest.itens_ordem_trabalho
CREATE TABLE IF NOT EXISTS `itens_ordem_trabalho` (
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.itens_ordem_trabalho: ~13 rows (aproximadamente)
DELETE FROM `itens_ordem_trabalho`;
INSERT INTO `itens_ordem_trabalho` (`id`, `ordem_trabalho_id`, `tipo_item`, `servico_id`, `peca_id`, `descricao`, `quantidade`, `preco_unitario`, `horas_trabalho`, `tarifa_horaria`, `percentual_desconto`, `valor_desconto`, `percentual_imposto`, `valor_imposto`, `valor_total`, `notas`, `criado_em`) VALUES
	(1, 1, 'servico', NULL, NULL, 'Mudança Óleo  Filtros', 1.00, 120.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 120.00, NULL, '2026-01-31 18:56:41'),
	(2, 2, 'servico', NULL, NULL, 'Inspeção Periódica', 1.00, 85.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 85.00, NULL, '2026-01-31 18:56:41'),
	(3, 3, 'servico', NULL, NULL, 'Substituição Pastilhas Travão', 1.00, 95.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 95.00, NULL, '2026-01-31 18:56:41'),
	(4, 4, 'servico', NULL, NULL, 'Revisão Geral', 1.00, 180.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 180.00, NULL, '2026-01-31 18:56:41'),
	(5, 5, 'servico', NULL, NULL, 'Substituição Bateria', 1.00, 120.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 120.00, NULL, '2026-01-31 18:56:41'),
	(6, 6, 'servico', NULL, NULL, 'Mudança Óleo', 1.00, 75.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 75.00, NULL, '2026-01-31 18:56:41'),
	(7, 7, 'servico', NULL, NULL, 'Reparação Sistema Elétrico', 1.00, 350.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 350.00, NULL, '2026-01-31 18:56:41'),
	(8, 8, 'servico', NULL, NULL, 'Substituição Escovas Limpa-Vidros', 1.00, 45.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 45.00, NULL, '2026-01-31 18:56:41'),
	(9, 9, 'servico', NULL, NULL, 'Inspeção Pós-Compra', 1.00, 65.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 65.00, NULL, '2026-01-31 18:56:41'),
	(10, 10, 'servico', NULL, NULL, 'Substituição Filtros', 1.00, 95.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 95.00, NULL, '2026-01-31 18:56:41'),
	(11, 11, 'servico', NULL, NULL, 'Revisão 40.000km', 1.00, 140.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 140.00, NULL, '2026-01-31 18:56:41'),
	(12, 12, 'servico', NULL, NULL, 'Inspeção Garantia', 1.00, 0.00, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 0.00, NULL, '2026-01-31 18:56:41'),
	(18, 21, 'servico', NULL, NULL, 'teste', 1.00, 19.99, NULL, NULL, 0.00, 0.00, 23.00, 0.00, 19.99, NULL, '2026-02-14 01:49:07');

-- A despejar estrutura para tabela carrepairshopgest.log_auditoria
CREATE TABLE IF NOT EXISTS `log_auditoria` (
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

-- A despejar dados para tabela carrepairshopgest.log_auditoria: ~10 rows (aproximadamente)
DELETE FROM `log_auditoria`;
INSERT INTO `log_auditoria` (`id`, `utilizador_id`, `acao`, `nome_tabela`, `id_registo`, `valores_antigos`, `valores_novos`, `endereco_ip`, `agente_utilizador`, `criado_em`) VALUES
	(1, 1, 'INSERT', 'clientes', 1, NULL, '{"nome": "João Silva", "email": "joao.silva@email.pt"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(2, 1, 'INSERT', 'veiculos', 1, NULL, '{"marca": "Peugeot", "modelo": "308", "matricula": "45-GH-23"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(3, 1, 'UPDATE', 'ordens_trabalho', 1, '{"estado": "em_andamento"}', '{"estado": "concluido"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(4, 1, 'INSERT', 'faturas', 1, NULL, '{"valor_total": 147.6, "numero_fatura": "FAT-2024-001"}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(5, 1, 'UPDATE', 'pecas', 1, '{"quantidade_stock": 50}', '{"quantidade_stock": 45}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(6, 1, 'INSERT', 'orcamentos', 1, NULL, '{"total_geral": 147.6, "numero_orcamento": "ORC-2024-001"}', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(7, 1, 'UPDATE', 'cartoes_kanban', 1, '{"coluna_id": 1}', '{"coluna_id": 3}', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(8, 1, 'INSERT', 'agendamentos', 1, NULL, '{"titulo": "Reparação Fiat Punto", "data_agendamento": "2024-11-01"}', '192.168.1.106', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(9, 1, 'UPDATE', 'clientes', 1, '{"total_gasto": 0.0}', '{"total_gasto": 147.6}', '192.168.1.107', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17'),
	(10, 1, 'INSERT', 'transacoes_pecas', 1, NULL, '{"peca_id": 1, "quantidade": 1, "tipo_transacao": "saida"}', '192.168.1.108', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '2026-01-31 19:40:17');

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
	(1, 'Audi', 'Alemanha', 1, '2026-02-10 16:15:58', '2026-02-10 16:15:58'),
	(2, 'BMW', 'Alemanha', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(3, 'Mercedes-Benz', 'Alemanha', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(4, 'Volkswagen', 'Alemanha', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(5, 'Ford', 'Estados Unidos', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(6, 'Toyota', 'Japão', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(7, 'Honda', 'Japão', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(8, 'Nissan', 'Japão', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(9, 'Peugeot', 'França', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(10, 'Renault', 'França', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(11, 'Citroën', 'França', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(12, 'Fiat', 'Itália', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(13, 'Opel', 'Alemanha', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(14, 'Seat', 'Espanha', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(15, 'Skoda', 'República Checa', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(16, 'Volvo', 'Suécia', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(17, 'Mazda', 'Japão', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(18, 'Kia', 'Coreia do Sul', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(19, 'Hyundai', 'Coreia do Sul', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(20, 'Tesla', 'Estados Unidos', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(21, 'Porsche', 'Alemanha', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(22, 'Land Rover', 'Reino Unido', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(23, 'Jeep', 'Estados Unidos', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04');

-- A despejar estrutura para tabela carrepairshopgest.mecanicos
CREATE TABLE IF NOT EXISTS `mecanicos` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.mecanicos: ~3 rows (aproximadamente)
DELETE FROM `mecanicos`;
INSERT INTO `mecanicos` (`id`, `utilizador_id`, `nome`, `especialidade`, `telefone`, `email`, `tarifa_horaria`, `ativo`, `data_contratacao`, `notas`, `criado_em`, `atualizado_em`) VALUES
	(1, 1, 'Carlos P.', 'Geral', NULL, NULL, 35.00, 1, NULL, NULL, '2026-01-31 18:55:53', '2026-01-31 19:41:11'),
	(2, 1, 'Rui Alves', 'Diagnóstico', NULL, NULL, 40.00, 1, NULL, NULL, '2026-01-31 18:55:53', '2026-01-31 19:41:13'),
	(3, 1, 'Joaquim F.', 'Eletricidade', NULL, NULL, 45.00, 1, NULL, NULL, '2026-01-31 18:55:53', '2026-01-31 19:41:13'),
	(4, 1, 'manel da esquina', 'Eletricidade', NULL, NULL, 45.00, 1, NULL, NULL, '2026-01-31 18:55:53', '2026-02-10 13:41:31');

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
	(1, 1, 'A1', 'Hatchback', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(2, 1, 'A3', 'Hatchback', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(3, 1, 'A4', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(4, 1, 'A5', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(5, 1, 'A6', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(6, 1, 'A7', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(7, 1, 'A8', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(8, 1, 'Q3', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(9, 1, 'Q5', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(10, 1, 'Q7', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(11, 1, 'Q8', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(12, 1, 'TT', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(13, 1, 'R8', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(14, 2, '1 Series', 'Hatchback', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(15, 2, '2 Series', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(16, 2, '3 Series', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(17, 2, '4 Series', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(18, 2, '5 Series', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(19, 2, '6 Series', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(20, 2, '7 Series', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(21, 2, '8 Series', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(22, 2, 'X1', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(23, 2, 'X2', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(24, 2, 'X3', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(25, 2, 'X4', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(26, 2, 'X5', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(27, 2, 'X6', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(28, 2, 'X7', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(29, 2, 'Z4', 'Roadster', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(30, 2, 'i3', 'Hatchback', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(31, 2, 'i8', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(32, 3, 'A-Class', 'Hatchback', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(33, 3, 'B-Class', 'MPV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(34, 3, 'C-Class', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(35, 3, 'E-Class', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(36, 3, 'S-Class', 'Sedan', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(37, 3, 'CLA', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(38, 3, 'CLS', 'Coupe', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(39, 3, 'GLA', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(40, 3, 'GLB', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(41, 3, 'GLC', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(42, 3, 'GLE', 'SUV', 1, '2026-02-10 16:15:59', '2026-02-10 16:15:59'),
	(43, 3, 'GLS', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(44, 3, 'G-Class', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(45, 3, 'SL', 'Roadster', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(46, 3, 'SLC', 'Roadster', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(47, 4, 'Polo', 'Hatchback', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(48, 4, 'Golf', 'Hatchback', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(49, 4, 'Jetta', 'Sedan', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(50, 4, 'Passat', 'Sedan', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(51, 4, 'Arteon', 'Sedan', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(52, 4, 'Tiguan', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(53, 4, 'Touareg', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(54, 4, 'T-Roc', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(55, 4, 'Taos', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(56, 4, 'ID.3', 'Hatchback', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(57, 4, 'ID.4', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(58, 4, 'Scirocco', 'Coupe', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(59, 4, 'Beetle', 'Hatchback', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(60, 5, 'Fiesta', 'Hatchback', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(61, 5, 'Focus', 'Hatchback', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(62, 5, 'Mondeo', 'Sedan', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(63, 5, 'Mustang', 'Coupe', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(64, 5, 'Explorer', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(65, 5, 'Kuga', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(66, 5, 'Puma', 'SUV', 1, '2026-02-10 16:16:00', '2026-02-10 16:16:00'),
	(67, 5, 'Ranger', 'Pickup', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(68, 5, 'Transit', 'Van', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(69, 5, 'F-150', 'Pickup', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(70, 6, 'Yaris', 'Hatchback', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(71, 6, 'Corolla', 'Sedan', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(72, 6, 'Camry', 'Sedan', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(73, 6, 'Prius', 'Hatchback', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(74, 6, 'RAV4', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(75, 6, 'C-HR', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(76, 6, 'Highlander', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(77, 6, 'Land Cruiser', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(78, 6, 'Hilux', 'Pickup', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(79, 6, 'Proace', 'Van', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(80, 6, 'Supra', 'Coupe', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(81, 7, 'Jazz', 'Hatchback', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(82, 7, 'Civic', 'Sedan', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(83, 7, 'Accord', 'Sedan', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(84, 7, 'HR-V', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(85, 7, 'CR-V', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(86, 7, 'Pilot', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(87, 7, 'City', 'Sedan', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(88, 7, 'NSX', 'Coupe', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(89, 8, 'Micra', 'Hatchback', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(90, 8, 'Pulsar', 'Sedan', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(91, 8, 'Qashqai', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(92, 8, 'X-Trail', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(93, 8, 'Juke', 'SUV', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(94, 8, 'Navara', 'Pickup', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(95, 8, 'Leaf', 'Hatchback', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(96, 8, '370Z', 'Coupe', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(97, 8, 'GT-R', 'Coupe', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(98, 9, '108', 'Hatchback', 1, '2026-02-10 16:16:01', '2026-02-10 16:16:01'),
	(99, 9, '208', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(100, 9, '308', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(101, 9, '508', 'Sedan', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(102, 9, '2008', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(103, 9, '3008', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(104, 9, '5008', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(105, 9, 'Partner', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(106, 9, 'Expert', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(107, 9, 'Boxer', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(108, 10, 'Twingo', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(109, 10, 'Clio', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(110, 10, 'Megane', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(111, 10, 'Talisman', 'Sedan', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(112, 10, 'Captur', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(113, 10, 'Kadjar', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(114, 10, 'Koleos', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(115, 10, 'Master', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(116, 10, 'Trafic', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(117, 10, 'Zoe', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(118, 11, 'C1', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(119, 11, 'C3', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(120, 11, 'C4', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(121, 11, 'C5', 'Sedan', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(122, 11, 'C3 Aircross', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(123, 11, 'C5 Aircross', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(124, 11, 'Berlingo', 'MPV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(125, 11, 'Jumpy', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(126, 11, 'Jumper', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(127, 12, '500', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(128, 12, 'Panda', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(129, 12, 'Tipo', 'Sedan', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(130, 12, '500X', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(131, 12, '500L', 'MPV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(132, 12, 'Ducato', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(133, 12, 'Fiorino', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(134, 12, 'Talento', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(135, 13, 'Corsa', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(136, 13, 'Astra', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(137, 13, 'Insignia', 'Sedan', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(138, 13, 'Crossland', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(139, 13, 'Grandland', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(140, 13, 'Mokka', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(141, 13, 'Vivaro', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(142, 13, 'Movano', 'Van', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(143, 14, 'Ibiza', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(144, 14, 'Leon', 'Hatchback', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(145, 14, 'Arona', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(146, 14, 'Ateca', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(147, 14, 'Tarraco', 'SUV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(148, 14, 'Alhambra', 'MPV', 1, '2026-02-10 16:16:02', '2026-02-10 16:16:02'),
	(149, 15, 'Fabia', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(150, 15, 'Scala', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(151, 15, 'Octavia', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(152, 15, 'Superb', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(153, 15, 'Kamiq', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(154, 15, 'Karoq', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(155, 15, 'Kodiaq', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(156, 15, 'Enyaq', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(157, 16, 'S60', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(158, 16, 'S90', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(159, 16, 'V60', 'Wagon', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(160, 16, 'V90', 'Wagon', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(161, 16, 'XC40', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(162, 16, 'XC60', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(163, 16, 'XC90', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(164, 16, 'C40', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(165, 17, 'Mazda2', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(166, 17, 'Mazda3', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(167, 17, 'Mazda6', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(168, 17, 'CX-3', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(169, 17, 'CX-30', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(170, 17, 'CX-5', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(171, 17, 'CX-9', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(172, 17, 'MX-5', 'Roadster', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(173, 18, 'Picanto', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(174, 18, 'Rio', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(175, 18, 'Ceed', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(176, 18, 'Optima', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(177, 18, 'Stinger', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(178, 18, 'Sportage', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(179, 18, 'Sorento', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(180, 18, 'Carnival', 'MPV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(181, 18, 'EV6', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(182, 19, 'i10', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(183, 19, 'i20', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(184, 19, 'i30', 'Hatchback', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(185, 19, 'Elantra', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(186, 19, 'Sonata', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(187, 19, 'Kona', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(188, 19, 'Tucson', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(189, 19, 'Santa Fe', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(190, 19, 'Palisade', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(191, 19, 'Ioniq 5', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(192, 20, 'Model 3', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(193, 20, 'Model S', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(194, 20, 'Model X', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(195, 20, 'Model Y', 'SUV', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(196, 20, 'Cybertruck', 'Pickup', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(197, 21, '718 Boxster', 'Roadster', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(198, 21, '718 Cayman', 'Coupe', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(199, 21, '911', 'Coupe', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(200, 21, 'Panamera', 'Sedan', 1, '2026-02-10 16:16:03', '2026-02-10 16:16:03'),
	(201, 21, 'Macan', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(202, 21, 'Cayenne', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(203, 21, 'Taycan', 'Sedan', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(204, 22, 'Defender', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(205, 22, 'Discovery', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(206, 22, 'Discovery Sport', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(207, 22, 'Range Rover', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(208, 22, 'Range Rover Sport', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(209, 22, 'Range Rover Velar', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(210, 22, 'Range Rover Evoque', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(211, 23, 'Renegade', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(212, 23, 'Compass', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(213, 23, 'Cherokee', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(214, 23, 'Grand Cherokee', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(215, 23, 'Wrangler', 'SUV', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04'),
	(216, 23, 'Gladiator', 'Pickup', 1, '2026-02-10 16:16:04', '2026-02-10 16:16:04');

-- A despejar estrutura para tabela carrepairshopgest.orcamentos
CREATE TABLE IF NOT EXISTS `orcamentos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ref_orcamento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `cliente_id` int NOT NULL,
  `veiculo_id` bigint NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.orcamentos: ~0 rows (aproximadamente)
DELETE FROM `orcamentos`;
INSERT INTO `orcamentos` (`id`, `ref_orcamento`, `cliente_id`, `veiculo_id`, `preparado_por`, `data_emissao`, `data_expiracao`, `estado`, `total_pecas`, `total_mao_obra`, `total_desconto`, `total_imposto`, `total_geral`, `notas`, `data_aprovacao`, `aprovado_por`, `criado_em`, `atualizado_em`) VALUES
	(36, 'OR-2026-TVDE0001', 34, 55, NULL, '2026-02-14', NULL, 'Aprovado', 0.00, 19.99, 0.00, 0.00, 19.99, '', '2026-02-14', NULL, '2026-02-14 01:48:57', '2026-02-14 01:48:57');

-- A despejar estrutura para tabela carrepairshopgest.ordens_trabalho
CREATE TABLE IF NOT EXISTS `ordens_trabalho` (
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.ordens_trabalho: ~0 rows (aproximadamente)
DELETE FROM `ordens_trabalho`;
INSERT INTO `ordens_trabalho` (`id`, `ref_ordem_trabalho`, `cliente_id`, `veiculo_id`, `mecanico_id`, `orcamento_id`, `agendamento_id`, `data_inicio`, `data_conclusao`, `estado`, `quilometragem_servico`, `descricao_problema`, `trabalho_realizado`, `recomendacoes`, `total_pecas`, `total_mao_obra`, `total_desconto`, `total_imposto`, `total_geral`, `criado_em`, `atualizado_em`, `criado_por`, `atualizado_por`) VALUES
	(21, 'OR-2026-TVDE0001', 34, 55, 1, 36, NULL, '2026-02-14', NULL, 'em_andamento', NULL, NULL, NULL, NULL, 0.00, 19.99, 0.00, 0.00, 19.99, '2026-02-14 01:49:07', '2026-02-14 01:49:07', NULL, NULL);

-- A despejar estrutura para tabela carrepairshopgest.pagamentos
CREATE TABLE IF NOT EXISTS `pagamentos` (
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

-- A despejar dados para tabela carrepairshopgest.pagamentos: ~0 rows (aproximadamente)
DELETE FROM `pagamentos`;

-- A despejar estrutura para tabela carrepairshopgest.pecas
CREATE TABLE IF NOT EXISTS `pecas` (
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

-- A despejar dados para tabela carrepairshopgest.pecas: ~10 rows (aproximadamente)
DELETE FROM `pecas`;
INSERT INTO `pecas` (`id`, `referencia`, `nome`, `descricao`, `categoria`, `fornecedor_id`, `custo_unitario`, `preco_venda`, `quantidade_stock`, `nivel_stock_minimo`, `nivel_stock_maximo`, `localizacao`, `veiculos_compativeis`, `ativo`, `notas`, `criado_em`, `atualizado_em`, `criado_por`) VALUES
	(1, 'BOS-0986452058', 'Filtro de Óleo Bosch', NULL, 'filtros', 1, 6.00, 12.50, 45, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(2, 'BRE-P85020', 'Pastilhas Travão Brembo (Frente)', NULL, 'travoes', 2, 25.00, 45.90, 4, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(3, 'CAS-EDGE-5W30', 'Óleo Castrol Edge 5W30 (5L)', NULL, 'motor', 3, 30.00, 55.00, 12, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(4, 'NGK-96588', 'Vela de Ignição NGK Laser Iridium', NULL, 'motor', 4, 8.00, 18.20, 0, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(5, 'VAL-574623', 'Escovas Limpa-Vidros Valeo Silencio', NULL, 'acessorios', 5, 15.00, 28.50, 20, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(6, 'BAT-12V-70AH', 'Bateria 12V 70AH', NULL, 'sistema-eletrico', 2, 60.00, 100.00, 5, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(7, 'ALT-12V-120A', 'Alternador 12V 120A', NULL, 'sistema-eletrico', 2, 150.00, 250.00, 2, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(8, 'COR-V-RIBBED', 'Correia de Acessórios', NULL, 'motor', 1, 10.00, 25.00, 10, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(9, 'FIL-AIR-308', 'Filtro de Ar Peugeot 308', NULL, 'filtros', 1, 8.00, 15.00, 8, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL),
	(10, 'FIL-FUEL-308', 'Filtro de Combustível Peugeot 308', NULL, 'filtros', 1, 12.00, 25.00, 6, 0, NULL, NULL, NULL, 1, NULL, '2026-01-31 18:56:09', '2026-01-31 18:56:09', NULL);

-- A despejar estrutura para tabela carrepairshopgest.pecas_ordem_trabalho
CREATE TABLE IF NOT EXISTS `pecas_ordem_trabalho` (
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

-- A despejar dados para tabela carrepairshopgest.pecas_ordem_trabalho: ~16 rows (aproximadamente)
DELETE FROM `pecas_ordem_trabalho`;
INSERT INTO `pecas_ordem_trabalho` (`id`, `ordem_trabalho_id`, `peca_id`, `quantidade_utilizada`, `custo_unitario`, `custo_total`, `notas`, `criado_em`) VALUES
	(1, 1, 1, 1.00, 6.00, 6.00, NULL, '2026-01-31 18:56:50'),
	(2, 1, 3, 1.00, 30.00, 30.00, NULL, '2026-01-31 18:56:50'),
	(3, 3, 2, 1.00, 25.00, 25.00, NULL, '2026-01-31 18:56:50'),
	(4, 4, 1, 1.00, 6.00, 6.00, NULL, '2026-01-31 18:56:50'),
	(5, 4, 3, 1.00, 30.00, 30.00, NULL, '2026-01-31 18:56:50'),
	(6, 4, 4, 4.00, 8.00, 32.00, NULL, '2026-01-31 18:56:50'),
	(7, 5, 6, 1.00, 60.00, 60.00, NULL, '2026-01-31 18:56:50'),
	(8, 6, 3, 1.00, 30.00, 30.00, NULL, '2026-01-31 18:56:50'),
	(9, 7, 7, 1.00, 150.00, 150.00, NULL, '2026-01-31 18:56:50'),
	(10, 7, 8, 1.00, 10.00, 10.00, NULL, '2026-01-31 18:56:50'),
	(11, 8, 5, 1.00, 15.00, 15.00, NULL, '2026-01-31 18:56:50'),
	(12, 10, 1, 1.00, 6.00, 6.00, NULL, '2026-01-31 18:56:50'),
	(13, 10, 9, 1.00, 8.00, 8.00, NULL, '2026-01-31 18:56:50'),
	(14, 10, 10, 1.00, 12.00, 12.00, NULL, '2026-01-31 18:56:50'),
	(15, 11, 3, 1.00, 30.00, 30.00, NULL, '2026-01-31 18:56:50'),
	(16, 11, 1, 1.00, 6.00, 6.00, NULL, '2026-01-31 18:56:50');

-- A despejar estrutura para tabela carrepairshopgest.perfis_clientes
CREATE TABLE IF NOT EXISTS `perfis_clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `desconto` decimal(5,2) NOT NULL DEFAULT '0.00',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome_perfil` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A despejar dados para tabela carrepairshopgest.perfis_clientes: ~4 rows (aproximadamente)
DELETE FROM `perfis_clientes`;
INSERT INTO `perfis_clientes` (`id`, `nome`, `descricao`, `desconto`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(1, 'Normal', 'Cliente normal sem desconto', 0.00, 1, '2026-02-10 18:51:32', '2026-02-10 18:51:32'),
	(2, 'TVDE Interno', 'Motorista TVDE interno com desconto de 10%', 10.00, 1, '2026-02-10 18:51:32', '2026-02-10 18:51:32'),
	(3, 'TVDE Externo', 'Motorista TVDE externo com desconto de 5%', 5.00, 1, '2026-02-10 18:51:32', '2026-02-10 18:51:32'),
	(4, 'Empresa', 'Cliente empresa com desconto de 15%', 15.00, 1, '2026-02-10 18:51:32', '2026-02-10 18:51:32');

-- A despejar estrutura para tabela carrepairshopgest.servicos
CREATE TABLE IF NOT EXISTS `servicos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` int DEFAULT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `preco_base` decimal(10,2) DEFAULT NULL,
  `duracao_estimada` varchar(8) DEFAULT NULL,
  `requer_pecas` tinyint(1) DEFAULT '0',
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.servicos: ~20 rows (aproximadamente)
DELETE FROM `servicos`;
INSERT INTO `servicos` (`id`, `categoria_id`, `nome`, `descricao`, `preco_base`, `duracao_estimada`, `requer_pecas`, `ativo`, `criado_em`, `atualizado_em`) VALUES
	(11, NULL, 'Revisão Geral', 'Revisão completa do veículo incluindo verificação de fluidos, filtros, freios e sistema elétrico', 150.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(12, NULL, 'Mudança de Óleo', 'Substituição do óleo do motor e filtros de óleo', 45.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(13, NULL, 'Substituição de Travões', 'Substituição de pastilhas, discos ou tambores de travão', 120.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(14, NULL, 'Diagnóstico Eletrónico', 'Diagnóstico completo do sistema elétrico e computador de bordo', 85.00, NULL, 0, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(15, NULL, 'Substituição de Bateria', 'Substituição da bateria do veículo', 65.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(16, NULL, 'Alinhamento e Balanceamento', 'Alinhamento das rodas e balanceamento de pneus', 55.00, NULL, 0, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(17, NULL, 'Substituição de Filtros', 'Substituição de filtros de ar, combustível e habitáculo', 35.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(18, NULL, 'Reparação de Motor', 'Diagnóstico e reparação de problemas no motor', 0.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(19, NULL, 'Inspeção Pré-Compra', 'Inspeção completa para compra de veículo usado', 85.00, NULL, 0, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(20, NULL, 'Substituição de Amortecedores', 'Substituição dos amortecedores dianteiros e traseiros', 180.00, NULL, 1, 1, '2026-02-10 14:04:39', '2026-02-10 14:04:39'),
	(41, NULL, 'Revisão Geral', 'Revisão completa do veículo incluindo verificação de fluidos, filtros, freios e sistema elétrico', 150.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(42, NULL, 'Mudança de Óleo', 'Substituição do óleo do motor e filtros de óleo', 45.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(43, NULL, 'Substituição de Travões', 'Substituição de pastilhas, discos ou tambores de travão', 120.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(44, NULL, 'Diagnóstico Eletrónico', 'Diagnóstico completo do sistema elétrico e computador de bordo', 85.00, NULL, 0, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(45, NULL, 'Substituição de Bateria', 'Substituição da bateria do veículo', 65.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(46, NULL, 'Alinhamento e Balanceamento', 'Alinhamento das rodas e balanceamento de pneus', 55.00, NULL, 0, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(47, NULL, 'Substituição de Filtros', 'Substituição de filtros de ar, combustível e habitáculo', 35.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(48, NULL, 'Reparação de Motor', 'Diagnóstico e reparação de problemas no motor', 0.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(49, NULL, 'Inspeção Pré-Compra', 'Inspeção completa para compra de veículo usado', 85.00, NULL, 0, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57'),
	(50, NULL, 'Substituição de Amortecedores', 'Substituição dos amortecedores dianteiros e traseiros', 180.00, NULL, 1, 1, '2026-02-12 13:39:57', '2026-02-12 13:39:57');

-- A despejar estrutura para tabela carrepairshopgest.transacoes_pecas
CREATE TABLE IF NOT EXISTS `transacoes_pecas` (
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

-- A despejar dados para tabela carrepairshopgest.transacoes_pecas: ~0 rows (aproximadamente)
DELETE FROM `transacoes_pecas`;

-- A despejar estrutura para tabela carrepairshopgest.utilizadores
CREATE TABLE IF NOT EXISTS `utilizadores` (
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

-- A despejar dados para tabela carrepairshopgest.utilizadores: ~0 rows (aproximadamente)
DELETE FROM `utilizadores`;

-- A despejar estrutura para tabela carrepairshopgest.veiculos
CREATE TABLE IF NOT EXISTS `veiculos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int DEFAULT NULL,
  `marca` varchar(50) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `matricula` varchar(20) NOT NULL,
  `ano` int DEFAULT NULL,
  `numero_chassis` varchar(17) DEFAULT NULL,
  `tipo_motor` varchar(50) DEFAULT NULL,
  `tipo_combustivel` varchar(20) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'disponivel',
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
  KEY `veiculos_cliente_id_fkey` (`cliente_id`),
  CONSTRAINT `veiculos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `veiculos_chk_1` CHECK ((`ano` >= 1900)),
  CONSTRAINT `veiculos_chk_2` CHECK ((`tipo_combustivel` in (_utf8mb4'Gasolina',_utf8mb4'Gasóleo',_utf8mb4'Elétrico',_utf8mb4'Híbrido'))),
  CONSTRAINT `veiculos_chk_3` CHECK ((`estado` in (_utf8mb4'na_oficina',_utf8mb4'disponivel',_utf8mb4'vendido',_utf8mb4'abandonado')))
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- A despejar dados para tabela carrepairshopgest.veiculos: ~18 rows (aproximadamente)
DELETE FROM `veiculos`;
INSERT INTO `veiculos` (`id`, `cliente_id`, `marca`, `modelo`, `matricula`, `ano`, `numero_chassis`, `tipo_motor`, `tipo_combustivel`, `estado`, `ultima_intervencao`, `proxima_revisao`, `companhia_seguros`, `apolice_seguro`, `validade_seguro`, `notas`, `criado_em`, `atualizado_em`) VALUES
	(3, 23, 'Audi', 'A4', '20-XX-45', 2019, NULL, NULL, NULL, 'disponivel', '2024-10-28', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(4, 1, 'BMW', 'X5', '78-AB-91', 2020, NULL, NULL, NULL, 'disponivel', '2024-09-15', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(5, 23, 'Renault', 'Clio', '34-CD-56', 2017, NULL, NULL, NULL, 'disponivel', '2024-08-10', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(6, 1, 'Mercedes-Benz', 'C-Class', '56-EF-78', 2021, NULL, NULL, NULL, 'disponivel', '2024-11-05', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(7, 23, 'Volkswagen', 'Golf', '89-GH-12', 2016, NULL, NULL, NULL, 'na_oficina', '2024-10-20', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(8, 1, 'Opel', 'Astra', '67-IJ-34', 2019, NULL, NULL, NULL, 'disponivel', '2024-09-12', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(9, 1, 'Seat', 'Leon', '23-KL-56', 2022, NULL, NULL, NULL, 'disponivel', '2024-10-18', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(10, 23, 'Citroën', 'C4', '45-MN-78', 2015, NULL, NULL, NULL, 'disponivel', '2024-09-25', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(11, 1, 'Nissan', 'Qashqai', '12-OP-90', 2018, NULL, NULL, NULL, 'disponivel', '2024-11-08', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(12, 23, 'Toyota', 'Corolla', '78-QR-12', 2023, NULL, NULL, NULL, 'disponivel', '2024-10-30', NULL, NULL, NULL, NULL, NULL, '2026-01-31 18:56:22', '2026-01-31 18:56:22'),
	(32, 1, 'Fiat', 'Panda', 'XX-13-13', 2019, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-10 21:41:14', '2026-02-10 21:41:14'),
	(34, 1, 'Ford', 'Explorer', 'AA-11-22', 2020, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-10 21:50:45', '2026-02-10 21:50:45'),
	(36, 1, 'Renault', 'Kadjar', 'XX-II-11', 2010, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 00:33:05', '2026-02-11 11:14:08'),
	(37, 1, 'Renault', 'Clio', 'XX-11-55', 2011, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 16:28:47', '2026-02-11 16:28:47'),
	(39, 1, 'Tesla', 'Cybertruck', '11-11-11', 3333, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 17:20:48', '2026-02-11 18:05:11'),
	(50, 1, 'Toyota', 'Corolla', 'AA-12-BB', 2020, NULL, 'Gasolina', 'Gasolina', 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 13:39:39', '2026-02-12 18:36:39'),
	(55, 34, 'Renault', 'Clio', '99-UU-UU', 1976, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 17:30:36', '2026-02-12 17:30:36'),
	(56, 39, 'Volkswagen', 'Golf', 'CC-CC-CC', 2000, NULL, NULL, NULL, 'disponivel', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-12 18:44:20', '2026-02-12 18:44:20');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

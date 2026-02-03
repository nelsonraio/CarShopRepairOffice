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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

-- A despejar estrutura para tabela carrepairshopgest.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

-- A despejar estrutura para tabela carrepairshopgest.itens_orcamento
CREATE TABLE IF NOT EXISTS `itens_orcamento` (
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

-- Exportação de dados não seleccionada.

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Exportação de dados não seleccionada.

-- A despejar estrutura para tabela carrepairshopgest.orcamentos
CREATE TABLE IF NOT EXISTS `orcamentos` (
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

-- Exportação de dados não seleccionada.

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

-- A despejar estrutura para tabela carrepairshopgest.servicos
CREATE TABLE IF NOT EXISTS `servicos` (
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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

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

-- Exportação de dados não seleccionada.

-- A despejar estrutura para tabela carrepairshopgest.veiculos
CREATE TABLE IF NOT EXISTS `veiculos` (
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

-- Exportação de dados não seleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

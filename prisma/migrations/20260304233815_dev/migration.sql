-- CreateTable
CREATE TABLE `agendamentos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cliente_id` INTEGER NOT NULL,
    `mecanico_id` INTEGER NULL,
    `matricula` VARCHAR(50) NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `data_agendamento` DATE NOT NULL,
    `hora_inicio` TIME(0) NOT NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'agendado',
    `prioridade` VARCHAR(10) NULL DEFAULT 'normal',
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,
    `atualizado_por` INTEGER NULL,
    `marca` VARCHAR(150) NULL,
    `modelo` VARCHAR(150) NULL,
    `ano` INTEGER NULL,
    `contacto_nome` VARCHAR(100) NULL,
    `contacto_telefone` VARCHAR(20) NULL,
    `contacto_email` VARCHAR(255) NULL,
    UNIQUE INDEX `id`(`id`),
    INDEX `agendamentos_cliente_id_fkey`(`cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cartoes_kanban` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `coluna_id` INTEGER NOT NULL,
    `ordem_trabalho_id` INTEGER NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `prioridade` VARCHAR(10) NULL DEFAULT 'normal',
    `atribuido_a` INTEGER NULL,
    `data_limite` DATE NULL,
    `etiquetas` TEXT NULL,
    `posicao` INTEGER NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,
    `atualizado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias_servico` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `duracao_estimada` TIME(0) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `nif` VARCHAR(20) NULL,
    `endereco` TEXT NULL,
    `perfil` ENUM('Normal', 'TVDE Interno', 'TVDE Externo', 'Empresa') NULL DEFAULT 'Normal',
    `data_registo` DATE NULL DEFAULT (curdate()),
    `total_gasto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `visitas` INTEGER NULL DEFAULT 0,
    `notas` TEXT NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nif`(`nif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colunas_kanban` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` TEXT NULL,
    `posicao` INTEGER NOT NULL,
    `cor` VARCHAR(7) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracoes_sistema` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `chave_configuracao` VARCHAR(100) NOT NULL,
    `valor_configuracao` TEXT NULL,
    `tipo_configuracao` VARCHAR(20) NULL DEFAULT 'string',
    `descricao` TEXT NULL,
    `sistema` BOOLEAN NULL DEFAULT false,
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `chave_configuracao`(`chave_configuracao`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faturas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `numero_fatura` VARCHAR(20) NOT NULL,
    `cliente_id` INTEGER NOT NULL,
    `ordem_trabalho_id` INTEGER NULL,
    `data_emissao` DATE NULL,
    `data_vencimento` DATE NULL,
    `data_pagamento` DATE NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'pendente',
    `subtotal` DECIMAL(10, 2) NOT NULL,
    `valor_imposto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `valor_desconto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `valor_total` DECIMAL(10, 2) NOT NULL,
    `valor_pago` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `numero_fatura`(`numero_fatura`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `pessoa_contato` VARCHAR(100) NULL,
    `email` VARCHAR(255) NULL,
    `telefone` VARCHAR(20) NULL,
    `endereco` TEXT NULL,
    `nif` VARCHAR(20) NULL,
    `termos_pagamento` VARCHAR(50) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historico_cartao_kanban` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cartao_id` INTEGER NOT NULL,
    `coluna_origem_id` INTEGER NULL,
    `coluna_destino_id` INTEGER NOT NULL,
    `movido_por` INTEGER NULL,
    `movido_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `notas` TEXT NULL,

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_fatura` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fatura_id` INTEGER NOT NULL,
    `item_ordem_trabalho_id` INTEGER NULL,
    `descricao` TEXT NOT NULL,
    `quantidade` DECIMAL(8, 2) NULL DEFAULT 1.00,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `valor_desconto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `valor_imposto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `valor_total` DECIMAL(10, 2) NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_orcamento` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `orcamento_id` BIGINT UNSIGNED NOT NULL,
    `tipo_item` VARCHAR(20) NOT NULL,
    `servico_id` INTEGER NULL,
    `peca_id` INTEGER NULL,
    `descricao` TEXT NOT NULL,
    `quantidade` DECIMAL(8, 2) NULL DEFAULT 1.00,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `percentual_desconto` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `valor_desconto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `percentual_imposto` DECIMAL(5, 2) NULL DEFAULT 23.00,
    `valor_imposto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `valor_total` DECIMAL(10, 2) NOT NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    INDEX `itens_orcamento_orcamento_id_fkey`(`orcamento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_ordem_trabalho` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ordem_trabalho_id` BIGINT UNSIGNED NULL,
    `tipo_item` VARCHAR(20) NOT NULL,
    `servico_id` INTEGER NULL,
    `peca_id` INTEGER NULL,
    `descricao` TEXT NOT NULL,
    `quantidade` DECIMAL(8, 2) NULL DEFAULT 1.00,
    `preco_unitario` DECIMAL(10, 2) NOT NULL,
    `horas_trabalho` DECIMAL(6, 2) NULL,
    `tarifa_horaria` DECIMAL(8, 2) NULL,
    `percentual_desconto` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `valor_desconto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `percentual_imposto` DECIMAL(5, 2) NULL DEFAULT 23.00,
    `valor_imposto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `valor_total` DECIMAL(10, 2) NOT NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `aguarda_peca` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_auditoria` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `utilizador_id` INTEGER NULL,
    `acao` VARCHAR(100) NOT NULL,
    `nome_tabela` VARCHAR(50) NULL,
    `id_registo` INTEGER NULL,
    `valores_antigos` JSON NULL,
    `valores_novos` JSON NULL,
    `endereco_ip` VARCHAR(100) NULL,
    `agente_utilizador` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marcas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `pais_origem` VARCHAR(50) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nome_marca`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modelos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marca_id` INTEGER NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `tipo_veiculo` VARCHAR(50) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `modelos_marca_id_fkey`(`marca_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mecanicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilizador_id` INTEGER NULL,
    `nome` VARCHAR(100) NOT NULL,
    `especialidade` VARCHAR(100) NULL,
    `telefone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `tarifa_horaria` DECIMAL(8, 2) NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `data_contratacao` DATE NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orcamentos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ref_orcamento` VARCHAR(20) NOT NULL,
    `cliente_id` INTEGER NOT NULL,
    `veiculo_id` BIGINT UNSIGNED NOT NULL,
    `preparado_por` INTEGER NULL,
    `data_emissao` DATE NULL,
    `data_expiracao` DATE NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'pendente',
    `total_pecas` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_mao_obra` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_desconto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_imposto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_geral` DECIMAL(10, 2) NOT NULL,
    `notas` TEXT NULL,
    `data_aprovacao` DATE NULL,
    `aprovado_por` INTEGER NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `kms` INTEGER NULL,
    `contacto_nome` VARCHAR(100) NULL,
    `contacto_telefone` VARCHAR(20) NULL,
    `contacto_email` VARCHAR(255) NULL,

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `numero_orcamento`(`ref_orcamento`),
    INDEX `orcamentos_cliente_id_fkey`(`cliente_id`),
    INDEX `orcamentos_veiculo_id_fkey`(`veiculo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ordens_trabalho` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ref_ordem_trabalho` VARCHAR(20) NOT NULL,
    `cliente_id` INTEGER NOT NULL,
    `veiculo_id` BIGINT UNSIGNED NOT NULL,
    `mecanico_id` INTEGER NULL,
    `orcamento_id` BIGINT UNSIGNED NULL,
    `agendamento_id` BIGINT UNSIGNED NULL,
    `data_inicio` DATE NULL,
    `data_conclusao` DATE NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'em_andamento',
    `quilometragem_servico` INTEGER NULL,
    `descricao_problema` TEXT NULL,
    `trabalho_realizado` TEXT NULL,
    `recomendacoes` TEXT NULL,
    `total_pecas` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_mao_obra` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_desconto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_imposto` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_geral` DECIMAL(10, 2) NOT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,
    `atualizado_por` INTEGER NULL,
    `prioridade` VARCHAR(20) NULL DEFAULT 'normal',
    `contacto_nome` VARCHAR(100) NULL,
    `contacto_telefone` VARCHAR(20) NULL,
    `contacto_email` VARCHAR(255) NULL,
    `kms` INTEGER NULL,
    `fatura_id` BIGINT NULL,

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `numero_ordem_trabalho`(`ref_ordem_trabalho`),
    INDEX `ordens_trabalho_cliente_id_idx`(`cliente_id`),
    INDEX `ordens_trabalho_mecanico_id_idx`(`mecanico_id`),
    INDEX `ordens_trabalho_orcamento_id_idx`(`orcamento_id`),
    INDEX `ordens_trabalho_veiculo_id_idx`(`veiculo_id`),
    INDEX `ordens_trabalho_agendamento_id_idx`(`agendamento_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamentos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `fatura_id` INTEGER NOT NULL,
    `data_pagamento` DATE NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `metodo_pagamento` VARCHAR(50) NOT NULL,
    `referencia` VARCHAR(100) NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `referencia` VARCHAR(50) NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `categoria` VARCHAR(50) NOT NULL,
    `fornecedor_id` INTEGER NULL,
    `custo_unitario` DECIMAL(10, 2) NOT NULL,
    `preco_venda` DECIMAL(10, 2) NOT NULL,
    `quantidade_stock` INTEGER NULL DEFAULT 0,
    `nivel_stock_minimo` INTEGER NULL DEFAULT 0,
    `nivel_stock_maximo` INTEGER NULL,
    `localizacao` VARCHAR(100) NULL,
    `veiculos_compativeis` TEXT NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `notas` TEXT NULL,
    `margem_lucro` DECIMAL(5, 2) NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `referencia`(`referencia`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pecas_ordem_trabalho` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ordem_trabalho_id` INTEGER NOT NULL,
    `peca_id` INTEGER NOT NULL,
    `quantidade_utilizada` DECIMAL(8, 2) NOT NULL,
    `custo_unitario` DECIMAL(10, 2) NOT NULL,
    `custo_total` DECIMAL(10, 2) NOT NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `categoria_id` INTEGER NULL,
    `nome` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `preco_base` DECIMAL(10, 2) NULL,
    `duracao_estimada` VARCHAR(8) NULL,
    `requer_pecas` BOOLEAN NULL DEFAULT false,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `keystart` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chave` VARCHAR(255) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `atualizado_em` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transacoes_pecas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `peca_id` INTEGER NOT NULL,
    `tipo_transacao` VARCHAR(20) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `custo_unitario` DECIMAL(10, 2) NULL,
    `custo_total` DECIMAL(10, 2) NULL,
    `documento_referencia` VARCHAR(50) NULL,
    `fornecedor_id` INTEGER NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `utilizadores` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_utilizador` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `hash_palavra_passe` VARCHAR(255) NOT NULL,
    `nome_completo` VARCHAR(100) NOT NULL,
    `papel` ENUM('admin', 'gestor', 'mecanico', 'rececionista') NOT NULL,
    `ativo` BOOLEAN NULL DEFAULT true,
    `ultimo_login` TIMESTAMP(0) NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nome_utilizador`(`nome_utilizador`),
    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `veiculos` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cliente_id` INTEGER NULL,
    `marca` VARCHAR(50) NOT NULL,
    `modelo` VARCHAR(50) NOT NULL,
    `matricula` VARCHAR(20) NOT NULL,
    `ano` INTEGER NULL,
    `numero_chassis` VARCHAR(17) NULL,
    `tipo_motor` VARCHAR(50) NULL,
    `tipo_combustivel` VARCHAR(20) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'disponivel',
    `ultima_intervencao` DATE NULL,
    `proxima_revisao` DATE NULL,
    `companhia_seguros` VARCHAR(100) NULL,
    `apolice_seguro` VARCHAR(50) NULL,
    `validade_seguro` DATE NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `matricula`(`matricula`),
    UNIQUE INDEX `numero_chassis`(`numero_chassis`),
    INDEX `veiculos_cliente_id_fkey`(`cliente_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis_clientes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `descricao` TEXT NULL,
    `perclucro` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `ativo` BOOLEAN NULL DEFAULT true,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `nome_perfil`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `encomendas_pecas` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `numero_encomenda` VARCHAR(20) NOT NULL,
    `fornecedor_id` INTEGER NOT NULL,
    `data_encomenda` DATE NOT NULL,
    `data_entrega_estimada` DATE NULL,
    `data_entrega_real` DATE NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'pendente',
    `custo_total` DECIMAL(10, 2) NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `criado_por` INTEGER NULL,

    UNIQUE INDEX `id`(`id`),
    UNIQUE INDEX `numero_encomenda`(`numero_encomenda`),
    INDEX `estado`(`estado`),
    INDEX `fornecedor_id`(`fornecedor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itens_encomenda_peca` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `encomenda_id` BIGINT UNSIGNED NOT NULL,
    `peca_id` BIGINT UNSIGNED NOT NULL,
    `quantidade_encomendada` INTEGER NOT NULL,
    `quantidade_recebida` INTEGER NULL DEFAULT 0,
    `preco_unitario` DECIMAL(10, 2) NULL,
    `preco_total` DECIMAL(10, 2) NULL,
    `estado` VARCHAR(20) NULL DEFAULT 'pendente',
    `ordem_trabalho_item_id` BIGINT UNSIGNED NULL,
    `notas` TEXT NULL,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `id`(`id`),
    INDEX `encomenda_id`(`encomenda_id`),
    INDEX `estado`(`estado`),
    INDEX `peca_id`(`peca_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `alertas_sistema` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tipo` VARCHAR(50) NOT NULL,
    `titulo` VARCHAR(255) NOT NULL,
    `descricao` TEXT NULL,
    `severidade` VARCHAR(20) NULL DEFAULT 'normal',
    `referencia_id` BIGINT UNSIGNED NULL,
    `referencia_tipo` VARCHAR(50) NULL,
    `lido` BOOLEAN NULL DEFAULT false,
    `criado_em` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `lido_em` TIMESTAMP(0) NULL,

    UNIQUE INDEX `id`(`id`),
    INDEX `criado_em`(`criado_em`),
    INDEX `lido`(`lido`),
    INDEX `severidade`(`severidade`),
    INDEX `tipo`(`tipo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `agendamentos` ADD CONSTRAINT `agendamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_orcamento` ADD CONSTRAINT `itens_orcamento_orcamento_id_fkey` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `itens_ordem_trabalho` ADD CONSTRAINT `itens_ordem_trabalho_ordem_trabalho_id_fkey` FOREIGN KEY (`ordem_trabalho_id`) REFERENCES `ordens_trabalho`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modelos` ADD CONSTRAINT `modelos_marca_id_fkey` FOREIGN KEY (`marca_id`) REFERENCES `marcas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_veiculo_id_fkey` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_veiculo_id_fkey` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_mecanico_id_fkey` FOREIGN KEY (`mecanico_id`) REFERENCES `mecanicos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_orcamento_id_fkey` FOREIGN KEY (`orcamento_id`) REFERENCES `orcamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordens_trabalho` ADD CONSTRAINT `ordens_trabalho_agendamento_id_fkey` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `veiculos` ADD CONSTRAINT `veiculos_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `encomendas_pecas` ADD CONSTRAINT `encomendas_pecas_ibfk_1` FOREIGN KEY (`fornecedor_id`) REFERENCES `fornecedores`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_encomenda_peca` ADD CONSTRAINT `itens_encomenda_peca_ibfk_1` FOREIGN KEY (`encomenda_id`) REFERENCES `encomendas_pecas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itens_encomenda_peca` ADD CONSTRAINT `itens_encomenda_peca_ibfk_2` FOREIGN KEY (`peca_id`) REFERENCES `pecas`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

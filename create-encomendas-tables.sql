-- Create encomendas_pecas table
CREATE TABLE IF NOT EXISTS encomendas_pecas (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT UNIQUE,
  numero_encomenda VARCHAR(20) UNIQUE NOT NULL,
  fornecedor_id INT NOT NULL,
  data_encomenda DATE NOT NULL,
  data_entrega_estimada DATE,
  data_entrega_real DATE,
  estado VARCHAR(20) DEFAULT 'pendente',
  custo_total DECIMAL(10,2),
  notas TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  criado_por INT,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE,
  INDEX (fornecedor_id),
  INDEX (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create itens_encomenda_peca table
CREATE TABLE IF NOT EXISTS itens_encomenda_peca (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT UNIQUE,
  encomenda_id BIGINT UNSIGNED NOT NULL,
  peca_id BIGINT UNSIGNED NOT NULL,
  quantidade_encomendada INT NOT NULL,
  quantidade_recebida INT DEFAULT 0,
  preco_unitario DECIMAL(10,2),
  preco_total DECIMAL(10,2),
  estado VARCHAR(20) DEFAULT 'pendente',
  ordem_trabalho_item_id BIGINT UNSIGNED,
  notas TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (encomenda_id) REFERENCES encomendas_pecas(id) ON DELETE CASCADE,
  FOREIGN KEY (peca_id) REFERENCES pecas(id),
  INDEX (encomenda_id),
  INDEX (peca_id),
  INDEX (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create alertas_sistema table
CREATE TABLE IF NOT EXISTS alertas_sistema (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT UNIQUE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  severidade VARCHAR(20) DEFAULT 'normal',
  referencia_id BIGINT UNSIGNED,
  referencia_tipo VARCHAR(50),
  lido BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lido_em TIMESTAMP,
  INDEX (tipo),
  INDEX (severidade),
  INDEX (lido),
  INDEX (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

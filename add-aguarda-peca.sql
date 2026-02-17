ALTER TABLE itens_ordem_trabalho ADD COLUMN aguarda_peca BOOLEAN DEFAULT FALSE;
ALTER TABLE ordens_trabalho ADD COLUMN prioridade VARCHAR(20) DEFAULT 'normal';

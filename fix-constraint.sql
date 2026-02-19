ALTER TABLE carrepairshopgest.ordens_trabalho DROP CHECK ordens_trabalho_chk_1;
ALTER TABLE carrepairshopgest.ordens_trabalho ADD CONSTRAINT ordens_trabalho_chk_1 CHECK (estado IN ('em_andamento', 'aguarda_peca', 'concluido', 'entregue', 'cancelado'));

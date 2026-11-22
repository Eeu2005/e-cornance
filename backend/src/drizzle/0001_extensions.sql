-- Custom SQL migration file, put your code below! --
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX produtos_nome_fts_idx
ON produtos
USING GIN (to_tsvector('portuguese', produtos.nome));





CREATE INDEX produtos_nome_trgm_idx
ON produtos
USING GIN (nome gin_trgm_ops);
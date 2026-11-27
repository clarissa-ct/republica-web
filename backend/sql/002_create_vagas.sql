-- Execute no Query Tool conectado ao banco republica_db.
CREATE TABLE IF NOT EXISTS vagas (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  republica_id INTEGER NOT NULL REFERENCES republicas(id) ON DELETE RESTRICT,
  valor_mensal NUMERIC(10, 2) NOT NULL CHECK (valor_mensal > 0),
  quantidade_disponivel INTEGER NOT NULL CHECK (quantidade_disponivel >= 0),
  descricao TEXT NOT NULL CHECK (btrim(descricao) <> ''),
  contato_divulgacao VARCHAR(120) NOT NULL CHECK (btrim(contato_divulgacao) <> ''),
  situacao VARCHAR(12) NOT NULL DEFAULT 'DISPONIVEL'
    CHECK (situacao IN ('DISPONIVEL', 'OCUPADA')),
  criada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ck_vagas_situacao_quantidade CHECK (
    (situacao = 'DISPONIVEL' AND quantidade_disponivel > 0)
    OR (situacao = 'OCUPADA' AND quantidade_disponivel = 0)
  )
);

CREATE INDEX IF NOT EXISTS ix_vagas_republica ON vagas (republica_id);
CREATE INDEX IF NOT EXISTS ix_vagas_publicas_recentes
  ON vagas (criada_em DESC, id DESC)
  WHERE situacao = 'DISPONIVEL';

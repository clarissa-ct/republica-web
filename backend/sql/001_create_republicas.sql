-- Já executado nas etapas anteriores. Mantido aqui como referência.
CREATE TABLE IF NOT EXISTS republicas (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cidade VARCHAR(120) NOT NULL,
  descricao TEXT
);

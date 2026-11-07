CREATE TABLE IF NOT EXISTS animais (
    id UUID PRIMARY KEY,
    identificacao VARCHAR(100) NOT NULL,
    nome VARCHAR(150),
    raca VARCHAR(100),
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    data_nascimento DATE,
    criado_em TIMESTAMPTZ NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY,
    animal_id UUID NOT NULL REFERENCES animais(id),
    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('PESAGEM', 'VACINACAO')),
    data_evento TIMESTAMPTZ NOT NULL,
    descricao TEXT,
    peso_kg NUMERIC(10, 2),
    vacina VARCHAR(200),
    criado_em TIMESTAMPTZ NOT NULL,
    CONSTRAINT chk_evento_dados CHECK (
        (tipo = 'PESAGEM' AND peso_kg > 0)
        OR
        (tipo = 'VACINACAO' AND NULLIF(TRIM(vacina), '') IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_eventos_animal_data
ON eventos(animal_id, data_evento DESC);
-- Entidades adicionais (fase 1): sem alterar as rotas existentes.
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY, nome VARCHAR(150) NOT NULL,
  email VARCHAR(200), telefone VARCHAR(30), criado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS localizacoes (
  id UUID PRIMARY KEY, endereco TEXT, municipio VARCHAR(150) NOT NULL,
  uf CHAR(2) NOT NULL, latitude DOUBLE PRECISION, longitude DOUBLE PRECISION
);
CREATE TABLE IF NOT EXISTS propriedades (
  id UUID PRIMARY KEY, usuario_id UUID NOT NULL REFERENCES usuarios(id),
  localizacao_id UUID REFERENCES localizacoes(id),
  nome VARCHAR(150) NOT NULL, codigo_estabelecimento VARCHAR(100),
  criado_em TIMESTAMPTZ NOT NULL
);
CREATE TABLE IF NOT EXISTS identificacoes (
  id UUID PRIMARY KEY, animal_id UUID NOT NULL REFERENCES animais(id),
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('QR_INTERNO','OFICIAL_INFORMADO')),
  codigo VARCHAR(200) NOT NULL, criado_em TIMESTAMPTZ NOT NULL,
  UNIQUE(animal_id, tipo)
);
ALTER TABLE animais ADD COLUMN IF NOT EXISTS propriedade_id UUID REFERENCES propriedades(id);

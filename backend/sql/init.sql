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
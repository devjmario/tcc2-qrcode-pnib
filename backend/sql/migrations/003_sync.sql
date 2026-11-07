BEGIN;

ALTER TABLE animais
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id);

ALTER TABLE animais
ADD COLUMN IF NOT EXISTS propriedade_id UUID REFERENCES propriedades(id);

CREATE INDEX IF NOT EXISTS idx_animais_usuario
ON animais(usuario_id);

CREATE INDEX IF NOT EXISTS idx_propriedades_usuario
ON propriedades(usuario_id);

CREATE INDEX IF NOT EXISTS idx_historico_alteracoes_animal
ON historico_alteracoes_animais(animal_id, alterado_em DESC);

COMMIT;
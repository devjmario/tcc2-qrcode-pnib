import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("bovinos.db");

export function initDatabase() {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS animais (
      id TEXT PRIMARY KEY NOT NULL,
      identificacao TEXT NOT NULL,
      nome TEXT,
      raca TEXT,
      sexo TEXT NOT NULL,
      data_nascimento TEXT,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id TEXT PRIMARY KEY NOT NULL,
      animal_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      data_evento TEXT NOT NULL,
      descricao TEXT,
      peso_kg REAL,
      vacina TEXT,
      criado_em TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (animal_id) REFERENCES animais(id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS localizacoes (
      id TEXT PRIMARY KEY NOT NULL,
      endereco TEXT,
      municipio TEXT NOT NULL,
      uf TEXT NOT NULL,
      latitude REAL,
      longitude REAL
    );

    CREATE TABLE IF NOT EXISTS propriedades (
      id TEXT PRIMARY KEY NOT NULL,
      usuario_id TEXT NOT NULL REFERENCES usuarios(id),
      localizacao_id TEXT REFERENCES localizacoes(id),
      nome TEXT NOT NULL,
      codigo_estabelecimento TEXT,
      criado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS identificacoes (
      id TEXT PRIMARY KEY NOT NULL,
      animal_id TEXT NOT NULL REFERENCES animais(id),
      tipo TEXT NOT NULL
        CHECK (tipo IN ('QR_INTERNO', 'OFICIAL_INFORMADO')),
      codigo TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      UNIQUE(animal_id, tipo)
    );

    CREATE TABLE IF NOT EXISTS historico_alteracoes_animais (
      id TEXT PRIMARY KEY NOT NULL,
      animal_id TEXT NOT NULL,
      usuario_id TEXT,
      campo TEXT NOT NULL,
      valor_anterior TEXT,
      valor_novo TEXT,
      alterado_em TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (animal_id) REFERENCES animais(id)
    );

    CREATE INDEX IF NOT EXISTS idx_eventos_animal
      ON eventos(animal_id, data_evento);

    CREATE INDEX IF NOT EXISTS idx_historico_alteracoes_animal
      ON historico_alteracoes_animais(animal_id, alterado_em DESC);
  `);

  // Mantém os dados existentes ao adicionar propriedade.
  const colunas = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(animais)"
  );

  if (!colunas.some((c) => c.name === "propriedade_id")) {
    db.execSync(`
      ALTER TABLE animais
      ADD COLUMN propriedade_id TEXT REFERENCES propriedades(id)
    `);
  }

  // Adiciona controle de sincronização aos animais.
  const colunasSync = db.getAllSync<{ name: string }>(
    "PRAGMA table_info(animais)"
  );

  if (!colunasSync.some((c) => c.name === "sincronizado")) {
    db.execSync(`
      ALTER TABLE animais
      ADD COLUMN sincronizado INTEGER NOT NULL DEFAULT 0
    `);
  }
}
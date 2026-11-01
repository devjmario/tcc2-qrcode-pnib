
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

    CREATE INDEX IF NOT EXISTS idx_eventos_animal
    ON eventos(animal_id, data_evento);
  `);
}

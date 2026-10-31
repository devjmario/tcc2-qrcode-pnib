import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("bovinos.db");

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS animais (
      id TEXT PRIMARY KEY NOT NULL,
      identificacao TEXT NOT NULL,
      nome TEXT,
      raca TEXT,
      sexo TEXT NOT NULL,
      data_nascimento TEXT,
      criado_em TEXT NOT NULL
    );
  `);
}

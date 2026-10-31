import * as Crypto from "expo-crypto";
import { db } from "./database";

export type Animal = {
  id: string;
  identificacao: string;
  nome: string | null;
  raca: string | null;
  sexo: string;
  data_nascimento: string | null;
  criado_em: string;
};

export type NovoAnimal = {
  identificacao: string;
  nome?: string;
  raca?: string;
  sexo: string;
  data_nascimento?: string;
};

export function cadastrarAnimal(animal: NovoAnimal) {
  const id = Crypto.randomUUID();

  db.runSync(
    `INSERT INTO animais
     (id, identificacao, nome, raca, sexo,
      data_nascimento, criado_em)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      animal.identificacao,
      animal.nome || null,
      animal.raca || null,
      animal.sexo,
      animal.data_nascimento || null,
      new Date().toISOString()
    ]
  );

  return id;
}

export function listarAnimais(): Animal[] {
  return db.getAllSync<Animal>(
    "SELECT * FROM animais ORDER BY criado_em DESC"
  );
}

export function buscarAnimal(id: string): Animal | null {
  return db.getFirstSync<Animal>(
    "SELECT * FROM animais WHERE id = ?",
    [id]
  );
}

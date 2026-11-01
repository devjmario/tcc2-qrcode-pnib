import * as Crypto from "expo-crypto";
import { db } from "./database";

export type TipoEvento = "VACINACAO" | "PESAGEM";

export type Evento = {
  id: string;
  animal_id: string;
  tipo: TipoEvento;
  data_evento: string;
  descricao: string | null;
  peso_kg: number | null;
  vacina: string | null;
  criado_em: string;
  sincronizado: number;
};

export type NovoEvento = {
  animal_id: string;
  tipo: TipoEvento;
  data_evento: string;
  descricao?: string;
  peso_kg?: number;
  vacina?: string;
};

export function cadastrarEvento(evento: NovoEvento): string {
  const id = Crypto.randomUUID();

  db.runSync(
    `INSERT INTO eventos (
      id,
      animal_id,
      tipo,
      data_evento,
      descricao,
      peso_kg,
      vacina,
      criado_em,
      sincronizado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    [
      id,
      evento.animal_id,
      evento.tipo,
      evento.data_evento,
      evento.descricao || null,
      evento.peso_kg ?? null,
      evento.vacina || null,
      new Date().toISOString()
    ]
  );

  return id;
}

export function listarEventosAnimal(animalId: string): Evento[] {
  return db.getAllSync<Evento>(
    `SELECT *
     FROM eventos
     WHERE animal_id = ?
     ORDER BY data_evento DESC, criado_em DESC`,
    [animalId]
  );
}
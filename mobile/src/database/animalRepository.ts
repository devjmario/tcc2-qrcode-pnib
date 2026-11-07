import * as Crypto from "expo-crypto";
import { db } from "./database";

export type Animal = {
  id: string;
  identificacao: string;
  nome: string | null;
  raca: string | null;
  sexo: string;
  data_nascimento: string | null;
  propriedade_id: string | null;
  criado_em: string;
};

export type DadosAnimal = {
  identificacao: string;
  nome?: string | null;
  raca?: string | null;
  sexo: string;
  data_nascimento?: string | null;
  propriedade_id?: string | null;
};

export type AlteracaoAnimal = {
  id: string;
  animal_id: string;
  usuario_id: string | null;
  campo: string;
  valor_anterior: string | null;
  valor_novo: string | null;
  alterado_em: string;
  sincronizado: number;
};

export function cadastrarAnimal(animal: DadosAnimal): string {
  if (!animal.identificacao.trim()) {
    throw new Error("A identificação é obrigatória.");
  }

  if (!["M", "F"].includes(animal.sexo)) {
    throw new Error("Sexo inválido.");
  }

  const id = Crypto.randomUUID();

  db.runSync(
    `INSERT INTO animais (
      id, identificacao, nome, raca, sexo,
      data_nascimento, propriedade_id, criado_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      animal.identificacao.trim(),
      animal.nome?.trim() || null,
      animal.raca?.trim() || null,
      animal.sexo,
      animal.data_nascimento || null,
      animal.propriedade_id || null,
      new Date().toISOString(),
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

export function listarAlteracoesAnimal(
  animalId: string
): AlteracaoAnimal[] {
  return db.getAllSync<AlteracaoAnimal>(
    `SELECT * FROM historico_alteracoes_animais
     WHERE animal_id = ?
     ORDER BY alterado_em DESC, id DESC`,
    [animalId]
  );
}

export function editarAnimal(
  id: string,
  dados: DadosAnimal,
  usuarioId: string
): number {
  const anterior = buscarAnimal(id);

  if (!anterior) {
    throw new Error("Animal não encontrado.");
  }

  if (!dados.identificacao.trim()) {
    throw new Error("A identificação é obrigatória.");
  }

  if (!["M", "F"].includes(dados.sexo)) {
    throw new Error("Sexo inválido.");
  }

  const novo = {
    identificacao: dados.identificacao.trim(),
    nome: dados.nome?.trim() || null,
    raca: dados.raca?.trim() || null,
    sexo: dados.sexo,
    data_nascimento: dados.data_nascimento || null,
    propriedade_id: dados.propriedade_id || null,
  };

  const campos = [
    "identificacao",
    "nome",
    "raca",
    "sexo",
    "data_nascimento",
    "propriedade_id",
  ] as const;

  let quantidade = 0;

  db.withTransactionSync(() => {
    if (novo.propriedade_id) {
      const propriedade = db.getFirstSync<{ id: string }>(
        `SELECT id FROM propriedades
         WHERE id = ? AND usuario_id = ?`,
        [novo.propriedade_id, usuarioId]
      );

      if (!propriedade) {
        throw new Error(
          "Propriedade inválida para este usuário."
        );
      }
    }

    const dataAlteracao = new Date().toISOString();

    for (const campo of campos) {
      const valorAnterior = anterior[campo];
      const valorNovo = novo[campo];

      if (valorAnterior === valorNovo) continue;

      db.runSync(
        `INSERT INTO historico_alteracoes_animais (
          id, animal_id, usuario_id, campo,
          valor_anterior, valor_novo,
          alterado_em, sincronizado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          Crypto.randomUUID(),
          id,
          usuarioId,
          campo,
          valorAnterior,
          valorNovo,
          dataAlteracao,
        ]
      );

      quantidade++;
    }

    if (quantidade > 0) {
      db.runSync(
        `UPDATE animais SET
          identificacao = ?,
          nome = ?,
          raca = ?,
          sexo = ?,
          data_nascimento = ?,
          propriedade_id = ?,
          sincronizado = 0
        WHERE id = ?`,
        [
          novo.identificacao,
          novo.nome,
          novo.raca,
          novo.sexo,
          novo.data_nascimento,
          novo.propriedade_id,
          id,
        ]
      );
    }
  });

  return quantidade;
}